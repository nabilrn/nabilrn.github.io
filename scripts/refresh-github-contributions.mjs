#!/usr/bin/env node
/**
 * Refresh the committed GitHub contribution snapshot outside the MyPaaS build.
 * Prefer GitHub's authenticated GraphQL API; use the public JSON API if unavailable.
 * Never replace a valid snapshot with an empty/partial response.
 */
import { writeFile, rename, unlink } from 'node:fs/promises';

const username = 'nabilrn';
const output = new URL('../src/data/githubContributionsSnapshot.json', import.meta.url);
const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
const MIN_DAYS = 300;
const timeoutMs = 12000;

function normalize(days) {
  if (!Array.isArray(days)) throw new Error('Contribution calendar is not an array');
  const result = [];
  const seen = new Set();
  for (const day of days) {
    const date = day?.date;
    const count = day?.count;
    const level = day?.level;
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isSafeInteger(count) || count < 0 ||
        !Number.isInteger(level) || level < 0 || level > 4 || seen.has(date)) {
      throw new Error('Invalid or duplicate contribution day');
    }
    seen.add(date);
    result.push({ date, count, level });
  }
  if (result.length < MIN_DAYS) throw new Error('Incomplete calendar (' + result.length + ' days)');
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { accept: 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error('HTTP ' + response.status + ' from ' + url);
  return response.json();
}

async function graphql() {
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured');
  const payload = await request('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      'user-agent': 'nabilrn-portfolio-refresh',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: 'query ($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar { weeks { contributionDays { date contributionCount contributionLevel } } } } } }',
      variables: { login: username },
    }),
  });
  if (payload.errors?.length) throw new Error(payload.errors.map(e => e.message).join('; '));
  const weeks = payload?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks)) throw new Error('Missing GraphQL calendar');
  return normalize(weeks.flatMap(week => week.contributionDays.map(day => ({
    date: day.date,
    count: day.contributionCount,
    level: levels[day.contributionLevel],
  }))));
}

async function publicApi() {
  const payload = await request('https://github-contributions-api.jogruber.de/v4/' + username + '?y=last');
  return normalize(payload?.contributions);
}

let contributions;
let source;
try {
  contributions = await graphql();
  source = 'github-graphql';
} catch (error) {
  console.warn('GitHub GraphQL unavailable:', error.message);
  try {
    contributions = await publicApi();
    source = 'public-api';
  } catch (fallbackError) {
    console.error('GitHub contribution refresh failed; existing snapshot preserved:', fallbackError.message);
    process.exitCode = 1;
  }
}

if (contributions) {
  const content = JSON.stringify({ username, updatedAt: new Date().toISOString(), source, contributions }, null, 2) + '\n';
  const temporary = new URL('../src/data/.githubContributionsSnapshot.tmp', import.meta.url);
  try {
    await writeFile(temporary, content);
    await rename(temporary, output);
  } finally {
    await unlink(temporary).catch(() => {});
  }
  console.log('Saved ' + contributions.length + ' GitHub contribution days from ' + source);
}
