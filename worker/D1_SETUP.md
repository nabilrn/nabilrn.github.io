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

`0001_init.sql` creates the consolidated schema:

- `post_metrics`
- `visitor_post_state`
- `analytics_hourly`
- `analytics_hourly_visitors`

The existing database also contains the older per-visitor tables `post_views` and `post_likes`. `0002_import_legacy_d1.sql` imports those rows into the consolidated schema without dropping the old tables:

- every old `(post_id, visitor_id)` view is preserved as `visitor_post_state.viewed = 1`
- every old like is preserved as `visitor_post_state.liked = 1`
- `post_metrics.views` and `post_metrics.likes` are rebuilt from those deduplicated rows
- existing `post_metrics` values are never reduced

The Worker also keeps the old KV namespace read-only during cutover. When a post is read, aggregate counters are reconciled with `MAX(D1, KV)`, so a newer KV counter cannot reduce imported D1 history and imported D1 history cannot be overwritten by a lower KV counter.

Verify the remote schema after migrations:

```bash
npx wrangler d1 execute portfolio-metrics --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
```

Verify imported totals:

```bash
npx wrangler d1 execute portfolio-metrics --remote --command="SELECT SUM(views) AS views, SUM(likes) AS likes FROM post_metrics;"
```

For the database state observed before `0002`, the imported lower bounds are 400 historical views and 14 historical likes.

## 3. Deploy the Worker

```bash
npx wrangler deploy
```

Do not delete the old KV namespace or the old D1 tables yet. During the transition:

- old D1 tables remain available for rollback
- the Worker only reads `LEGACY_METRICS`; it never writes to KV
- all new metrics and engagement writes go to D1

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

## 5. Retire legacy storage later

After D1 has been verified in production and the old KV counters/state have had time to reconcile, remove:

- `LEGACY_METRICS` from `Env`
- the lazy legacy reconciliation helpers in `worker/src/index.ts`
- the `[[kv_namespaces]]` block in `worker/wrangler.toml`

After a separate backup/check, the legacy D1 tables `post_views` and `post_likes` can also be dropped in a later migration. Do not drop them as part of the initial cutover.

The old rolling analytics KV history is intentionally not imported. The 24-hour chart starts filling from D1 immediately after cutover and becomes fully D1-native after 24 hours.
