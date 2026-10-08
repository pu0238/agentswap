import { isAbsolute } from "node:path";
import { createApiClient, DEFAULT_API } from "./api.js";

export const CLIENTS = ["codex", "claude-code", "cursor", "vscode", "cline", "claude-desktop"] as const;
export type SetupClient = typeof CLIENTS[number];
export type SetupOptions = { client: string; transport?: "http" | "stdio"; api?: string; scriptPath?: string };
const shellQuote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;

/** Generate configuration only: never change the user's editor settings. */
export function setupConfig(options: SetupOptions) {
  if (!CLIENTS.includes(options.client as SetupClient)) throw new Error(`Unknown client. Choose ${CLIENTS.join(", ")}`);
  const client = options.client as SetupClient;
  const transport = options.transport ?? (client === "claude-desktop" ? "stdio" : "http");
  if (transport !== "http" && transport !== "stdio") throw new Error("transport must be http or stdio");
  createApiClient({ api: options.api }); // Reuse public URL validation.
  const api = new URL(options.api ?? DEFAULT_API).href.replace(/\/$/, "");
  const url = `${api}/mcp`;
  if (client === "claude-desktop" && transport !== "stdio") throw new Error("Use stdio for the Claude Desktop configuration file. For hosted connectors, follow your plan's connector settings.");
  if (transport === "stdio" && (!options.scriptPath || !isAbsolute(options.scriptPath))) throw new Error("stdio requires an absolute path to the built dist/mcp-stdio.js file");
  const local = { command: "node", args: [options.scriptPath!], env: { AGENTSWAP_API: api } };
  if (client === "claude-code") return {
    location: "Run this command, then /mcp in Claude Code",
    text: transport === "http"
      ? `claude mcp add --transport http --scope user agentswap ${shellQuote(url)}`
      : `claude mcp add --transport stdio --scope user --env ${shellQuote(`AGENTSWAP_API=${api}`)} agentswap -- node ${shellQuote(options.scriptPath!)}`,
  };
  if (client === "codex") return {
    location: "Merge into ~/.codex/config.toml; restart Codex and run codex mcp list",
    text: transport === "http"
      ? `[mcp_servers.agentswap]\nurl = ${JSON.stringify(url)}`
      : `[mcp_servers.agentswap]\ncommand = "node"\nargs = [${JSON.stringify(options.scriptPath)}]\n\n[mcp_servers.agentswap.env]\nAGENTSWAP_API = ${JSON.stringify(api)}`,
  };
  const config = client === "vscode"
    ? { servers: { agentswap: transport === "http" ? { type: "http", url } : { type: "stdio", ...local } } }
    : { mcpServers: { agentswap: transport === "stdio" ? local : client === "cline" ? { type: "streamableHttp", url, disabled: false, autoApprove: [] } : { url } } };
  const location = { cursor: "Merge into .cursor/mcp.json or ~/.cursor/mcp.json", vscode: "Merge into .vscode/mcp.json", cline: "Merge into Cline MCP Servers > Configure MCP Servers", "claude-desktop": "Merge into Claude Desktop Settings > Developer > Edit Config, then fully restart Desktop" }[client];
  return { location, text: JSON.stringify(config, null, 2) };
}
