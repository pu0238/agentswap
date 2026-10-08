# AgentSwap — SDK and MCP for agent payments

Latest release: [v0.3.0 — auditable payment intents](https://github.com/pu0238/agentswap/releases/tag/v0.3.0). [Release notes and upgrade instructions](docs/releases/v0.3.0.md).

Give coding assistants quotes and unsigned funding plans, or let your own Node agent sign and pay locally. AgentSwap supports Solana swaps and funding x402 payments on supported EVM destinations. Private keys stay with your agent.

## Connect your coding assistant

No clone, wallet or AgentSwap API key is needed for hosted MCP:

```sh
# Codex CLI / IDE extension
codex mcp add agentswap --url https://agentswap.forge-3.workers.dev/mcp

# Claude Code
claude mcp add --transport http --scope user agentswap https://agentswap.forge-3.workers.dev/mcp
```

**[Complete setup guide](docs/getting-started.md)** — Cursor, VS Code/Copilot, Cline, Claude Desktop, local stdio, autonomous Node agents, Python/HTTP, troubleshooting and official configuration sources. [Hosted guide](https://agentswap.forge-3.workers.dev/start).

First prompt:

> Use AgentSwap to list supported chains, then quote 1 USDC to SOL on Solana. Show the input, estimated output, minimum output and route. Do not request a wallet key, sign, send, or pay.

MCP exposes `list_tokens`, `list_chains`, `get_quote`, `fund_x402_payment`, `bridge_status` and `swap_info`, plus a `first_quote` prompt and `agentswap://getting-started` resource. **MCP does not sign, broadcast or pay.** Funding tools return unsigned plans; execution needs your local wallet or SDK.

## Build and verify the public client

Node.js 22+, Git and pnpm 10:

```sh
git clone --branch v0.3.0 https://github.com/pu0238/agentswap.git agentswap-client
cd agentswap-client
pnpm install --frozen-lockfile
pnpm build
pnpm run doctor
pnpm run example:quote
```

If pnpm is missing: `npm install --global pnpm@10`. Doctor makes free metadata calls, checks API/MCP compatibility and returns a nonzero exit code for failed checks. No signing or payment occurs.

Generate a configuration without editing your settings:

```sh
node dist/cli.js setup cursor
node dist/cli.js setup claude-desktop
node dist/cli.js setup vscode --transport stdio
```

For local MCP, point your client to the absolute `dist/mcp-stdio.js` path or use `pnpm mcp`. `AGENTSWAP_API` overrides the hosted service. Never put wallet keys in MCP configuration.

## Run an autonomous agent

```sh
cp examples/env.example .env
# Add local signer keys to .env, never to chat or MCP settings.
pnpm run example:pay https://seller.example/paid
# Inspect only by default. Substitute a real seller URL.
pnpm run example:pay https://seller.example/paid --execute
```

The [runnable payment example](examples/pay.mjs) constructs local signers. The source wallet needs its funding token and SOL for fees. EVM exact USDC payments also require a local EVM key; the facilitator pays destination gas. Provider/network costs and route minimums apply.

In your code:

```ts
import { createAgentSwap } from "./dist/index.js";
import { fileIntentStore } from "./dist/file-intent-store.js";

const agentswap = createAgentSwap({ solana, evm, from: "USDC", slippageBps: 50, intentStore: fileIntentStore() });
const { response, receipt } = await agentswap.fetchWithReceipt(sellerUrl, undefined, { paymentIntentId: "order-42" });
console.log(receipt); // selected chain, bridge route, maximum slippage and retry reuse
```

The SDK checks accepted-token balances, requests funding if necessary, signs locally, polls completion and pays via x402. Request bodies must be strings or absent so retries work. Reconcile a timed-out funding signature before retrying. Use your application's spending policy for autonomous execution.

## Distribution and scope

For auditable payments, use `fetchWithReceipt(url, init, { paymentIntentId })`. Receipts show the selected network, bridge route, `maxSlippageBps` and whether retries reuse the intent, funding and authorization. Selection is pinned; retries never silently switch chains or generate another authorization. Configure `slippageBps` (default 50) and a durable `intentStore` to survive restarts; the Node adapter is exported at `@agentswap/client/intent-store`. See [payment intents and safe retries](docs/getting-started.md#payment-intents-receipts-and-safe-retries), including seller-side idempotency limits.

Download the prebuilt [v0.3.0 package](https://github.com/pu0238/agentswap/releases/download/v0.3.0/agentswap-client-0.3.0.tgz) and [SHA-256 checksum](https://github.com/pu0238/agentswap/releases/download/v0.3.0/SHA256SUMS-v0.3.0.txt), or build the tagged checkout. The package is not published to the npm registry; do not assume an `npx` install is available. Exports include SDK/API types, MCP adapters and command-line setup/doctor utilities. The backend, provider implementation and deployment are not included. MIT applies to this public client repository. [Install or upgrade instructions](docs/getting-started.md#install-the-published-release).

Source: Solana. Destinations: Solana, Base, Arbitrum, Polygon, Avalanche, Sei and XLayer. SKALE is excluded; route availability varies. `/api/swap` retains its $0.01 x402 fee. Bridge/funding have no x402 paywall; provider and network costs remain.

A Solana → Base → Solana mainnet round trip was verified. Full seller-payment E2E remains unverified. [Service skill](https://agentswap.forge-3.workers.dev/skill.md) · [API discovery](https://agentswap.forge-3.workers.dev/llms.txt).
