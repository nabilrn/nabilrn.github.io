type D1Meta = {
  changes?: number;
};

type D1Result<T = Record<string, unknown>> = {
  results?: T[];
  success: boolean;
  meta?: D1Meta;
};

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface LegacyKVNamespace {
  get(key: string): Promise<string | null>;
}

type ExportedHandler<TEnv> = {
  fetch(request: Request, env: TEnv): Response | Promise<Response>;
};

export interface Env {
  DB: D1Database;
  LEGACY_METRICS?: LegacyKVNamespace;
  ALLOWED_ORIGIN?: string;
}

type AnalyticsPayload = {
  path?: string;
  visitorId?: string;
};

type EngagementPayload = {
  action?: string;
  visitorId?: string;
  liked?: boolean;
};

type MetricsRow = {
  views: number;
  likes: number;
  shares: number;
};

type VisitorStateRow = {
  viewed: number;
  liked: number;
};

type HourViewsRow = {
  hour: string;
  views: number;
};

type HourVisitorsRow = {
  hour: string;
  visitors: number;
};

type VisitorCountRow = {
  visitors: number;
};

type TopPageRow = {
  path: string;
  views: number;
};

const ROLLING_HOURS = 24;

function allowedOrigins(env: Env) {
  return (env.ALLOWED_ORIGIN ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function isAllowedOrigin(request: Request, env: Env) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  const allowed = allowedOrigins(env);
  return allowed.includes('*') || allowed.includes(origin);
}

function corsHeaders(request: Request, env: Env, existing?: HeadersInit) {
  const headers = new Headers(existing);
  const origin = request.headers.get('Origin');
  const allowed = allowedOrigins(env);

  if (allowed.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  } else if (origin && allowed.includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.append('Vary', 'Origin');
  } else if (!origin && allowed[0]) {
    headers.set('Access-Control-Allow-Origin', allowed[0]);
  }

  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return headers;
}

const json = (request: Request, env: Env, data: unknown, init: ResponseInit = {}) => {
  const headers = corsHeaders(request, env, init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
};

function badRequest(request: Request, env: Env, message: string) {
  return json(request, env, { error: message }, { status: 400 });
}

function extractPostId(url: URL) {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'metrics') return null;
  const postId = parts[1]?.trim();
  return postId ? postId.slice(0, 160) : null;
}

function normalizePath(input?: string) {
  if (!input) return '/';
  let path = input.trim().split('?')[0]?.split('#')[0] ?? '/';
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1 && !path.endsWith('/')) path = `${path}/`;
  return path.slice(0, 180) || '/';
}

function normalizeVisitorId(input?: string) {
  const visitorId = input?.trim();
  if (!visitorId) return null;
  return visitorId.slice(0, 128);
}

function utcHourKey(date = new Date()) {
  return date.toISOString().slice(0, 13);
}

function utcHourStart(hour: string) {
  return `${hour}:00:00.000Z`;
}

function rollingHours() {
  const currentHour = new Date();
  currentHour.setUTCMinutes(0, 0, 0);
  return Array.from({ length: ROLLING_HOURS }, (_, index) => {
    const date = new Date(currentHour);
    date.setUTCHours(date.getUTCHours() - (ROLLING_HOURS - 1 - index));
    return utcHourKey(date);
  });
}

function changed(result: D1Result) {
  return Number(result.meta?.changes ?? 0) > 0;
}

async function readMetrics(db: D1Database, postId: string) {
  const row = await db
    .prepare('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?1')
    .bind(postId)
    .first<MetricsRow>();

  return row
    ? {
        views: Number(row.views ?? 0),
        likes: Number(row.likes ?? 0),
        shares: Number(row.shares ?? 0),
      }
    : null;
}

