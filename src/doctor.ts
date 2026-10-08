import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createApiClient, DEFAULT_API } from "./api.js";
import { VERSION } from "./version.js";

export const REQUIRED_TOOLS = ["list_tokens", "list_chains", "get_quote", "fund_x402_payment", "bridge_status", "swap_info"];
export async function doctor(options: { api?: string; timeoutMs?: number } = {}) {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const api = createApiClient({ ...options, timeoutMs });
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  async function check(name: string, run: () => Promise<string>) {
    try { checks.push({ name, ok: true, detail: await run() }); }
    catch (error) { checks.push({ name, ok: false, detail: error instanceof Error ? error.message : String(error) }); }
  }
  await check("node", async () => {
    if (Number(process.versions.node.split(".")[0]) < 22) throw new Error("Node.js 22+ required");
    return process.versions.node;
  });
  await check("http-api", async () => {
    const chains = await api.chains();
    if (!Array.isArray(chains) || !chains.some(chain => chain.key === "solana")) throw new Error("Unexpected /api/chains response");
    const info = await api.info();
    if (!info.endpoint || !info.fund) throw new Error("Missing /api/info service metadata; check backend deployment");
    return `${chains.length} chains; service metadata available`;
  });
  await check("mcp", async () => {
    const client = new Client({ name: "agentswap-doctor", version: VERSION });
    const url = new URL(`${(options.api ?? DEFAULT_API).replace(/\/$/, "")}/mcp`);
    const transport = new StreamableHTTPClientTransport(url, { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(timeoutMs) }) });
    try {
      await client.connect(transport);
      const result = await client.listTools(undefined, { timeout: timeoutMs });
      const missing = REQUIRED_TOOLS.filter(name => !result.tools.some(tool => tool.name === name));
      if (missing.length) throw new Error(`Missing MCP tools: ${missing.join(", ")}`);
      const info = await client.callTool({ name: "swap_info", arguments: {} }, undefined, { timeout: timeoutMs });
      if (info.isError) throw new Error(`swap_info failed: ${JSON.stringify(info.content)}`);
      return `${result.tools.length} tools; metadata call succeeds`;
    } finally { await client.close(); }
  });
  return { ok: checks.every(check => check.ok), api: options.api ?? DEFAULT_API, checks, signingOrPayments: false };
}
