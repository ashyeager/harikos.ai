#!/usr/bin/env node

import { runCli } from "../dist/index.js";

runCli().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`HARIKOS init failed: ${message}\n`);
  process.exitCode = 1;
});
