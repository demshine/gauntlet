#!/usr/bin/env node
import { Command } from "commander";
import { buildMarkdownReport } from "./report/markdown.js";
import { runBuiltInScenarios } from "./scenarios/run.js";

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
  .action((options: { ci?: boolean; allowReview?: boolean }) => {
    const summary = runBuiltInScenarios();
    const report = buildMarkdownReport({
      title: "Gauntlet run complete",
      scenarioCount: summary.scenarioCount,
      decisionCounts: summary.decisionCounts,
      advisoryWarningCount: summary.advisoryWarningCount,
      highSignalFailures: summary.highSignalFailures
    });

    console.log(report);

    if (options.ci && summary.decisionCounts.policy_failed > 0) {
      process.exitCode = 1;
    }
  });

program.parse();
