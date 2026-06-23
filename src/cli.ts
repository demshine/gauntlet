#!/usr/bin/env node
import { Command } from "commander";
import { executeInit } from "./cli/init-command.js";
import { executeRun } from "./cli/run-command.js";

const program = new Command();

program
  .name("gauntlet")
  .description("Local payment policy test harness for MCP paid tool demos")
  .version("0.1.0");

program
  .command("init")
  .description("Create a local gauntlet fixture directory")
  .action(async () => {
    try {
      const result = await executeInit();
      console.log(`Created ${result.createdRoot}`);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 3;
    }
  });

program
  .command("run")
  .description("Evaluate scenarios or a payment request against policy fixtures")
  .option("--scenario <id>", "Run one built-in scenario")
  .option("--policy <path>", "Path to policy.yaml")
  .option("--quote <path>", "Path to quote.json")
  .option("--request <path>", "Path to payment_request.json")
  .option("--history <path>", "Path to history.json")
  .option("--output-dir <path>", "Directory for receipt/report artifacts")
  .option("--ci", "Use CI exit-code behavior")
  .option("--allow-review", "Treat requires_review as exit 0 in CI mode")
  .option("--unredacted", "Generate an unredacted local receipt")
  .action(async (options) => {
    try {
      const result = await executeRun(options);
      console.log(result.stdout);
      process.exitCode = result.exitCode;
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 3;
    }
  });

program.parse();
