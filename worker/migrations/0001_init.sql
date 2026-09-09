PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS post_metrics (
  post_id TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  shares INTEGER NOT NULL DEFAULT 0 CHECK (shares >= 0),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visitor_post_state (
  post_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  viewed INTEGER NOT NULL DEFAULT 0 CHECK (viewed IN (0, 1)),
  liked INTEGER NOT NULL DEFAULT 0 CHECK (liked IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, visitor_id)
);

CREATE TABLE IF NOT EXISTS analytics_hourly (
  hour TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  PRIMARY KEY (hour, path)
);

CREATE TABLE IF NOT EXISTS analytics_hourly_visitors (
  hour TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  PRIMARY KEY (hour, visitor_id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_hourly_hour
  ON analytics_hourly(hour);

CREATE INDEX IF NOT EXISTS idx_analytics_hourly_visitors_hour
  ON analytics_hourly_visitors(hour);
