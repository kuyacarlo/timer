ALTER TABLE timers ADD COLUMN ends_at TEXT;

UPDATE timers
SET ends_at = strftime(
  '%Y-%m-%dT%H:%M:%fZ',
  julianday(started_at) + (duration_seconds / 86400.0)
)
WHERE ends_at IS NULL;
