-- Index the manifest `preload` read, which the hub runs server-side while
-- rendering this app's document — on every launch, for every household.
--
-- Both preload reads sorted their whole table under a LIMIT, and the activity
-- log is append-only: its 5,000-row cap was reached by sorting every row ever
-- written.
CREATE INDEX IF NOT EXISTS app_violation_tracking__violations_created_idx
  ON app_violation_tracking__violations (created_at DESC);
CREATE INDEX IF NOT EXISTS app_violation_tracking__activity_created_idx
  ON app_violation_tracking__activity (created_at ASC);
