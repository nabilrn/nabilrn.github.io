-- Normalize legacy/consolidated tables to the canonical D1 schema, then import
-- the original per-visitor engagement history. Legacy post_views/post_likes
-- tables are intentionally kept intact during cutover for rollback.

CREATE TABLE IF NOT EXISTS post_views (
  post_id TEXT,
  visitor_id TEXT,
  UNIQUE(post_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS post_likes (
  post_id TEXT,
  visitor_id TEXT,
  UNIQUE(post_id, visitor_id)
);

DROP TABLE IF EXISTS post_metrics_next;
CREATE TABLE post_metrics_next (
  post_id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  shares INTEGER NOT NULL DEFAULT 0 CHECK (shares >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO post_metrics_next (post_id, views, likes, shares, updated_at)
SELECT
  post_id,
  MAX(0, COALESCE(views, 0)),
  MAX(0, COALESCE(likes, 0)),
  MAX(0, COALESCE(shares, 0)),
  CURRENT_TIMESTAMP
FROM post_metrics
WHERE post_id IS NOT NULL;

INSERT OR IGNORE INTO post_metrics_next (post_id)
SELECT DISTINCT post_id
FROM post_views
WHERE post_id IS NOT NULL;

INSERT OR IGNORE INTO post_metrics_next (post_id)
SELECT DISTINCT post_id
FROM post_likes
WHERE post_id IS NOT NULL;

UPDATE post_metrics_next
SET views = MAX(
      views,
      COALESCE((
        SELECT COUNT(*)
        FROM post_views
        WHERE post_views.post_id = post_metrics_next.post_id
      ), 0)
    ),
    likes = MAX(
      likes,
      COALESCE((
        SELECT COUNT(*)
        FROM post_likes
        WHERE post_likes.post_id = post_metrics_next.post_id
      ), 0)
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1 FROM post_views WHERE post_views.post_id = post_metrics_next.post_id
  )
  OR EXISTS (
    SELECT 1 FROM post_likes WHERE post_likes.post_id = post_metrics_next.post_id
  );

DROP TABLE IF EXISTS visitor_post_state_next;
CREATE TABLE visitor_post_state_next (
  post_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  viewed INTEGER NOT NULL DEFAULT 0 CHECK (viewed IN (0, 1)),
  liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, visitor_id)
);

INSERT OR REPLACE INTO visitor_post_state_next (post_id, visitor_id, viewed, liked, updated_at)
SELECT
  post_id,
  visitor_id,
  CASE WHEN COALESCE(viewed, 0) <> 0 THEN 1 ELSE 0 END,
  CASE WHEN COALESCE(liked, 0) <> 0 THEN 1 ELSE 0 END,
  CURRENT_TIMESTAMP
FROM visitor_post_state
WHERE post_id IS NOT NULL AND visitor_id IS NOT NULL;

INSERT OR IGNORE INTO visitor_post_state_next (post_id, visitor_id, viewed, liked)
SELECT post_id, visitor_id, 1, 0
FROM post_views
WHERE post_id IS NOT NULL AND visitor_id IS NOT NULL;

INSERT OR IGNORE INTO visitor_post_state_next (post_id, visitor_id, viewed, liked)
SELECT post_id, visitor_id, 0, 1
FROM post_likes
WHERE post_id IS NOT NULL AND visitor_id IS NOT NULL;

UPDATE visitor_post_state_next
SET viewed = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE viewed = 0
  AND EXISTS (
    SELECT 1
    FROM post_views
    WHERE post_views.post_id = visitor_post_state_next.post_id
      AND post_views.visitor_id = visitor_post_state_next.visitor_id
  );

UPDATE visitor_post_state_next
SET liked = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE liked = 0
  AND EXISTS (
    SELECT 1
    FROM post_likes
    WHERE post_likes.post_id = visitor_post_state_next.post_id
      AND post_likes.visitor_id = visitor_post_state_next.visitor_id
  );

DROP TABLE visitor_post_state;
ALTER TABLE visitor_post_state_next RENAME TO visitor_post_state;

DROP TABLE post_metrics;
ALTER TABLE post_metrics_next RENAME TO post_metrics;
