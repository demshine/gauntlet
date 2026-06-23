#!/usr/bin/env node
import { Command } from "commander";

const program = new Command();

program
  .name("gauntlet")
  .description("Local payment policy test harness for MCP paid tool demos")
  .version("0.1.0");

program
  .command("init")
  .description("Create a local gauntlet fixture directory")
  .action(() => {
    console.log("gauntlet init is planned for V0.1.");
  });

program
  .command("run")
  .description("Evaluate scenarios or a payment request against policy fixtures")
  .option("--scenario <id>", "Run one built-in scenario")
  .option("--policy <path>", "Path to policy.yaml")
  .option("--request <path>", "Path to payment_request.json")
  .option("--history <path>", "Path to history.json")
  .option("--ci", "Use CI exit-code behavior")
  .option("--allow-review", "Treat requires_review as exit 0 in CI mode")
  .option("--unredacted", "Generate an unredacted local receipt")
  .action(() => {
    console.log("gauntlet run is planned for V0.1.");
  });

program.parse();

