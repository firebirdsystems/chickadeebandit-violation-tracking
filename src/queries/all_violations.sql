SELECT
  v.id,
  v.unit_id,
  v.issued_by,
  v.category,
  v.description,
  v.photo_file_id,
  v.cure_deadline,
  v.status,
  v.created_at,
  v.updated_at
FROM violations v
WHERE v.household_id = current_setting('app.household_id', true)::uuid
ORDER BY v.created_at DESC
LIMIT 200
