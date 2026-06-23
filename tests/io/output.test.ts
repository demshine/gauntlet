import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { writeRunArtifacts } from "../../src/io/output.js";

describe("writeRunArtifacts", () => {
  it("writes receipt and markdown report files", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-output-"));
    try {
      const result = await writeRunArtifacts({
        outputDir: dir,
        receipt: {
          receipt_id: "receipt_123",
          decision: "policy_passed"
        },
        reportMarkdown: "# Gauntlet run complete\n"
      });

      await expect(readFile(result.receiptPath, "utf8")).resolves.toContain("receipt_123");
      await expect(readFile(result.reportPath, "utf8")).resolves.toContain(
        "Gauntlet run complete"
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

