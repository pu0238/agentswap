import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { getQuote, type JupEnv } from "./jupiter";
import { TOKENS } from "./tokens";

type McpEnv = JupEnv & { SWAP_PRICE: string; X402_NETWORK: string };

const json = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});

function createServer(env: McpEnv, origin: string) {
  const server = new McpServer({ name: "agentswap", version: "0.1.0" });

  server.registerTool(
    "list_tokens",
    { description: "List tokens AgentSwap can swap on Solana (symbol, mint, decimals)." },
    async () => json(TOKENS),
  );

  server.registerTool(
    "get_quote",
    {
      description:
        "Get a live Solana swap quote (via Jupiter). Amount is in human units, e.g. 1.5 USDC. Free.",
      inputSchema: {
        from: z.string().describe("Token symbol or mint to sell, e.g. USDC"),
        to: z.string().describe("Token symbol or mint to buy, e.g. SOL"),
        amount: z.string().describe("Amount of `from` token in human units, e.g. '1.5'"),
        slippageBps: z.number().int().min(1).max(1000).optional(),
      },
    },
    async (args) => {
      const { quoteResponse: _, ...q } = await getQuote(env, args);
      return json(q);
    },
  );

  server.registerTool(
    "swap_info",
    {
      description:
        "How to execute a swap: the paid x402 HTTP endpoint that returns an unsigned transaction for your wallet to sign.",
    },
    async () =>
      json({
        endpoint: `${origin}/api/swap`,
        method: "POST",
        body: { from: "USDC", to: "SOL", amount: "1", userPublicKey: "<your wallet>", slippageBps: 50 },
        payment: { protocol: "x402", price: env.SWAP_PRICE, asset: "USDC", network: env.X402_NETWORK },
        returns: "{ swapTransaction: base64 VersionedTransaction, lastValidBlockHeight, quote }",
        next: "Deserialize, sign with your keypair, send to any Solana RPC.",
        docs: `${origin}/skill.md`,
      }),
  );

  return server;
}

/** Stateless MCP over streamable HTTP: a fresh server + transport per request. */
export async function handleMcp(req: Request, env: McpEnv): Promise<Response> {
  const server = createServer(env, new URL(req.url).origin);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(req);
}
