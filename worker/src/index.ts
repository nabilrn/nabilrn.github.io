export interface Env {
  METRICS: KVNamespace;
  ALLOWED_ORIGIN?: string;
}

type AnalyticsPayload = {
  path?: string;
  visitorId?: string;
};

type EngagementPayload = {
  action?: string;
  visitorId?: string;
};

const ANALYTICS_PREFIX = 'analytics:';
const DAILY_VISITOR_TTL_SECONDS = 35 * 24 * 60 * 60;

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
  return new Response(JSON.stringify(data), { ...init, headers });
};

function badRequest(request: Request, env: Env, message: string) {
  return json(request, env, { error: message }, { status: 400 });
}

function extractPostId(url: URL) {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'metrics') return null;
  return parts[1];
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

function jakartaDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

async function getMetrics(kv: KVNamespace, postId: string) {
  const [views, likes, shares] = await Promise.all([
    kv.get(`metrics:${postId}:views`),
    kv.get(`metrics:${postId}:likes`),
    kv.get(`metrics:${postId}:shares`),
  ]);
  return {
    views: Number(views ?? '0'),
    likes: Number(likes ?? '0'),
    shares: Number(shares ?? '0'),
  };
}

async function increment(kv: KVNamespace, key: string, delta = 1) {
  const current = Number((await kv.get(key)) ?? '0');
  const next = Math.max(0, current + delta);
  await kv.put(key, String(next));
  return next;
}

async function trackSiteView(kv: KVNamespace, pathInput: string | undefined, visitorInput: string | undefined) {
  const path = normalizePath(pathInput);
  const visitorId = normalizeVisitorId(visitorInput);
  if (!visitorId) throw new Error('Missing visitorId for analytics view.');

  const day = jakartaDateKey();
  const encodedPath = encodeURIComponent(path);
  const allTimeVisitorKey = `${ANALYTICS_PREFIX}visitor:${visitorId}`;
  const dailyVisitorKey = `${ANALYTICS_PREFIX}day:${day}:visitor:${visitorId}`;

  const [knownVisitor, knownToday] = await Promise.all([
    kv.get(allTimeVisitorKey),
    kv.get(dailyVisitorKey),
  ]);

  await Promise.all([
    increment(kv, `${ANALYTICS_PREFIX}pageviews`),
    increment(kv, `${ANALYTICS_PREFIX}page:${encodedPath}:views`),
    increment(kv, `${ANALYTICS_PREFIX}day:${day}:views`),
  ]);

  const uniqueWrites: Promise<unknown>[] = [];
  if (!knownVisitor) {
    uniqueWrites.push(
      kv.put(allTimeVisitorKey, '1'),
      increment(kv, `${ANALYTICS_PREFIX}visitors`),
    );
  }
  if (!knownToday) {
    uniqueWrites.push(
      kv.put(dailyVisitorKey, '1', { expirationTtl: DAILY_VISITOR_TTL_SECONDS }),
      increment(kv, `${ANALYTICS_PREFIX}day:${day}:visitors`),
    );
  }
  if (uniqueWrites.length) await Promise.all(uniqueWrites);

  return { path };
}

async function listKeysByPrefix(kv: KVNamespace, prefix: string) {
  const names: string[] = [];
  let cursor: string | undefined;

  do {
    const page = await kv.list({ prefix, ...(cursor ? { cursor } : {}) });
    names.push(...page.keys.map((key) => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return names;
}

async function getAnalyticsSummary(kv: KVNamespace) {
  const [pageviewsRaw, visitorsRaw, pageKeys] = await Promise.all([
    kv.get(`${ANALYTICS_PREFIX}pageviews`),
    kv.get(`${ANALYTICS_PREFIX}visitors`),
    listKeysByPrefix(kv, `${ANALYTICS_PREFIX}page:`),
  ]);

  const now = new Date();
  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now.getTime() - (29 - index) * 86_400_000);
    return jakartaDateKey(date);
  });

  const dailyValues = await Promise.all(
    days.map(async (date) => {
      const [views, visitors] = await Promise.all([
        kv.get(`${ANALYTICS_PREFIX}day:${date}:views`),
        kv.get(`${ANALYTICS_PREFIX}day:${date}:visitors`),
      ]);
      return {
        date,
        views: Number(views ?? '0'),
        visitors: Number(visitors ?? '0'),
      };
    }),
  );

  const pageCounts = await Promise.all(
    pageKeys
      .filter((name) => name.endsWith(':views'))
      .map(async (name) => {
        const encoded = name.slice(`${ANALYTICS_PREFIX}page:`.length, -':views'.length);
        const path = decodeURIComponent(encoded);
        return {
          path,
          views: Number((await kv.get(name)) ?? '0'),
        };
      }),
  );

  pageCounts.sort((a, b) => b.views - a.views || a.path.localeCompare(b.path));
  const topPage = pageCounts[0] ?? { path: '/', views: 0 };

  return {
    visitors: Number(visitorsRaw ?? '0'),
    pageviews: Number(pageviewsRaw ?? '0'),
    topPage,
    last30Days: dailyValues,
  };
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
      return json(request, env, await getAnalyticsSummary(env.METRICS));
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

      await trackSiteView(env.METRICS, payload.path, visitorId);
      return json(request, env, { ok: true });
    }

    const postId = extractPostId(url);
    if (!postId) return json(request, env, { error: 'Not found' }, { status: 404 });

    if (request.method === 'GET') {
      return json(request, env, await getMetrics(env.METRICS, postId));
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

    const kv = env.METRICS;

    if (action === 'view') {
      if (!visitorId) return badRequest(request, env, 'Missing visitorId for view.');
      const viewedKey = `visitor:${postId}:${visitorId}:viewed`;
      const already = await kv.get(viewedKey);
      if (!already) {
        await kv.put(viewedKey, '1');
        await increment(kv, `metrics:${postId}:views`);
      }

      // Existing blog traffic also feeds the lightweight site analytics stream.
      await trackSiteView(kv, `/blog/${postId}/`, visitorId);
      return json(request, env, await getMetrics(kv, postId));
    }

    if (action === 'like') {
      if (!visitorId) return badRequest(request, env, 'Missing visitorId for like.');
      const likedKey = `visitor:${postId}:${visitorId}:liked`;
      const already = await kv.get(likedKey);
      let liked: boolean;
      if (already) {
        await kv.delete(likedKey);
        await increment(kv, `metrics:${postId}:likes`, -1);
        liked = false;
      } else {
        await kv.put(likedKey, '1');
        await increment(kv, `metrics:${postId}:likes`);
        liked = true;
      }
      const metrics = await getMetrics(kv, postId);
      return json(request, env, { ...metrics, liked });
    }

    if (action === 'share') {
      await increment(kv, `metrics:${postId}:shares`);
      return json(request, env, await getMetrics(kv, postId));
    }

    return badRequest(request, env, 'Unknown action.');
  },
} satisfies ExportedHandler<Env>;
