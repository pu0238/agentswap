#!/usr/bin/env node
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { setupConfig, CLIENTS } from "./setup.js";
import { doctor } from "./doctor.js";

try {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: {
    api: { type: "string" }, transport: { type: "string" }, path: { type: "string" }, help: { type: "boolean", short: "h" },
  } });
  const [command, client] = positionals;
  if (values.help || !command) {
    console.log(`AgentSwap client\n\nnode dist/cli.js setup <${CLIENTS.join("|")}> [--transport http|stdio] [--api URL] [--path /absolute/dist/mcp-stdio.js]\nnode dist/cli.js doctor [--api URL]\n\nSetup prints configuration without changing editor settings. Doctor makes free metadata calls; it never signs or pays.`);
  } else if (command === "setup") {
    const result = setupConfig({ client, api: values.api ?? process.env.AGENTSWAP_API, transport: values.transport as "http" | "stdio" | undefined, scriptPath: values.path ?? fileURLToPath(new URL("./mcp-stdio.js", import.meta.url)) });
    console.error(result.location);
    console.log(result.text);
  } else if (command === "doctor") {
    const result = await doctor({ api: values.api ?? process.env.AGENTSWAP_API });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else throw new Error(`Unknown command ${command}; use --help`);
} catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
