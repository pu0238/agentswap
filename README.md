# AgentSwap client and MCP

Open-source SDK and MCP adapter for the hosted AgentSwap API. The service builds unsigned Solana swap/funding transactions. Your wallet signs locally; private keys stay with your agent.

This repository contains the user-facing client, public HTTP types, network metadata, x402 challenge parsing and MCP tool definitions. Quote routing, provider integrations, fee application, transaction construction and deployment configuration live in the separate backend. The client does not need provider API keys.

## Build from source

Node.js 22 or newer:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
```

The package name in `package.json` is the intended package name. No npm publication is implied; use this checkout until a published release is announced.

## Local MCP

```sh
pnpm build
AGENTSWAP_API=https://agentswap.forge-3.workers.dev pnpm mcp
```

`AGENTSWAP_API` is optional and defaults to the hosted service. MCP runs over stdio. Its stdout is reserved for protocol messages. No wallet or private key is passed to the MCP process.

Configure your MCP client to run the built file using an absolute path:

```json
{
  "mcpServers": {
    "agentswap": {
      "command": "node",
      "args": ["/absolute/path/agentswap-client/dist/mcp-stdio.js"],
      "env": { "AGENTSWAP_API": "https://agentswap.forge-3.workers.dev" }
    }
  }
}
```

| Tool | Hosted API |
| --- | --- |
| `list_tokens` | `GET /api/tokens` |
| `list_chains` | `GET /api/chains` |
| `get_quote` | `GET /api/quote` |
| `fund_x402_payment` | `POST /api/fund` |
| `bridge_status` | `GET /api/status` |
| `swap_info` | `GET /api/info` |

The hosted `/mcp` endpoint uses the same public adapter. The HTTP handler is also available through the `./mcp/http` export for integrations that supply their own host. Tool results and current pricing are read from the backend, not recomputed in MCP.

## SDK

After building, import from the checkout's `dist/index.js`, or use the package root after installing a locally packed tarball:

```ts
import { createAgentSwap } from "./dist/index.js";

// solana: @solana/kit KeyPairSigner; evm: viem LocalAccount.
const agentswap = createAgentSwap({ solana, evm, from: "SOL" });
const response = await agentswap.fetch(sellerUrl);
```

The SDK checks accepted-token balances, requests funding if needed, signs the Solana transaction locally, polls completion, then signs an x402 payment on the chosen network. Request bodies must be strings or absent so they can be retried. An EVM signer is required for EVM payments; source Solana costs require SOL.

For tools that only need unsigned results:

```ts
import { createApiClient } from "./dist/index.js";

const api = createApiClient();
const quote = await api.quote({ from: "SOL", to: "USDC", toChain: "base", amount: "0.05" });
```

The default source is Solana. The registry includes Solana, Base, Arbitrum, Polygon, Avalanche, Sei and XLayer. Routes depend on token, amount and liquidity; SKALE is excluded. A timeout after submission means an unknown outcome: reconcile the original signature before submitting another transaction.

`POST /api/swap` retains its x402 payment requirement. Funding and bridge endpoints have no x402 paywall; provider and network costs still apply. For supported EVM exact USDC payments the facilitator pays gas. General EVM-source bridging is not exposed by this SDK.

The documented mainnet proof is a Solana → Base → Solana bridge round trip. Seller-payment E2E remains to be verified.

## API documentation

[Service instructions](https://agentswap.forge-3.workers.dev/skill.md) and [agent index](https://agentswap.forge-3.workers.dev/llms.txt).

MIT applies to this client repository. The separately operated backend is not included in this license or source distribution.
