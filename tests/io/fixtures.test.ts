import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import { loadJsonFixture, loadYamlFixture } from "../../src/io/fixtures.js";

describe("fixture loaders", () => {
  it("loads JSON fixtures", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-fixtures-"));
    try {
      const file = join(dir, "request.json");
      await writeFile(file, JSON.stringify({ request_id: "req_123" }), "utf8");

      await expect(loadJsonFixture(file)).resolves.toEqual({ request_id: "req_123" });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("loads YAML fixtures", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-fixtures-"));
    try {
      const file = join(dir, "policy.yaml");
      await writeFile(file, "policy_id: default\nversion: 1\n", "utf8");

      await expect(loadYamlFixture(file)).resolves.toEqual({
        policy_id: "default",
        version: 1
      });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("includes the file path when JSON parsing fails", async () => {
    const dir = await mkdtemp(join(tmpdir(), "gauntlet-fixtures-"));
    try {
      const file = join(dir, "broken.json");
      await writeFile(file, "{", "utf8");

      await expect(loadJsonFixture(file)).rejects.toThrow(file);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

