import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";
import { builtInScenarios } from "../scenarios/registry.js";

export interface InitOptions {
  cwd?: string;
}

export interface InitResult {
  createdRoot: string;
}

export async function executeInit(options: InitOptions = {}): Promise<InitResult> {
  const cwd = options.cwd ?? process.cwd();
  const root = join(cwd, "gauntlet");
  const validScenario = builtInScenarios[0];
  const amountDriftScenario = builtInScenarios.find(
    (scenario) => scenario.scenario_id === "amount-drift-above-threshold"
  );

  await Promise.all([
    mkdir(join(root, "requests"), { recursive: true }),
    mkdir(join(root, "scenarios"), { recursive: true }),
    mkdir(join(root, "receipts"), { recursive: true })
  ]);

  await Promise.all([
    writeFile(join(root, "policy.yaml"), stringify(validScenario.policy), "utf8"),
    writeFile(
      join(root, "merchants.json"),
      `${JSON.stringify([validScenario.payment_request.merchant], null, 2)}\n`,
      "utf8"
    ),
    writeFile(join(root, "quotes.json"), `${JSON.stringify([validScenario.quote], null, 2)}\n`, "utf8"),
    writeFile(join(root, "quote.json"), `${JSON.stringify(validScenario.quote, null, 2)}\n`, "utf8"),
    writeFile(join(root, "history.json"), `${JSON.stringify(validScenario.history, null, 2)}\n`, "utf8"),
    writeFile(
      join(root, "requests", "valid-payment.json"),
      `${JSON.stringify(validScenario.payment_request, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      join(root, "requests", "amount-drift.json"),
      `${JSON.stringify(amountDriftScenario?.payment_request ?? validScenario.payment_request, null, 2)}\n`,
      "utf8"
    )
  ]);

  return { createdRoot: root };
}

