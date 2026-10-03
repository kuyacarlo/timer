CREATE TABLE timers (
  id TEXT PRIMARY KEY NOT NULL,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 1 AND 359999),
  started_at TEXT NOT NULL
);
