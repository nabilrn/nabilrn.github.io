export interface Env {
  DB: D1Database;
  ALLOWED_ORIGIN?: string;
}

type MetricKey = 'views' | 'likes' | 'shares';

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(init.headers),
    },
  });

function corsHeaders(existing?: HeadersInit) {
  const headers = new Headers(existing);
  headers.set('access-control-allow-origin', '*');
  headers.set('access-control-allow-methods', 'GET,POST,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type');
  return headers;
}

function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

function extractPostId(url: URL) {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'metrics') return null;
  return parts[1];
}

async function ensureMetricRow(db: D1Database, postId: string) {
  await db
    .prepare('INSERT OR IGNORE INTO post_metrics (post_id) VALUES (?1)')
    .bind(postId)
    .run();
}

async function getMetrics(db: D1Database, postId: string) {
  await ensureMetricRow(db, postId);
  const row = await db
    .prepare('SELECT views, likes, shares FROM post_metrics WHERE post_id = ?1')
    .bind(postId)
    .first<{ views: number; likes: number; shares: number }>();

  return {
    views: row?.views ?? 0,
    likes: row?.likes ?? 0,
    shares: row?.shares ?? 0,
  };
}

async function bumpMetric(db: D1Database, postId: string, field: MetricKey, amount = 1) {
  await ensureMetricRow(db, postId);
  await db
    .prepare(`UPDATE post_metrics SET ${field} = MAX(0, ${field} + ?2) WHERE post_id = ?1`)
    .bind(postId, amount)
    .run();
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const postId = extractPostId(url);
    if (!postId) return json({ error: 'Not found' }, { status: 404 });

    if (request.method === 'GET') {
      return json(await getMetrics(env.DB, postId));
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    let payload: { action?: string; visitorId?: string } = {};
    try {
      payload = await request.json();
    } catch {
      return badRequest('Invalid JSON payload.');
    }

    const visitorId = payload.visitorId?.trim();
    const action = payload.action;

    if (!action) return badRequest('Missing action.');

    if (action === 'view') {
      if (!visitorId) return badRequest('Missing visitorId for view.');
      await ensureMetricRow(env.DB, postId);
      const inserted = await env.DB
        .prepare('INSERT OR IGNORE INTO post_views (post_id, visitor_id) VALUES (?1, ?2)')
        .bind(postId, visitorId)
        .run();
      if ((inserted.meta.changes ?? 0) > 0) {
        await bumpMetric(env.DB, postId, 'views', 1);
      }
      return json(await getMetrics(env.DB, postId));
    }

    if (action === 'like') {
      if (!visitorId) return badRequest('Missing visitorId for like.');
      await ensureMetricRow(env.DB, postId);
      const existing = await env.DB
        .prepare('SELECT 1 as liked FROM post_likes WHERE post_id = ?1 AND visitor_id = ?2')
        .bind(postId, visitorId)
        .first<{ liked: number }>();

      let liked = false;
      if (existing) {
        await env.DB
          .prepare('DELETE FROM post_likes WHERE post_id = ?1 AND visitor_id = ?2')
          .bind(postId, visitorId)
          .run();
        await bumpMetric(env.DB, postId, 'likes', -1);
      } else {
        await env.DB
          .prepare('INSERT INTO post_likes (post_id, visitor_id) VALUES (?1, ?2)')
          .bind(postId, visitorId)
          .run();
        await bumpMetric(env.DB, postId, 'likes', 1);
        liked = true;
      }

      const metrics = await getMetrics(env.DB, postId);
      return json({ ...metrics, liked });
    }

    if (action === 'share') {
      await bumpMetric(env.DB, postId, 'shares', 1);
      return json(await getMetrics(env.DB, postId));
    }

    return badRequest('Unknown action.');
  },
} satisfies ExportedHandler<Env>;
