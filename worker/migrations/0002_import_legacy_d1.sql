-- Import the original per-visitor D1 engagement tables into the consolidated schema.
-- Keep post_views/post_likes intact during cutover so rollback remains possible.

INSERT OR IGNORE INTO visitor_post_state (post_id, visitor_id, viewed, liked)
SELECT post_id, visitor_id, 1, 0
FROM post_views
WHERE post_id IS NOT NULL AND visitor_id IS NOT NULL;

INSERT OR IGNORE INTO visitor_post_state (post_id, visitor_id, viewed, liked)
SELECT post_id, visitor_id, 0, 1
FROM post_likes
WHERE post_id IS NOT NULL AND visitor_id IS NOT NULL;

UPDATE visitor_post_state
SET viewed = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE viewed = 0
  AND EXISTS (
    SELECT 1
    FROM post_views
    WHERE post_views.post_id = visitor_post_state.post_id
      AND post_views.visitor_id = visitor_post_state.visitor_id
  );

UPDATE visitor_post_state
SET liked = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE liked = 0
  AND EXISTS (
    SELECT 1
    FROM post_likes
    WHERE post_likes.post_id = visitor_post_state.post_id
      AND post_likes.visitor_id = visitor_post_state.visitor_id
  );

INSERT OR IGNORE INTO post_metrics (post_id)
SELECT DISTINCT post_id
FROM post_views
WHERE post_id IS NOT NULL;

INSERT OR IGNORE INTO post_metrics (post_id)
SELECT DISTINCT post_id
FROM post_likes
WHERE post_id IS NOT NULL;

UPDATE post_metrics
SET views = MAX(
      views,
      COALESCE((
        SELECT COUNT(*)
        FROM post_views
        WHERE post_views.post_id = post_metrics.post_id
      ), 0)
    ),
    likes = MAX(
      likes,
      COALESCE((
        SELECT COUNT(*)
        FROM post_likes
        WHERE post_likes.post_id = post_metrics.post_id
      ), 0)
    ),
    updated_at = CURRENT_TIMESTAMP
WHERE EXISTS (
    SELECT 1 FROM post_views WHERE post_views.post_id = post_metrics.post_id
  )
  OR EXISTS (
    SELECT 1 FROM post_likes WHERE post_likes.post_id = post_metrics.post_id
  );
