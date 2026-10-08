import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VERSION } from "./version.js";
import { FIRST_QUOTE_PROMPT, onboarding } from "./onboarding.js";
import { createApiClient, DEFAULT_API, type ApiOptions } from "./api.js";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

export function createAgentSwapMcpServer(options: ApiOptions = {}) {
  const api = createApiClient(options);
  const server = new McpServer({ name: "agentswap", version: VERSION }, {
    instructions: "Start with list_chains/list_tokens and a free get_quote. Read agentswap://getting-started or use the first_quote prompt. All tools only read or plan; none sign, broadcast or pay. Private keys stay in a local wallet/SDK, never in tool arguments.",
  });
  const guide = onboarding(new URL(options.api ?? DEFAULT_API).href.replace(/\/$/, ""));
  server.registerResource("getting-started", "agentswap://getting-started", {
    title: "AgentSwap quickstart", description: "First quote, local signing boundary and execution requirements.", mimeType: "application/json",
  }, async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(guide, null, 2) }] }));
  server.registerPrompt("first_quote", { title: "Try a free AgentSwap quote", description: "List chains and quote USDC to SOL without keys, signing or spending." },
    async () => ({ messages: [{ role: "user" as const, content: { type: "text" as const, text: FIRST_QUOTE_PROMPT } }] }));

  server.registerTool(
    "list_tokens",
    { description: "List source tokens on Solana, or USDC/native defaults for a destination chain. No wallet needed.", annotations: readOnly, inputSchema: { chain: z.string().optional().describe("Chain key or CAIP-2; defaults to solana") } },
    async ({ chain }) => json(await api.tokens(chain)),
  );

  server.registerTool(
    "get_quote",
    {
      description:
        "Get a free estimate; no wallet or signing needed. Source is Solana. Supply exactly one of amount (input) or amountOut (output), in human units. Inspect minimum output and costs. No transaction is executed.",
      annotations: readOnly,
      inputSchema: {
        from: z.string().describe("Token symbol or mint to sell, e.g. USDC"),
        to: z.string().describe("Token symbol or mint to buy, e.g. SOL"),
        amount: z.string().optional().describe("Amount of from in human units"),
        amountOut: z.string().optional().describe("Required output in human units; omit amount"),
        toChain: z.string().optional().describe("Destination chain key or CAIP-2; defaults to solana"),
        slippageBps: z.number().int().min(1).max(1000).optional(),
      },
    },
    async (args) => {
      return json(await api.quote(args));
    },
  );

  server.registerTool("list_chains", {
    description: "List supported destination chains, CAIP-2 networks, USDC addresses and explorers. Source is always Solana.", annotations: readOnly,
  }, async () => json(await api.chains()));
  server.registerTool("fund_x402_payment", {
    description: "Fund an x402 payment using Solana tokens. Pass the seller's 402 challenge. Returns an unsigned Solana transaction and next steps, or pay_directly. Sign locally; no x402 paywall for funding. Provider and network costs apply.",
    annotations: { ...readOnly, idempotentHint: false },
    inputSchema: {
      paymentRequired: z.union([z.string(), z.object({ accepts: z.array(z.record(z.string(), z.unknown())) }).passthrough(), z.array(z.record(z.string(), z.unknown()))]),
      from: z.string(), userPublicKey: z.string(), evmAddress: z.string().optional(), preferChain: z.string().optional(),
      slippageBps: z.number().int().min(1).max(1000).optional(),
    },
  }, async (args) => json(await api.fund(args)));
  server.registerTool("bridge_status", {
    description: "Poll a submitted Solana bridge signature until DONE or FAILED. NOT_FOUND may mean indexing delay; do not resubmit.",
    annotations: readOnly,
    inputSchema: { tx: z.string() },
  }, async ({ tx }) => json(await api.status(tx)));

  server.registerTool(
    "swap_info",
    {
      description:
        "Read service instructions, public pricing and quickstart links. Explains how unsigned swaps/funding differ from local signing and x402 payment execution.",
      annotations: readOnly,
    },
    async () => json(await api.info()),
  );

  return server;
}
