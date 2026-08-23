#!/usr/bin/env node

import {
  composeContextPack,
  initializeProject,
  scanAndPersistLocalProject,
} from "@harikos/core";
import { Command } from "commander";

export interface CliOutput {
  writeOut(message: string): void;
  writeErr(message: string): void;
}

const defaultOutput: CliOutput = {
  writeOut: (message) => process.stdout.write(message),
  writeErr: (message) => process.stderr.write(message),
};

export function createHarikosCli(output: CliOutput = defaultOutput): Command {
  const program = new Command();
  program
    .name("harikos")
    .description("Evidence-backed project truth for AI coding agents.")
    .version("0.1.0")
    .configureOutput({
      writeOut: output.writeOut,
      writeErr: output.writeErr,
    });

  program
    .command("init")
    .description("Initialize local HARIKOS state for a Git repository.")
    .option("--cwd <path>", "start repository detection from this path")
    .action((commandOptions: { cwd?: string }) => {
      const result = initializeProject(
        commandOptions.cwd ? { cwd: commandOptions.cwd } : {},
      );
      const state = result.created ? "initialized" : "already initialized";

      output.writeOut(`HARIKOS ${state}.\n`);
      output.writeOut(`Project: ${result.project.name}\n`);
      output.writeOut(`Root: ${result.projectRoot}\n`);
      output.writeOut(`Config: ${result.configPath}\n`);
      output.writeOut(`Database: ${result.databasePath}\n`);
      output.writeOut("\nMCP setup guidance:\n");
      output.writeOut(
        "  The MCP server is intentionally deferred until its MVP phase.\n",
      );
      output.writeOut(
        "  Keep this project root and run `harikos init` again after @harikos/mcp is implemented for the exact client configuration.\n",
      );
    });

  program
    .command("scan")
    .description("Scan a local Git repository and reconcile its current truth.")
    .option("--cwd <path>", "repository path", process.cwd())
    .option("--json", "print the complete typed snapshot")
    .action(async (commandOptions: { cwd: string; json?: boolean }) => {
      const snapshot = await scanAndPersistLocalProject(commandOptions.cwd);
      if (commandOptions.json) {
        output.writeOut(`${JSON.stringify(snapshot, null, 2)}\n`);
        return;
      }
      const verified = snapshot.truths.filter((truth) => truth.status === "verified").length;
      output.writeOut(`Scanned ${snapshot.repository.name} @ ${snapshot.repository.headSha.slice(0, 12)}\n`);
      output.writeOut(`Sources: ${snapshot.sourceCount}\n`);
      output.writeOut(`Verified truths: ${verified}\n`);
      output.writeOut(`Contradictions: ${snapshot.contradictions.length}\n`);
    });

  program
    .command("truth")
    .description("Print the current evidence-backed truth for a local repository.")
    .option("--cwd <path>", "repository path", process.cwd())
    .option("--json", "print the complete typed snapshot")
    .action(async (commandOptions: { cwd: string; json?: boolean }) => {
      const snapshot = await scanAndPersistLocalProject(commandOptions.cwd);
      if (commandOptions.json) {
        output.writeOut(`${JSON.stringify(snapshot, null, 2)}\n`);
        return;
      }
      for (const truth of snapshot.truths) {
        output.writeOut(
          `${truth.status.toUpperCase().padEnd(11)} ${truth.category} / ${truth.subject}: ${truth.value} (${Math.round(truth.confidence * 100)}%)\n`,
        );
      }
    });

  program
    .command("context")
    .description("Compose grounded context for an AI coding task.")
    .requiredOption("--task <task>", "the coding task to ground")
    .option("--cwd <path>", "repository path", process.cwd())
    .option("--json", "print the complete typed context pack")
    .action(async (commandOptions: { cwd: string; task: string; json?: boolean }) => {
      const snapshot = await scanAndPersistLocalProject(commandOptions.cwd);
      const context = composeContextPack(snapshot, commandOptions.task);
      output.writeOut(commandOptions.json ? `${JSON.stringify(context, null, 2)}\n` : `${context.text}\n`);
    });

  return program;
}

export async function runCli(
  args = process.argv.slice(2),
  output: CliOutput = defaultOutput,
): Promise<void> {
  await createHarikosCli(output).parseAsync(args, { from: "user" });
}
