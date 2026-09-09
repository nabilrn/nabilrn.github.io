# D1 metrics cutover

The Worker now uses Cloudflare D1 as the source of truth for engagement and rolling analytics.
The previous KV namespace remains bound as `LEGACY_METRICS` in read-only mode during the cutover so existing post counters and per-visitor viewed/liked state can be lazily copied into D1.

## 1. Create the database

From the repository root:

```bash
cd worker
npx wrangler d1 create portfolio-metrics
```

Copy the returned database ID and replace `REPLACE_WITH_D1_DATABASE_ID` in `worker/wrangler.toml`.

## 2. Apply migrations

```bash
npx wrangler d1 migrations apply portfolio-metrics --remote
```

The initial migration creates:

- `post_metrics`
- `visitor_post_state`
- `analytics_hourly`
- `analytics_hourly_visitors`

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