async function seedLegacyPostMetrics(env: Env, postId: string) {
  if (!env.LEGACY_METRICS) return;

  const [viewsRaw, likesRaw, sharesRaw] = await Promise.all([
    env.LEGACY_METRICS.get(`metrics:${postId}:views`),
    env.LEGACY_METRICS.get(`metrics:${postId}:likes`),
    env.LEGACY_METRICS.get(`metrics:${postId}:shares`),
  ]);

  const views = Math.max(0, Number(viewsRaw ?? '0') || 0);
  const likes = Math.max(0, Number(likesRaw ?? '0') || 0);
  const shares = Math.max(0, Number(sharesRaw ?? '0') || 0);

  if (views === 0 && likes === 0 && shares === 0) return;

  await env.DB
    .prepare(`
      INSERT INTO post_metrics (post_id, views, likes, shares)
      VALUES (?1, ?2, ?3, ?4)
      ON CONFLICT(post_id) DO UPDATE SET
        views = MAX(post_metrics.views, excluded.views),
        likes = MAX(post_metrics.likes, excluded.likes),
        shares = MAX(post_metrics.shares, excluded.shares),
        updated_at = CURRENT_TIMESTAMP
      WHERE post_metrics.views < excluded.views
         OR post_metrics.likes < excluded.likes
         OR post_metrics.shares < excluded.shares
    `)
    .bind(postId, views, likes, shares)
    .run();
}

async function getMetrics(env: Env, postId: string) {
  await seedLegacyPostMetrics(env, postId);
  return (await readMetrics(env.DB, postId)) ?? { views: 0, likes: 0, shares: 0 };
}

async function readVisitorState(db: D1Database, postId: string, visitorId: string) {
  return db
    .prepare(`
      SELECT viewed, liked
      FROM visitor_post_state
      WHERE post_id = ?1 AND visitor_id = ?2
    `)
    .bind(postId, visitorId)
    .first<VisitorStateRow>();
}

async function seedLegacyVisitorState(env: Env, postId: string, visitorId: string) {
  if (!env.LEGACY_METRICS) return;
  if (await readVisitorState(env.DB, postId, visitorId)) return;

  const [viewedRaw, likedRaw] = await Promise.all([
    env.LEGACY_METRICS.get(`visitor:${postId}:${visitorId}:viewed`),
    env.LEGACY_METRICS.get(`visitor:${postId}:${visitorId}:liked`),
  ]);

  const viewed = viewedRaw ? 1 : 0;
  const liked = likedRaw ? 1 : 0;
  if (!viewed && !liked) return;

  await env.DB
    .prepare(`
      INSERT OR IGNORE INTO visitor_post_state (post_id, visitor_id, viewed, liked)
      VALUES (?1, ?2, ?3, ?4)
    `)
    .bind(postId, visitorId, viewed, liked)
    .run();
}

async function getEngagementState(env: Env, postId: string, visitorInput?: string) {
  const visitorId = normalizeVisitorId(visitorInput);
  const metricsPromise = getMetrics(env, postId);

  if (!visitorId) return metricsPromise;

  await seedLegacyVisitorState(env, postId, visitorId);
  const [metrics, state] = await Promise.all([
    metricsPromise,
    readVisitorState(env.DB, postId, visitorId),
  ]);

  return { ...metrics, liked: Boolean(state?.liked) };
}

