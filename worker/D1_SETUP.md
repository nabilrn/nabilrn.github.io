# D1 metrics cutover

The Worker uses Cloudflare D1 as the source of truth for engagement and rolling analytics.
The previous KV namespace remains bound as `LEGACY_METRICS` in read-only mode during the cutover so existing post counters and per-visitor viewed/liked state can be lazily copied into D1.

## 1. Verify the database binding

The repository is currently bound to the existing Cloudflare D1 database:

- database name: `portfolio-metrics`
- database ID: `95fdffb0-37a1-45c5-a108-786c95d50188`

From `worker/`, verify Wrangler resolves the same database:

```bash
npx wrangler d1 info portfolio-metrics --json
```

If this database ever needs to be reprovisioned, use `npx wrangler d1 list --json` first and only create a new database when no `portfolio-metrics` database exists.

## 2. Apply migrations

```bash
npx wrangler d1 migrations apply portfolio-metrics --remote
```

The initial migration creates:

- `post_metrics`
- `visitor_post_state`
- `analytics_hourly`
- `analytics_hourly_visitors`

Verify the remote schema after the migration:

```bash
npx wrangler d1 execute portfolio-metrics --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

## 3. Deploy the Worker

```bash
npx wrangler deploy
```

Do not delete the old KV namespace yet. During the transition the Worker only reads it to seed existing article views/likes/shares and visitor state into D1. New writes go to D1 only.

## 4. Verify production

Check a metrics endpoint, then exercise an article view, like/unlike, and share from the portfolio UI.

```bash
curl "https://portfolio-metrics-api.<your-subdomain>.workers.dev/metrics/<post-slug>"
curl "https://portfolio-metrics-api.<your-subdomain>.workers.dev/analytics/summary"
```

Expected metrics response shape remains compatible with the frontend:

```json
{
  "views": 0,
  "likes": 0,
  "shares": 0,
  "liked": false
}
```

`liked` is included when a `visitorId` query parameter is supplied.

## 5. Retire KV later

After D1 has been verified and the old counters/state have had time to seed, remove:

- `LEGACY_METRICS` from `Env`
- the lazy legacy seeding helpers in `worker/src/index.ts`
- the `[[kv_namespaces]]` block in `worker/wrangler.toml`

The old rolling analytics KV history is intentionally not imported. The 24-hour chart starts filling from D1 immediately after cutover and becomes fully D1-native after 24 hours.
