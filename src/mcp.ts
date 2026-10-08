import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { VERSION } from "./version.js";
import { createApiClient, type ApiOptions } from "./api.js";

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

export function createAgentSwapMcpServer(options: ApiOptions = {}) {
  const api = createApiClient(options);
  const server = new McpServer({ name: "agentswap", version: VERSION });

  server.registerTool(
    "list_tokens",
    { description: "List tokens AgentSwap can swap on Solana (symbol, mint, decimals)." },
    async () => json(await api.tokens()),
  );

  server.registerTool(
    "get_quote",
    {
      description:
        "Quote a Solana swap or a bridge to EVM. Use amount for exact-in or amountOut for exact-out, in human units. Free.",
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
    description: "List supported destination chains, CAIP-2 networks, USDC addresses and explorers. Source is always Solana.",
  }, async () => json(await api.chains()));
  server.registerTool("fund_x402_payment", {
    description: "Fund an x402 payment using Solana tokens. Pass the seller's 402 challenge. Returns an unsigned Solana transaction and next steps, or pay_directly. Sign locally; no x402 paywall for funding. Provider and network costs apply.",
    inputSchema: {
      paymentRequired: z.union([z.string(), z.object({ accepts: z.array(z.record(z.string(), z.unknown())) }).passthrough(), z.array(z.record(z.string(), z.unknown()))]),
      from: z.string(), userPublicKey: z.string(), evmAddress: z.string().optional(), preferChain: z.string().optional(),
      slippageBps: z.number().int().min(1).max(1000).optional(),
    },
  }, async (args) => json(await api.fund(args)));
  server.registerTool("bridge_status", {
    description: "Poll a submitted Solana bridge signature until DONE or FAILED. NOT_FOUND may mean indexing delay; do not resubmit.",
    inputSchema: { tx: z.string() },
  }, async ({ tx }) => json(await api.status(tx)));

  server.registerTool(
    "swap_info",
    {
      description:
        "How to execute a swap: the paid x402 HTTP endpoint that returns an unsigned transaction for your wallet to sign.",
    },
    async () => json(await api.info()),
  );

  return server;
}
