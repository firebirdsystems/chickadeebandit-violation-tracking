CREATE TABLE IF NOT EXISTS settings (
  household_id UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  key          TEXT NOT NULL,
  value        TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (household_id, key)
);

CREATE TABLE IF NOT EXISTS violations (
  household_id   UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
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
  PRIMARY KEY (household_id, id)
);

CREATE TABLE IF NOT EXISTS activity (
  household_id  UUID NOT NULL DEFAULT current_setting('app.household_id', true)::uuid,
  id            TEXT NOT NULL,
  violation_id  TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  action        TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  PRIMARY KEY (household_id, id)
);

CREATE INDEX IF NOT EXISTS idx_vt_violations_unit
  ON violations (household_id, unit_id);

CREATE INDEX IF NOT EXISTS idx_vt_violations_status
  ON violations (household_id, status);

CREATE INDEX IF NOT EXISTS idx_vt_activity_violation
  ON activity (household_id, violation_id);
