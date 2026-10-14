// Pure functions — no DOM, no global state, safe to unit-test

export function boardGroup(groups, boardGroupId) {
  if (!boardGroupId) return null;
  return groups.find(g => g.id === boardGroupId) ?? null;
}

export function isBoard(member, groups, boardGroupId) {
  if (!member) return false;
  const g = boardGroup(groups, boardGroupId);
  if (!g) return false;
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

export function categoryGlyph(category) {
  return {
    parking:       "car",
    noise:         "megaphone",
    landscaping:   "sprout",
    pets:          "paw",
    trash:         "trash",
    architectural: "blueprint",
    other:         "note",
  }[category] ?? "note";
}

export function isOverdue(violation) {
  if (["resolved", "escalated"].includes(violation.status)) return false;
  if (!violation.cure_deadline) return false;
  return new Date(violation.cure_deadline) < new Date();
}

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The description is the notice — the category and unit are how it is
 * filed, but what actually happened is written in the body.
 */
export function searchableFields(violation, unitName = "") {
  return [violation.description, violation.category, unitName];
}

/**
 * The hub's refusals of a photo or a write that name their own case: a line in
 * the app's words, or "" when the status names none of them. Never the hub's text.
 */
export function refusalLine(status) {
  return {
    413: "That file is too large.",
    415: "That kind of file can’t be uploaded.",
    429: "Too many tries — wait a minute and try again.",
    507: "The household’s storage is full — free up space first.",
  }[status] ?? "";
}

/**
 * The line a failed write shows, from the error's status — never the hub's
 * text. "Try again" only where trying again can work. `found` is the caller's
 * re-read after a write that changed nothing (true: the row is still there).
 */
export function failureLine(e, { action, thing, found } = {}) {
  if (e?.forUser) return e.message;
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(String(e?.message ?? ""))) return `That ${thing} already exists.`;
  if (e?.status === 403) return `You don’t have permission to ${action}.`;
  const refused = refusalLine(e?.status);
  if (refused) return refused;
  if (found === false || (found === undefined && e?.status === 404)) return `This ${thing} has been removed.`;
  if (found === true) return `You don’t have permission to ${action}.`;
  if (e?.status === 409) return `This ${thing} was changed by someone else — check it first.`;
  return `Couldn’t ${action} — try again.`;
}
