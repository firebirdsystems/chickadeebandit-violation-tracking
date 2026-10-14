import { describe, it, expect } from "vitest";
import { failureLine, refusalLine } from "../src/logic.js";

const err = (props, message = "hub text") => Object.assign(new Error(message), props);
const words = { action: "save the settings", thing: "setting" };

describe("refusalLine", () => {
  it("words the hub's named refusals in the app's own voice", () => {
    expect(refusalLine(413)).toBe("That file is too large.");
    expect(refusalLine(415)).toBe("That kind of file can’t be uploaded.");
    expect(refusalLine(429)).toBe("Too many tries — wait a minute and try again.");
    expect(refusalLine(507)).toBe("The household’s storage is full — free up space first.");
  });
  it("names nothing for any other status", () => {
    for (const s of [undefined, 0, 400, 403, 404, 409, 500, 503]) expect(refusalLine(s)).toBe("");
  });
});

describe("failureLine", () => {
  it("names a duplicate by code, or by the hub's text as a fallback", () => {
    expect(failureLine(err({ status: 400, code: "UNIQUE_CONSTRAINT" }), words)).toBe("That setting already exists.");
    expect(failureLine(err({ status: 400 }, "UNIQUE constraint failed: x.id"), words)).toBe("That setting already exists.");
  });
  it("names a refusal without asking for a retry", () => {
    expect(failureLine(err({ status: 403 }), words)).toBe("You don’t have permission to save the settings.");
    expect(failureLine(err({ status: 507 }), words)).toBe("The household’s storage is full — free up space first.");
    expect(failureLine(err({ status: 413 }), words)).toBe("That file is too large.");
    expect(failureLine(err({ status: 415 }), words)).toBe("That kind of file can’t be uploaded.");
    expect(failureLine(err({ status: 429 }), words)).toBe("Too many tries — wait a minute and try again.");
  });
  it("splits a write that changed nothing by the caller's re-read", () => {
    expect(failureLine(null, { ...words, found: false })).toBe("This setting has been removed.");
    expect(failureLine(null, { ...words, found: true })).toBe("You don’t have permission to save the settings.");
    expect(failureLine(null, { ...words, found: null })).toBe("Couldn’t save the settings — try again.");
  });
  it("reads a 404 as removed and a 409 as changed", () => {
    expect(failureLine(err({ status: 404 }), words)).toBe("This setting has been removed.");
    expect(failureLine(err({ status: 409 }), words)).toBe("This setting was changed by someone else — check it first.");
  });
  it("asks for a retry only when retrying can work", () => {
    for (const e of [err({}), err({ status: 500 }), err({ status: 503 }), err({ status: 400 }), new TypeError("Failed to fetch"), undefined]) {
      expect(failureLine(e, words)).toBe("Couldn’t save the settings — try again.");
    }
  });
  it("keeps a line the app wrote for the user, and never shows hub text", () => {
    expect(failureLine(err({ forUser: true }, "Pick a group first."), words)).toBe("Pick a group first.");
    expect(failureLine(err({ status: 500 }, "D1_ERROR: boom"), words)).not.toMatch(/D1_ERROR/);
    expect(failureLine(err({ status: 413 }, "Payload too large (max 10MB)"), words)).not.toMatch(/Payload/);
  });
});
