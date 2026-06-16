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
FROM app_violation_tracking__violations v
ORDER BY v.created_at DESC
LIMIT 200
