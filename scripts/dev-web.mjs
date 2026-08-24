import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { spawn } from "node:child_process";

if (existsSync(".env.local")) loadEnvFile(".env.local");

const child = spawn(
  process.execPath,
  ["apps/web/node_modules/next/dist/bin/next", "dev", "apps/web"],
  {
    env: process.env,
    stdio: "inherit",
  },
);

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});

child.on("error", (error) => {
  console.error("Unable to start the HARIKOS web app.", error);
  process.exitCode = 1;
});
