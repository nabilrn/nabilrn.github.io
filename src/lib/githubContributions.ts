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

/**
 * Fetches one rolling year of GitHub contribution activity.
 *
 * Data source follows the same API contract used by ChanhDai's open-source
 * GitHub Contributions component:
 * https://github.com/grubersjoe/github-contributions-api
 *
 * The site is statically generated, so this runs at build time and fails soft
 * to an empty dataset if the public API is unavailable.
 */
export async function getGitHubContributions(
    username: string,
    apiBase = DEFAULT_API_BASE,
): Promise<GitHubContributionActivity[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
        const response = await fetch(`${apiBase}/${encodeURIComponent(username)}?y=last`, {
            headers: {
                accept: 'application/json',
                'user-agent': 'nabilrizkinavisa.me portfolio build',
            },
            signal: controller.signal,
        });

        if (!response.ok) return [];

        const payload = (await response.json()) as GitHubContributionsResponse;
        return (payload.contributions ?? [])
            .filter(isActivity)
            .map((activity) => ({
                date: activity.date,
                count: Math.max(0, activity.count),
                level: Math.max(0, Math.min(4, activity.level)),
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    } catch {
        return [];
    } finally {
        clearTimeout(timeout);
    }
}
