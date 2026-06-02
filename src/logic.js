// Pure functions — no DOM, no global state, safe to unit-test

export function boardGroup(groups, boardGroupId) {
  if (!boardGroupId) return null;
  return groups.find(g => g.id === boardGroupId) ?? null;
}

export function isBoard(member, groups, boardGroupId) {
  if (!member) return false;
  if (member.isAdmin) return true;
  const g = boardGroup(groups, boardGroupId);
  if (!g) return member.role === "board";
  return Array.isArray(g.memberIds) && g.memberIds.includes(member.id);
}

export function canIssueViolation(me, groups, boardGroupId) {
  return isBoard(me, groups, boardGroupId);
}

export function canAcknowledge(violation, me) {
  if (!me || violation.unit_id !== me.id) return false;
  return violation.status === "open";
}

export function canDispute(violation, me) {
  if (!me || violation.unit_id !== me.id) return false;
  return violation.status === "open" || violation.status === "acknowledged";
}

export function canRespond(violation, me) {
  if (!me || violation.unit_id !== me.id) return false;
  return ["open", "acknowledged", "disputed"].includes(violation.status);
}

export function canResolve(violation, me, groups, boardGroupId) {
  if (!isBoard(me, groups, boardGroupId)) return false;
  return ["open", "acknowledged", "disputed"].includes(violation.status);
}

export function canEscalate(violation, me, groups, boardGroupId) {
  if (!isBoard(me, groups, boardGroupId)) return false;
  return ["open", "acknowledged", "disputed"].includes(violation.status);
}

export function statusLabel(status) {
  return {
    open:         "Open",
    acknowledged: "Acknowledged",
    disputed:     "Disputed",
    resolved:     "Resolved",
    escalated:    "Escalated",
  }[status] ?? status;
}

export function statusColor(status) {
  return {
    open:         "#f59e0b",
    acknowledged: "#3b82f6",
    disputed:     "#ef4444",
    resolved:     "#22c55e",
    escalated:    "#8b5cf6",
  }[status] ?? "#6b7280";
}

export function categoryIcon(category) {
  return {
    parking:       "🚗",
    noise:         "📢",
    landscaping:   "🌿",
    pets:          "🐾",
    trash:         "🗑️",
    architectural: "🏗️",
    other:         "📋",
  }[category] ?? "📋";
}

export function isOverdue(violation) {
  if (["resolved", "escalated"].includes(violation.status)) return false;
  if (!violation.cure_deadline) return false;
  return new Date(violation.cure_deadline) < new Date();
}
