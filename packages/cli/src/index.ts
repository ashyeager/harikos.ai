#!/usr/bin/env node

import { initializeProject } from "@harikos/core";
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
    .description("Local-first project truth for AI coding agents.")
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

  return program;
}

export async function runCli(
  args = process.argv.slice(2),
  output: CliOutput = defaultOutput,
): Promise<void> {
  await createHarikosCli(output).parseAsync(args, { from: "user" });
}
