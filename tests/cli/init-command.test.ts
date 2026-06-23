import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { executeInit } from "../../src/cli/init-command.js";

describe("executeInit", () => {
  it("creates the local gauntlet fixture tree", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-init-"));
    try {
      const result = await executeInit({ cwd: dir });

      expect(result.createdRoot).toBe(join(dir, "gauntlet"));
      await expect(stat(join(dir, "gauntlet", "policy.yaml"))).resolves.toBeDefined();
      await expect(stat(join(dir, "gauntlet", "quotes.json"))).resolves.toBeDefined();
      await expect(stat(join(dir, "gauntlet", "history.json"))).resolves.toBeDefined();
      await expect(
        stat(join(dir, "gauntlet", "requests", "valid-payment.json"))
      ).resolves.toBeDefined();
      await expect(stat(join(dir, "gauntlet", "receipts"))).resolves.toBeDefined();

      await expect(readFile(join(dir, "gauntlet", "policy.yaml"), "utf8")).resolves.toContain(
        "policy_id"
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

