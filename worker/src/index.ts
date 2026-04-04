export interface Env {
  METRICS: KVNamespace;
  ALLOWED_ORIGIN?: string;
}

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = corsHeaders(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
};

function corsHeaders(existing?: HeadersInit) {
  const headers = new Headers(existing);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
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

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const postId = extractPostId(url);
    if (!postId) return json({ error: 'Not found' }, { status: 404 });

    if (request.method === 'GET') {
      return json(await getMetrics(env.METRICS, postId));
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

    const kv = env.METRICS;

    if (action === 'view') {
      if (!visitorId) return badRequest('Missing visitorId for view.');
      const viewedKey = `visitor:${postId}:${visitorId}:viewed`;
      const already = await kv.get(viewedKey);
      if (!already) {
        await kv.put(viewedKey, '1');
        await increment(kv, `metrics:${postId}:views`);
      }
      return json(await getMetrics(kv, postId));
    }

    if (action === 'like') {
      if (!visitorId) return badRequest('Missing visitorId for like.');
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
      return json({ ...metrics, liked });
    }

    if (action === 'share') {
      await increment(kv, `metrics:${postId}:shares`);
      return json(await getMetrics(kv, postId));
    }

    return badRequest('Unknown action.');
  },
} satisfies ExportedHandler<Env>;
