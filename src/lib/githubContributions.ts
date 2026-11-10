import savedSnapshot from '../data/githubContributionsSnapshot.json';

export type GitHubContributionActivity = {
    date: string;
    count: number;
    level: number;
};

type GitHubContributionsResponse = {
    contributions?: GitHubContributionActivity[];
};

const DEFAULT_API_BASE = 'https://github-contributions-api.jogruber.de/v4';

const isActivity = (value: unknown): value is GitHubContributionActivity => {
    if (!value || typeof value !== 'object') return false;
    const activity = value as Partial<GitHubContributionActivity>;
    return (
        typeof activity.date === 'string' &&
        typeof activity.count === 'number' &&
        typeof activity.level === 'number'
    );
};


const MIN_DAYS = 300;
const FETCH_TIMEOUT_MS = 8000;

function validCalendar(days: GitHubContributionActivity[]): GitHubContributionActivity[] {
    const valid = days.filter((day) =>
        isActivity(day) &&
        /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
        Number.isSafeInteger(day.count) && day.count >= 0 &&
        Number.isInteger(day.level) && day.level >= 0 && day.level <= 4
    );
    const unique = new Map(valid.map((day) => [day.date, day]));
    if (valid.length < MIN_DAYS || unique.size !== valid.length) return [];
    return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function htmlAttribute(attributes: string, key: string): string | undefined {
    const match = attributes.match(new RegExp('(?:^|\\s)' + key + '\\s*=\\s*["\\x27]([^"\\x27]*)["\\x27]', 'i'));
    return match?.[1];
}

/**
 * Read the public contribution calendar directly from GitHub.
 * Each calendar cell is joined to its exact count by the linked tool-tip.
 * Reject incomplete markup instead of inventing contribution counts.
 */
export function parseGitHubContributionHtml(html: string): GitHubContributionActivity[] {
    const counts = new Map<string, number>();
    for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
        const id = htmlAttribute(match[1], 'for');
        const label = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const numeric = label.match(/^([\d,]+)\s+contributions?\b/i);
        const count = /^No contributions?\b/i.test(label) ? 0 :
            numeric ? Number(numeric[1].replace(/,/g, '')) : NaN;
        if (id && Number.isSafeInteger(count) && count >= 0) counts.set(id, count);
    }

    const days: GitHubContributionActivity[] = [];
    for (const match of html.matchAll(/<td\b([^>]*)>/gi)) {
        const attributes = match[1];
        const date = htmlAttribute(attributes, 'data-date');
        const levelText = htmlAttribute(attributes, 'data-level');
        if (!date || levelText === undefined) continue;
        const level = Number(levelText);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isInteger(level) || level < 0 || level > 4) continue;

        const id = htmlAttribute(attributes, 'id');
        const countText = htmlAttribute(attributes, 'data-count');
        const count = countText && /^\d+$/.test(countText) ? Number(countText) : (id ? counts.get(id) : undefined);
        if (count === undefined && level > 0) return [];
        days.push({ date, level, count: count ?? 0 });
    }
    return validCalendar(days);
}

async function getResponse(url: string, accept: string): Promise<Response> {
    const response = await fetch(url, {
        headers: { accept, 'user-agent': 'nabilrn-portfolio/1.0' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response;
}

/**
 * Fetch a complete rolling-year calendar at build time without requiring a token.
 * The official GitHub calendar is primary; the previous public JSON API is a fallback.
 * Error logs distinguish an unreachable source from a genuinely empty contribution day.
 */
export async function getGitHubContributions(
    username: string,
    apiBase = DEFAULT_API_BASE,
): Promise<GitHubContributionActivity[]> {
    // MyPaaS builds must be deterministic: use the last verified GitHub Actions snapshot.
    // Network fetching is only a bootstrap fallback until the first refresh succeeds.
    if (savedSnapshot.username === username) {
        const cached = validCalendar(savedSnapshot.contributions);
        if (cached.length > 0) return cached;
    }

    const user = encodeURIComponent(username);

    try {
        const response = await getResponse('https://github.com/users/' + user + '/contributions', 'text/html');
        const days = parseGitHubContributionHtml(await response.text());
        if (days.length > 0) return days;
        console.warn('[GitHub Activity] GitHub calendar returned incomplete data');
    } catch (error) {
        console.warn('[GitHub Activity] GitHub calendar failed:', error);
    }

    try {
        const url = apiBase.replace(/\/+$/, '') + '/' + user + '?y=last';
        const response = await getResponse(url, 'application/json');
        const payload = (await response.json()) as GitHubContributionsResponse;
        const days = validCalendar(Array.isArray(payload?.contributions) ? payload.contributions : []);
        if (days.length > 0) return days;
        console.warn('[GitHub Activity] JSON API returned incomplete data');
    } catch (error) {
        console.warn('[GitHub Activity] JSON API failed:', error);
    }

    console.error('[GitHub Activity] All sources unavailable during static build');
    return [];
}
