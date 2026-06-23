import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export interface WriteRunArtifactsInput {
  outputDir: string;
  receipt: unknown;
  reportMarkdown: string;
}

export interface WriteRunArtifactsResult {
  receiptPath: string;
  reportPath: string;
}

export async function writeRunArtifacts(
  input: WriteRunArtifactsInput
): Promise<WriteRunArtifactsResult> {
  await mkdir(input.outputDir, { recursive: true });

  const receiptPath = join(input.outputDir, "receipt.json");
  const reportPath = join(input.outputDir, "report.md");

  await Promise.all([
    writeFile(receiptPath, `${JSON.stringify(input.receipt, null, 2)}\n`, "utf8"),
    writeFile(reportPath, input.reportMarkdown, "utf8")
  ]);

  return { receiptPath, reportPath };
}

