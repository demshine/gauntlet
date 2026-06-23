import { readFile } from "node:fs/promises";
import YAML from "yaml";

export async function loadJsonFixture(path: string): Promise<unknown> {
  const text = await readFixture(path);
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    throw new Error(`Failed to parse JSON fixture ${path}: ${formatError(error)}`);
  }
}

export async function loadYamlFixture(path: string): Promise<unknown> {
  const text = await readFixture(path);
  try {
    return YAML.parse(text) as unknown;
  } catch (error) {
    throw new Error(`Failed to parse YAML fixture ${path}: ${formatError(error)}`);
  }
}

async function readFixture(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`Failed to read fixture ${path}: ${formatError(error)}`);
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