async function incrementPostMetric(
  db: D1Database,
  postId: string,
  column: 'views' | 'likes' | 'shares',
  delta = 1,
) {
  if (delta >= 0) {
    await db
      .prepare(`
        INSERT INTO post_metrics (post_id, ${column})
        VALUES (?1, ?2)
        ON CONFLICT(post_id) DO UPDATE SET
          ${column} = post_metrics.${column} + excluded.${column},
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(postId, delta)
      .run();
    return;
  }

  await db
    .prepare('INSERT OR IGNORE INTO post_metrics (post_id) VALUES (?1)')
    .bind(postId)
    .run();

  await db
    .prepare(`
      UPDATE post_metrics
      SET ${column} = MAX(0, ${column} + ?2),
          updated_at = CURRENT_TIMESTAMP
      WHERE post_id = ?1
    `)
    .bind(postId, delta)
    .run();
}

async function trackSiteView(
  db: D1Database,
  pathInput: string | undefined,
  visitorInput: string | undefined,
) {
  const path = normalizePath(pathInput);
  const visitorId = normalizeVisitorId(visitorInput);
  if (!visitorId) throw new Error('Missing visitorId for analytics view.');

  const hour = utcHourKey();

  await Promise.all([
    db
      .prepare(`
        INSERT INTO analytics_hourly (hour, path, views)
        VALUES (?1, ?2, 1)
        ON CONFLICT(hour, path) DO UPDATE SET views = analytics_hourly.views + 1
      `)
      .bind(hour, path)
      .run(),
    db
      .prepare(`
        INSERT OR IGNORE INTO analytics_hourly_visitors (hour, visitor_id)
        VALUES (?1, ?2)
      `)
      .bind(hour, visitorId)
      .run(),
  ]);

  return { path };
}

async function getAnalyticsSummary(db: D1Database) {
  const hours = rollingHours();
  const startHour = hours[0] ?? utcHourKey();
  const endHour = hours.at(-1) ?? utcHourKey();

  const [viewsResult, visitorsResult, uniqueVisitorRow, topPageRow] = await Promise.all([
    db
      .prepare(`
        SELECT hour, SUM(views) AS views
        FROM analytics_hourly
        WHERE hour BETWEEN ?1 AND ?2
        GROUP BY hour
        ORDER BY hour ASC
      `)
      .bind(startHour, endHour)
      .all<HourViewsRow>(),
    db
      .prepare(`
        SELECT hour, COUNT(*) AS visitors
        FROM analytics_hourly_visitors
        WHERE hour BETWEEN ?1 AND ?2
        GROUP BY hour
        ORDER BY hour ASC
      `)
      .bind(startHour, endHour)
      .all<HourVisitorsRow>(),
    db
      .prepare(`
        SELECT COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_hourly_visitors
        WHERE hour BETWEEN ?1 AND ?2
      `)
      .bind(startHour, endHour)
      .first<VisitorCountRow>(),
    db
      .prepare(`
        SELECT path, SUM(views) AS views
        FROM analytics_hourly
        WHERE hour BETWEEN ?1 AND ?2
        GROUP BY path
        ORDER BY views DESC, path ASC
        LIMIT 1
      `)
      .bind(startHour, endHour)
      .first<TopPageRow>(),
  ]);

  const viewsByHour = new Map(
    (viewsResult.results ?? []).map((row) => [row.hour, Number(row.views ?? 0)]),
  );
  const visitorsByHour = new Map(
    (visitorsResult.results ?? []).map((row) => [row.hour, Number(row.visitors ?? 0)]),
  );

  const last24Hours = hours.map((hour) => ({
    hour: utcHourStart(hour),
    views: viewsByHour.get(hour) ?? 0,
    visitors: visitorsByHour.get(hour) ?? 0,
  }));
  const pageviews = last24Hours.reduce((sum, point) => sum + point.views, 0);

  return {
    generatedAt: new Date().toISOString(),
    visitors: Number(uniqueVisitorRow?.visitors ?? 0),
    pageviews,
    topPage: topPageRow
      ? { path: topPageRow.path, views: Number(topPageRow.views ?? 0) }
      : { path: '/', views: 0 },
    last24Hours,
  };
}

async function registerArticleView(env: Env, postId: string, visitorId: string) {
  await Promise.all([
    seedLegacyPostMetrics(env, postId),
    seedLegacyVisitorState(env, postId, visitorId),
  ]);

  const stateWrite = await env.DB
    .prepare(`
      INSERT INTO visitor_post_state (post_id, visitor_id, viewed, liked)
      VALUES (?1, ?2, 1, 0)
      ON CONFLICT(post_id, visitor_id) DO UPDATE SET
        viewed = 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE visitor_post_state.viewed = 0
    `)
    .bind(postId, visitorId)
    .run();

  if (changed(stateWrite)) {
    await incrementPostMetric(env.DB, postId, 'views', 1);
  }

  await trackSiteView(env.DB, `/blog/${postId}/`, visitorId);
}

async function setLikeState(
  env: Env,
  postId: string,
  visitorId: string,
  requestedLiked?: boolean,
) {
  await Promise.all([
    seedLegacyPostMetrics(env, postId),
    seedLegacyVisitorState(env, postId, visitorId),
  ]);

  const existing = await readVisitorState(env.DB, postId, visitorId);
  const desiredLiked = typeof requestedLiked === 'boolean'
    ? requestedLiked
    : !Boolean(existing?.liked);

  const stateWrite = await env.DB
    .prepare(`
      INSERT INTO visitor_post_state (post_id, visitor_id, viewed, liked)
      VALUES (?1, ?2, 0, ?3)
      ON CONFLICT(post_id, visitor_id) DO UPDATE SET
        liked = excluded.liked,
        updated_at = CURRENT_TIMESTAMP
      WHERE visitor_post_state.liked <> excluded.liked
    `)
    .bind(postId, visitorId, desiredLiked ? 1 : 0)
    .run();

  if (changed(stateWrite)) {
    await incrementPostMetric(env.DB, postId, 'likes', desiredLiked ? 1 : -1);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method === 'POST' && !isAllowedOrigin(request, env)) {
      return json(request, env, { error: 'Origin not allowed' }, { status: 403 });
    }

    if (url.pathname === '/analytics/summary') {
      if (request.method !== 'GET') {
        return json(request, env, { error: 'Method not allowed' }, { status: 405 });
      }
      return json(request, env, await getAnalyticsSummary(env.DB));
    }

    if (url.pathname === '/analytics/view') {
      if (request.method !== 'POST') {
        return json(request, env, { error: 'Method not allowed' }, { status: 405 });
      }

      let payload: AnalyticsPayload = {};
      try {
        payload = await request.json();
      } catch {
        return badRequest(request, env, 'Invalid JSON payload.');
      }

      const visitorId = normalizeVisitorId(payload.visitorId);
      if (!visitorId) return badRequest(request, env, 'Missing visitorId for analytics view.');

      await trackSiteView(env.DB, payload.path, visitorId);
      return json(request, env, { ok: true });
    }

    const postId = extractPostId(url);
    if (!postId) return json(request, env, { error: 'Not found' }, { status: 404 });

    if (request.method === 'GET') {
      const visitorId = normalizeVisitorId(url.searchParams.get('visitorId') ?? undefined);
      return json(request, env, await getEngagementState(env, postId, visitorId ?? undefined));
    }

    if (request.method !== 'POST') {
      return json(request, env, { error: 'Method not allowed' }, { status: 405 });
    }

    let payload: EngagementPayload = {};
    try {
      payload = await request.json();
    } catch {
      return badRequest(request, env, 'Invalid JSON payload.');
    }

    const visitorId = normalizeVisitorId(payload.visitorId);
    const action = payload.action;
    if (!action) return badRequest(request, env, 'Missing action.');

    if (action === 'view') {
      if (!visitorId) return badRequest(request, env, 'Missing visitorId for view.');

      await registerArticleView(env, postId, visitorId);
      return json(request, env, await getEngagementState(env, postId, visitorId));
    }

    if (action === 'like') {
      if (!visitorId) return badRequest(request, env, 'Missing visitorId for like.');

      await setLikeState(env, postId, visitorId, payload.liked);
      return json(request, env, await getEngagementState(env, postId, visitorId));
    }

    if (action === 'share') {
      await seedLegacyPostMetrics(env, postId);
      await incrementPostMetric(env.DB, postId, 'shares', 1);
      return json(request, env, await getEngagementState(env, postId, visitorId ?? undefined));
    }

    return badRequest(request, env, 'Unknown action.');
  },
} satisfies ExportedHandler<Env>;
