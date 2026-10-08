export const FIRST_QUOTE_PROMPT = "Use AgentSwap to list supported chains, then quote 1 USDC to SOL on Solana. Show the input, estimated output, minimum output and route. Do not request a wallet key, sign, send, or pay.";
export function onboarding(api: string) {
  return { api, mcp: `${api}/mcp`, guide: `${api}/start`, skill: `${api}/skill.md`,
    firstPrompt: FIRST_QUOTE_PROMPT,
    workflow: ["List chains and tokens; request a free quote.", "For x402 funding, supply the seller challenge and public wallet addresses only.", "MCP returns unsigned plans. A local SDK or wallet signs, broadcasts and pays.", "After broadcast, reconcile the original signature; do not blindly repeat funding on timeout."],
    wallet: "No wallet, API key or native gas is needed to connect MCP and read quotes. Real execution needs a local Solana signer and SOL; EVM payments also need a local EVM signer. Never put private keys in MCP config or chat.",
    receipts: { guide: `${api}/getting-started.md#payment-intents-receipts-and-safe-retries`,
      execution: "SDK fetchWithReceipt pins a seller option and reports route, maxSlippageBps and retry reuse. Persist paymentIntentId and a durable intentStore; retries reconcile the original funding signature and reuse the same authorization. No automatic chain fallback.",
      planning: "HTTP/MCP paymentIntentId is correlation only; unsigned plan requests are not deduplicated. Seller fulfillment idempotency needs seller support." },
    limits: "Source is Solana. Supported destination networks and actual route availability come from list_chains and quotes. Provider/network costs apply. Seller-payment E2E is not yet verified.",
  };
}
