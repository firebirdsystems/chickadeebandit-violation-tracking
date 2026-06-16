CREATE TABLE IF NOT EXISTS app_violation_tracking__settings (
  key          TEXT NOT NULL,
  value        TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (key)
);

CREATE TABLE IF NOT EXISTS app_violation_tracking__violations (
  id             TEXT NOT NULL,
  unit_id        TEXT NOT NULL,
  issued_by      TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT 'other',
  description    TEXT NOT NULL DEFAULT '',
  photo_file_id  TEXT,
  cure_deadline  TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'open',
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS app_violation_tracking__activity (
  id            TEXT NOT NULL,
  violation_id  TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_vt_violations_unit
  ON app_violation_tracking__violations (unit_id);

CREATE INDEX IF NOT EXISTS idx_vt_violations_status
  ON app_violation_tracking__violations (status);

CREATE INDEX IF NOT EXISTS idx_vt_activity_violation
  ON app_violation_tracking__activity (violation_id);
