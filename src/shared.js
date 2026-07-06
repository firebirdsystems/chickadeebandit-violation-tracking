// Mirrors hub-sdk.js helpers for use in logic.js tests (no browser env needed)

export function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isAdult(member) {
  return member?.role !== "child";
}
