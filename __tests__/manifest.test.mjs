import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(__dirname, "../manifest.json"), "utf-8"));
const boardGroupRule = {
  settings_table: "settings",
  settings_key: "board_group_id",
};

describe("manifest security", () => {
  it("protects the Board group setting through admin configuration", () => {
    expect(manifest.row_policies.settings).toEqual({ kind: "app_config" });
    expect(manifest.admin_config).toEqual({
      settings_table: "settings",
      keys: ["board_group_id"],
    });
  });

  it("gates pending violation cross-writes and inbox access", () => {
    expect(manifest.export_acls.pending_violations.require_group_setting).toEqual(boardGroupRule);
    expect(manifest.store_acls.pending_violations.read.require_group_setting).toEqual(boardGroupRule);
    expect(manifest.store_acls.pending_violations.write.require_group_setting).toEqual(boardGroupRule);
  });
});
