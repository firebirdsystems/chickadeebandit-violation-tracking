SELECT
  v.id,
  v.unit_id,
  v.issued_by,
  v.category,
  v.description,
  v.photo_file_id,
  v.cure_deadline,
  v.status,
  v.created_at
FROM app_violation_tracking__violations v
WHERE v.status IN ('open', 'acknowledged', 'disputed')
ORDER BY v.cure_deadline ASC, v.created_at ASC
LIMIT 200
