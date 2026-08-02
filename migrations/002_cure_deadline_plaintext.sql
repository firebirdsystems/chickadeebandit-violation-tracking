-- `cure_deadline` becomes a declared plaintext column (manifest
-- db_plaintext_columns).
--
-- It is the one date this app has, and it was being encrypted at rest: the
-- column matches no entry in the platform skip-list and none of its suffixes
-- (`_deadline` is not `_date`). At-rest encryption is AES-GCM with a random IV,
-- so `cure_deadline = :today` matched nothing -- silently, and forever -- which
-- is why the Today surface could not be written against it.
--
-- Declaring it plaintext is safe to do in place here: the app has no installs,
-- so there are no ciphertext rows to migrate. The value is a bare YYYY-MM-DD
-- cure date on a notice whose *content* (description, photos) stays encrypted,
-- and the row policy (owner_only on unit_id) still keeps the whole row visible
-- only to the cited unit -- a plaintext date column does not widen who can read
-- the notice, it only makes the date comparable in SQL.
--
-- The existing indexes lead with unit_id and status, so the agenda's
-- `cure_deadline = :today` had nothing to use.
CREATE INDEX IF NOT EXISTS app_violation_tracking__violations_deadline_idx
  ON app_violation_tracking__violations (cure_deadline, status);
