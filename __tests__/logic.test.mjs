import { describe, it, expect } from "vitest";
import {
  boardGroup, isBoard,
  canIssueViolation, canAcknowledge, canDispute, canRespond,
  canResolve, canEscalate,
  statusLabel, statusColor, categoryIcon, isOverdue,
} from "../src/logic.js";

const admin   = { id: "a1", name: "Admin",  isAdmin: true };
const boardM  = { id: "b1", name: "Board",  role: "board" };
const member1 = { id: "m1", name: "Alice",  role: "adult" };
const member2 = { id: "m2", name: "Bob",    role: "adult" };

const group = { id: "g1", name: "Compliance Committee", memberIds: ["b1"] };
const groups = [group];

// --- boardGroup ---
describe("boardGroup", () => {
  it("returns null when no boardGroupId", () => {
    expect(boardGroup(groups, null)).toBeNull();
  });
  it("returns the group when found", () => {
    expect(boardGroup(groups, "g1")).toBe(group);
  });
  it("returns null when id does not match", () => {
    expect(boardGroup(groups, "g99")).toBeNull();
  });
});

// --- isBoard ---
describe("isBoard", () => {
  it("admins still require membership in the configured group", () => {
    expect(isBoard(admin, groups, null)).toBe(false);
  });
  it("group member is board when group is configured", () => {
    expect(isBoard(boardM, groups, "g1")).toBe(true);
  });
  it("non-group member is not board when group is configured", () => {
    expect(isBoard(member1, groups, "g1")).toBe(false);
  });
  it("fails closed when no group is configured", () => {
    expect(isBoard(boardM, groups, null)).toBe(false);
    expect(isBoard(member1, groups, null)).toBe(false);
  });
  it("returns false for null member", () => {
    expect(isBoard(null, groups, "g1")).toBe(false);
  });
});

// --- canIssueViolation ---
describe("canIssueViolation", () => {
  it("board member can issue", () => {
    expect(canIssueViolation(boardM, groups, "g1")).toBe(true);
  });
  it("regular member cannot issue", () => {
    expect(canIssueViolation(member1, groups, "g1")).toBe(false);
  });
});

// --- canAcknowledge ---
describe("canAcknowledge", () => {
  const v = { id: "v1", unit_id: "m1", status: "open" };
  it("unit owner can acknowledge an open violation", () => {
    expect(canAcknowledge(v, member1)).toBe(true);
  });
  it("other member cannot acknowledge", () => {
    expect(canAcknowledge(v, member2)).toBe(false);
  });
  it("cannot acknowledge already-acknowledged violation", () => {
    expect(canAcknowledge({ ...v, status: "acknowledged" }, member1)).toBe(false);
  });
});

// --- canDispute ---
describe("canDispute", () => {
  it("unit owner can dispute open violation", () => {
    expect(canDispute({ id: "v1", unit_id: "m1", status: "open" }, member1)).toBe(true);
  });
  it("unit owner can dispute acknowledged violation", () => {
    expect(canDispute({ id: "v1", unit_id: "m1", status: "acknowledged" }, member1)).toBe(true);
  });
  it("unit owner cannot dispute resolved violation", () => {
    expect(canDispute({ id: "v1", unit_id: "m1", status: "resolved" }, member1)).toBe(false);
  });
  it("other member cannot dispute", () => {
    expect(canDispute({ id: "v1", unit_id: "m1", status: "open" }, member2)).toBe(false);
  });
});

// --- canRespond ---
describe("canRespond", () => {
  it("unit owner can respond while open/acknowledged/disputed", () => {
    for (const status of ["open", "acknowledged", "disputed"]) {
      expect(canRespond({ id: "v1", unit_id: "m1", status }, member1)).toBe(true);
    }
  });
  it("unit owner cannot respond when resolved or escalated", () => {
    for (const status of ["resolved", "escalated"]) {
      expect(canRespond({ id: "v1", unit_id: "m1", status }, member1)).toBe(false);
    }
  });
});

// --- canResolve / canEscalate ---
describe("canResolve", () => {
  const v = { id: "v1", unit_id: "m1", status: "open" };
  it("board can resolve", () => {
    expect(canResolve(v, boardM, groups, "g1")).toBe(true);
  });
  it("regular member cannot resolve", () => {
    expect(canResolve(v, member1, groups, "g1")).toBe(false);
  });
  it("cannot resolve an already-resolved violation", () => {
    expect(canResolve({ ...v, status: "resolved" }, boardM, groups, "g1")).toBe(false);
  });
});

describe("canEscalate", () => {
  const v = { id: "v1", unit_id: "m1", status: "disputed" };
  it("board can escalate", () => {
    expect(canEscalate(v, boardM, groups, "g1")).toBe(true);
  });
  it("regular member cannot escalate", () => {
    expect(canEscalate(v, member1, groups, "g1")).toBe(false);
  });
  it("cannot escalate already-escalated violation", () => {
    expect(canEscalate({ ...v, status: "escalated" }, boardM, groups, "g1")).toBe(false);
  });
});

// --- statusLabel / statusColor ---
describe("statusLabel", () => {
  it("returns human strings", () => {
    expect(statusLabel("open")).toBe("Open");
    expect(statusLabel("acknowledged")).toBe("Acknowledged");
    expect(statusLabel("disputed")).toBe("Disputed");
    expect(statusLabel("resolved")).toBe("Resolved");
    expect(statusLabel("escalated")).toBe("Escalated");
  });
  it("falls back to the raw value for unknown status", () => {
    expect(statusLabel("unknown_xyz")).toBe("unknown_xyz");
  });
});

describe("statusColor", () => {
  it("returns a hex color for each known status", () => {
    for (const s of ["open", "acknowledged", "disputed", "resolved", "escalated"]) {
      expect(statusColor(s)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

// --- categoryIcon ---
describe("categoryIcon", () => {
  it("returns an emoji for each known category", () => {
    for (const c of ["parking", "noise", "landscaping", "pets", "trash", "architectural", "other"]) {
      expect(typeof categoryIcon(c)).toBe("string");
      expect(categoryIcon(c).length).toBeGreaterThan(0);
    }
  });
  it("falls back to clipboard for unknown category", () => {
    expect(categoryIcon("unknown")).toBe("📋");
  });
});

// --- isOverdue ---
describe("isOverdue", () => {
  const past   = "2000-01-01";
  const future = "2099-01-01";

  it("is overdue when deadline is in the past and status is open", () => {
    expect(isOverdue({ status: "open", cure_deadline: past })).toBe(true);
  });
  it("is not overdue when deadline is in the future", () => {
    expect(isOverdue({ status: "open", cure_deadline: future })).toBe(false);
  });
  it("is not overdue when resolved", () => {
    expect(isOverdue({ status: "resolved", cure_deadline: past })).toBe(false);
  });
  it("is not overdue when escalated", () => {
    expect(isOverdue({ status: "escalated", cure_deadline: past })).toBe(false);
  });
});
