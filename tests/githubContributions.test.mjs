import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getGitHubContributions, parseGitHubContributionHtml } from '../src/lib/githubContributions.ts';

const firstDate = Date.UTC(2025, 0, 1);
const makeDays = () => Array.from({ length: 365 }, (_, index) => ({
    date: new Date(firstDate + index * 86400000).toISOString().slice(0, 10),
    count: index === 10 ? 3 : 0,
    level: index === 10 ? 2 : 0,
}));

const makeHtml = () => makeDays().map((day, index) =>
    '<td id="day-' + index + '" data-level="' + day.level + '" data-date="' + day.date + '"></td>' +
    '<tool-tip for="day-' + index + '">' +
    (day.count ? day.count + ' contributions' : 'No contributions') +
    ' on that day</tool-tip>'
).join('\n');

async function withMockFetch(mock, callback) {
    const previous = globalThis.fetch;
    globalThis.fetch = mock;
    try {
        await callback();
    } finally {
        globalThis.fetch = previous;
    }
}

test('parses the exact counts of GitHub public HTML calendar', () => {
    const days = parseGitHubContributionHtml(makeHtml());
    assert.equal(days.length, 365);
    assert.deepEqual(days[10], { date: makeDays()[10].date, level: 2, count: 3 });
});

test('rejects missing counts instead of silently reporting zero', () => {
    const html = makeHtml().replace(/<tool-tip for="day-10">[\s\S]*?<\/tool-tip>/, '');
    assert.deepEqual(parseGitHubContributionHtml(html), []);
});

test('prefers a complete calendar from GitHub', async () => {
    await withMockFetch(async (url) => {
        assert.match(url, /github\.com\/users\/nabilrn\/contributions/);
        return new Response(makeHtml(), { status: 200 });
    }, async () => {
        const days = await getGitHubContributions('nabilrn');
        assert.equal(days[10].count, 3);
    });
});

test('falls back to the JSON API after GitHub returns 503', async () => {
    let requests = 0;
    await withMockFetch(async () => {
        requests++;
        return requests === 1
            ? new Response('Unavailable', { status: 503 })
            : Response.json({ contributions: makeDays() });
    }, async () => {
        const days = await getGitHubContributions('nabilrn');
        assert.equal(days.length, 365);
        assert.equal(days[10].count, 3);
        assert.equal(requests, 2);
    });
});

test('rejects truncated calendars instead of publishing misleading totals', async () => {
    let requests = 0;
    await withMockFetch(async () => {
        requests++;
        return requests === 1
            ? new Response('Unavailable', { status: 503 })
            : Response.json({ contributions: makeDays().slice(0, 3) });
    }, async () => {
        assert.deepEqual(await getGitHubContributions('nabilrn'), []);
    });
});
