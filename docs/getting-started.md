# Start using AgentSwap

Current release: **v0.3.0**, published **2026-10-09**. Documentation updated **2026-10-09**. [GitHub release](https://github.com/pu0238/agentswap/releases/tag/v0.3.0) · [Release notes](https://agentswap.forge-3.workers.dev/releases/v0.3.0.md).

Use the hosted service at **https://agentswap.forge-3.workers.dev**. There is no backend to deploy and no AgentSwap API key to obtain. The public repository is **https://github.com/pu0238/agentswap**; it contains the client and MCP, not the service implementation.

## Choose your path

| You want to… | Start here | Wallet needed? |
| --- | --- | --- |
| Give a coding assistant tools for tokens, quotes and funding plans | Hosted MCP below | No for discovery/quotes; public addresses for funding plans |
| Run a local MCP process | Build the public client and use stdio | No private keys in MCP |
| Write an autonomous agent that signs and pays | TypeScript/Node SDK below | Local Solana signer; local EVM signer for EVM payments |
| Call the service from Python or another language | HTTP example below | No for quotes; execution needs your own local wallet integration |

**MCP does not hold a wallet, sign, broadcast or pay.** `fund_x402_payment` returns an unsigned plan. Connecting a coding assistant does not turn it into a funded payment agent. Use a local signer/SDK to execute. Keep keys out of prompts, MCP settings and tool arguments.

## 1. Connect a coding agent — no clone required

Endpoint: `https://agentswap.forge-3.workers.dev/mcp`

Transport: **Streamable HTTP**, not legacy SSE. No bearer token or OAuth login is required by AgentSwap. Your client may require an integration approval or a plan that allows custom MCP servers.

### Codex CLI and Codex IDE extension

```sh
codex mcp add agentswap --url https://agentswap.forge-3.workers.dev/mcp
codex mcp list
```

Or merge this into `~/.codex/config.toml`:

```toml
[mcp_servers.agentswap]
url = "https://agentswap.forge-3.workers.dev/mcp"
```

Restart the Codex session after changing configuration.

### Claude Code

```sh
claude mcp add --transport http --scope user agentswap https://agentswap.forge-3.workers.dev/mcp
claude mcp list
```

Open `/mcp` in Claude Code to check connection and tools. `--scope user` makes the connection available across projects; use `--scope project` instead when sharing a project configuration.

### Cursor

Merge into `.cursor/mcp.json` in the project, or `~/.cursor/mcp.json` globally:

```json
{
  "mcpServers": {
    "agentswap": { "url": "https://agentswap.forge-3.workers.dev/mcp" }
  }
}
```

Enable the server in MCP settings and use Agent mode. If the file already contains servers, merge the `agentswap` entry instead of replacing the whole file.

### VS Code with GitHub Copilot

Merge into `.vscode/mcp.json`:

```json
{
  "servers": {
    "agentswap": { "type": "http", "url": "https://agentswap.forge-3.workers.dev/mcp" }
  }
}
```

Use the file's Start action or the MCP commands in the Command Palette. In Copilot Agent mode, enable AgentSwap in the tools picker. VS Code uses `servers`, whereas Cursor uses `mcpServers`.

### Cline

Open **MCP Servers → Remote Servers**, name the server `agentswap`, paste the endpoint and select **Streamable HTTP**. For JSON configuration:

```json
{
  "mcpServers": {
    "agentswap": {
      "type": "streamableHttp",
      "url": "https://agentswap.forge-3.workers.dev/mcp",
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

Keep the transport explicit: omitting it can select legacy SSE. Tool approval is a client preference; no automatic signing is enabled by this configuration.

### Claude Desktop or any stdio client

Build the public client as described below. In Desktop, use **Settings → Developer → Edit Config**, merge this entry and fully quit/reopen the application:

```json
{
  "mcpServers": {
    "agentswap": {
      "command": "node",
      "args": ["/absolute/path/agentswap-client/dist/mcp-stdio.js"]
    }
  }
}
```

Replace the path with the actual built file. On Windows JSON uses escaped backslashes or forward slashes. If the application cannot find `node`, use its absolute executable path. No wallet variables belong in this config. For a hosted Desktop connector, use the remote MCP endpoint only if your account supports that connector flow.

### Your first prompt

> Use AgentSwap to list supported chains, then quote 1 USDC to SOL on Solana. Show the input, estimated output, minimum output and route. Do not request a wallet key, sign, send, or pay.

Expected: six tools are available; `list_chains` returns Solana and supported EVM destinations; `get_quote` returns an estimate without a transaction. Quotes depend on live liquidity; a route error is not a request to submit funds.

MCP also exposes resource **`agentswap://getting-started`** and prompt **`first_quote`**. Clients that do not display resources/prompts can use the six tools normally.

| Tool | What it does | Executes payment? |
| --- | --- | --- |
| `list_tokens` | Solana tokens; optional `chain` for destination defaults | No |
| `list_chains` | Destination networks and public token metadata | No |
| `get_quote` | Exact-in/exact-out estimate from Solana | No |
| `fund_x402_payment` | Unsigned funding plan from the seller's 402 challenge and public addresses | No |
| `bridge_status` | Reconcile a submitted funding signature | No |
| `swap_info` | Current endpoints, pricing and instructions | No |

## 2. Build the public client

Needed only for local stdio, the SDK and diagnostics: **Node.js 22+**, Git and pnpm 10. If pnpm is missing, install it with `npm install --global pnpm@10`.

```sh
git clone --branch v0.3.0 https://github.com/pu0238/agentswap.git agentswap-client
cd agentswap-client
pnpm install --frozen-lockfile
pnpm build
pnpm run doctor
```

Doctor checks the Node version, service metadata, MCP initialization, the six tools and a metadata tool call. It never signs, bridges or pays. Exit code 0 means those checks passed; exit code 1 includes the failed check and reason.

```sh
# Print a ready-to-merge configuration; no editor settings are changed.
node dist/cli.js setup cursor
node dist/cli.js setup vscode
node dist/cli.js setup codex
node dist/cli.js setup cline
node dist/cli.js setup claude-code
node dist/cli.js setup claude-desktop

# Any supported client that allows local processes can use stdio.
node dist/cli.js setup cursor --transport stdio
node dist/cli.js doctor --api https://agentswap.forge-3.workers.dev
```

Stdio output contains MCP protocol messages only. If manually running `pnpm mcp` appears to wait silently, that is normal: an MCP client must send initialization messages.

### Install the published release

The GitHub release includes a prebuilt SDK/MCP package. No local TypeScript build is required when installing this package into an existing Node project:

```sh
curl --fail --location --remote-name https://github.com/pu0238/agentswap/releases/download/v0.3.0/agentswap-client-0.3.0.tgz
curl --fail --location --remote-name https://github.com/pu0238/agentswap/releases/download/v0.3.0/SHA256SUMS-v0.3.0.txt
sha256sum --check SHA256SUMS-v0.3.0.txt
pnpm add ./agentswap-client-0.3.0.tgz
pnpm exec agentswap doctor
```

Installed imports are `@agentswap/client` for the SDK and `@agentswap/client/intent-store` for the Node durable journal. Local stdio starts with `node /absolute/project/node_modules/@agentswap/client/dist/mcp-stdio.js`; configuration can be printed with `pnpm exec agentswap setup claude-desktop --path /absolute/project/node_modules/@agentswap/client/dist/mcp-stdio.js`. This is a local prebuilt binary, not a global npm install.

For an existing source checkout, run `git fetch origin --tags`, `git checkout v0.3.0`, then `pnpm install --frozen-lockfile && pnpm build && pnpm run doctor`. Save local edits before switching. The example scripts below are run from a source checkout; the tarball can instead be imported by your own application.

The package is not published to the npm registry. Do not assume `npx @agentswap/client` works. The tarball includes SDK exports, MCP/CLI binaries, docs and examples. [Release notes and compatibility limits](https://agentswap.forge-3.workers.dev/releases/v0.3.0.md).


## 3. Autonomous TypeScript/Node agents

Start without a wallet:

```sh
pnpm run example:quote
node examples/mcp.mjs
```

The first command makes a free 1 USDC → SOL quote. The second connects to MCP, lists tools and reads the getting-started resource. Neither signs or pays.

For an agent with a wallet:

```sh
cp examples/env.example .env
# Edit .env locally with your wallet keys and RPC. Do not paste them into chat.
pnpm run example:pay https://seller.example/paid
# The command above only inspects the seller response. Replace the URL with a real seller.
pnpm run example:pay https://seller.example/paid --execute
```

Only `--execute` enables signing and payment. Inspect costs and use your own spending policy before enabling autonomous execution. The example's environment file is local and ignored by Git:

| Variable | Purpose |
| --- | --- |
| `AGENTSWAP_API` | Optional API base URL; defaults to the hosted service |
| `AGENT_SECRET_KEY` | Local 64-byte Solana secret, base58 or JSON byte array |
| `AGENT_EVM_PRIVATE_KEY` | Local `0x`-prefixed 32-byte EVM key; required for EVM payment options |
| `AGENT_FROM` | Funding source token; default `USDC`; use `SOL`, `BONK` or a supported mint as appropriate |
| `AGENT_PREFER_CHAIN` | Optional destination priority; does not create an unavailable route |
| `AGENT_PAYMENT_INTENT_ID` | Stable ID per purchase; reuse it to reconcile/retry, including after a restart |
| `AGENT_SLIPPAGE_BPS` | Maximum quoted funding slippage; default `50` (0.50%), range 1–1000 |
| `SOLANA_RPC_URL` | Optional source RPC override |

The source wallet needs the selected funding token and **SOL for Solana fees**. For supported EVM exact USDC payments, the facilitator pays destination gas; you need an EVM signer and the payment asset. Source gas, bridge costs and route minimums still apply.

Embed the SDK in any agent loop, queue worker or framework tool:

```ts
import { createAgentSwap } from "./dist/index.js";
import { fileIntentStore } from "./dist/file-intent-store.js";

// Construct these locally using @solana/kit and viem/accounts.
const agentswap = createAgentSwap({ solana: solanaSigner, evm: evmAccount, from: "USDC", slippageBps: 50, intentStore: fileIntentStore() });
const { response, receipt } = await agentswap.fetchWithReceipt(sellerUrl, undefined, { paymentIntentId: "order-42" });
console.log(receipt);
```

The runnable `examples/pay.mjs` shows actual signer construction. Request bodies must be strings or absent so x402 requests can be retried. A normal non-402 response is returned directly. On a 402 the SDK checks accepted-token balances, funds if needed, waits for status and destination balance, then pays with the selected network signer.

An execution timeout leaves an **unknown outcome**: reconcile the original signature using `bridge_status`/`GET /api/status` before requesting another funding transaction. Never turn a timeout into an automatic duplicate bridge.

### OpenAI Agents SDK and other agent frameworks

For planning-only tools, connect your framework's MCP client to the same remote endpoint. For example, with `@openai/agents` installed in your application:

```ts
import { Agent, hostedMcpTool } from "@openai/agents";

const agent = new Agent({
  name: "Payment planner",
  model: process.env.OPENAI_MODEL,
  instructions: "Use AgentSwap for quotes and unsigned plans. Never request private keys or claim a payment was executed.",
  tools: [hostedMcpTool({ serverLabel: "agentswap", serverUrl: "https://agentswap.forge-3.workers.dev/mcp" })],
});
```

Model-provider credentials and model choice belong to your application, not AgentSwap. This snippet configures planning tools; the local SDK/wallet must implement execution separately. Any framework supporting Streamable HTTP MCP can use the endpoint; otherwise wrap the HTTP endpoints as normal functions. Framework/model-provider runs are not included in our local integration tests.

## 4. HTTP and Python

No JavaScript runtime is required for unsigned HTTP calls:

```sh
curl --fail 'https://agentswap.forge-3.workers.dev/api/chains'
curl --fail 'https://agentswap.forge-3.workers.dev/api/quote?from=USDC&to=SOL&amount=1'
python3 examples/quote.py
```

Python's standard-library example returns an unsigned quote only. Python agents can call `/api/fund` with a seller challenge and public addresses, then hand the returned transaction to their own wallet integration or the local Node SDK. No Python signing SDK is shipped here.

Detailed request/response flow: [service skill](https://agentswap.forge-3.workers.dev/skill.md). Source is **Solana only**; destinations are Solana, Base, Arbitrum, Polygon, Avalanche, Sei and XLayer. SKALE Base is excluded. The registry is not a guarantee that every token/amount route is available.

Existing `/api/swap` costs $0.01 via x402. `/api/bridge` and `/api/fund` have no x402 paywall; provider/network fees apply. See current `swap_info`, quote `feeUsd` and `gasUsd`. The verified mainnet proof is a Solana → Base → Solana round trip; full seller-payment E2E remains unverified.

## Payment intents, receipts and safe retries

Chain choice happens once per payment intent. The SDK records the chosen network, asset, atomic amount and seller address. It selects an already-funded seller option when possible; otherwise it uses the configured preference and chain priority. `preferChain` is a preference, not a requirement. After selection, neither funding nor a retry can fall back to another chain or seller option. Multiple prices on the same chain are pinned individually.

Use `fetchWithReceipt` when your application needs an audit record. `fetch` still returns an ordinary Response; failures after selection throw `AgentSwapPaymentError` with `.receipt`. `getReceipt(intentId)` reads the latest record. Ordinary responses that never require payment have no payment receipt.

```ts
import { createAgentSwap, AgentSwapPaymentError } from "./dist/index.js";
import { fileIntentStore } from "./dist/file-intent-store.js"; // Node only

const agent = createAgentSwap({
  solana, evm, from: "SOL", slippageBps: 50, // 50 bps = 0.50%
  intentStore: fileIntentStore(),
});
const paymentIntentId = "order-42"; // unique per purchase; persist with your order
const init = { headers: { "Idempotency-Key": paymentIntentId } }; // seller must support this separately
try {
  const { response, receipt } = await agent.fetchWithReceipt(sellerUrl, init, { paymentIntentId });
  console.log(receipt); // route, maxSlippageBps, original signature, retry flags, settlement outcome
} catch (error) {
  if (error instanceof AgentSwapPaymentError) console.log(error.receipt);
  throw error; // inspect/reconcile; do not automatically create a new order ID
}
// If a retry is appropriate, invoke the SAME URL/init/paymentIntentId.
// The SDK reconciles the saved funding signature and replays the SAME signed authorization.
```

The receipt contains:

- `intentId`, `attempts`, `selection.network`, `selection.chain`, `selection.reason`, and the exact seller requirement.
- `funding.sourceToken`, `funding.route`, `funding.maxSlippageBps`, quoted input/minimum output and estimated fees/gas, plus the original funding signature/status when applicable. Route is empty when an existing balance pays directly. Slippage limits quote execution; it does not cap all fees or guarantee a final total cost.
- `retry.reusesPaymentIntent`, `retry.reusesFunding`, `retry.reusesAuthorization`, and `automaticChainFallback: false`. These distinguish the first attempt from an actual retry.
- `seller.httpStatus`, decoded settlement data when supplied, and `outcome`. An HTTP 200 without a successful settlement receipt remains `payment_unknown`; it is not proof of settlement.

A funding signature is journaled **before broadcast**. On an ambiguous send or status failure, the next attempt polls that original signature and never submits a replacement bridge. A signed x402 authorization is journaled before the paid request and reused verbatim on retry; no fresh nonce or automatic authorization recovery is generated. An expired, rejected or already-used authorization needs reconciliation, not an automatic new signature. Failed funding and confirmed payment intents cannot be executed again. Changing the request URL, method, body, headers or payer under the same intent ID is rejected.

Without `paymentIntentId`, each fetch creates a new intent. Without `intentStore`, records last only for that SDK instance. To survive restarts, use the Node file store (also exported as `@agentswap/client/intent-store` for installed packages) or implement `PaymentIntentStore` with durable storage and per-intent `acquire` locking. The file store writes atomically, flushes before broadcasting, uses private file permissions and locks intents across processes. If a process dies while locked, confirm it is stopped and reconcile the saved receipt before removing the stale `.lock` file. Keep `.agentswap-payment-intents/` private: it contains signed payment authorizations, which must never be logged, committed or sent to MCP. Share the receipt, not the journal.

SDK intent reuse prevents creating another funding transaction or authorization for that intent. It **does not guarantee seller-side request idempotency or delivery exactly once**. Sellers should support an application-level idempotency key and return settlement receipts. Never blindly repeat a side-effecting seller request after an ambiguous outcome.

HTTP `/api/fund` and MCP `fund_x402_payment` return `receipt` for `fund_then_pay`, including route, max slippage and retry instructions. Their optional `paymentIntentId` is **correlation only**: the backend is stateless, does not deduplicate requests and returns a fresh unsigned quote on each call. The local SDK journal provides retry protection. Standalone HTTP/MCP clients must preserve signatures/authorizations and reconcile themselves.

For the runnable example, set `AGENT_PAYMENT_INTENT_ID=order-42` and `AGENT_SLIPPAGE_BPS=50`. Execution uses the durable file store. Reuse the same ID for a retry; select a new ID only for a genuinely new purchase.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| No tools after adding the server | Restart the client; enable MCP tools/Agent mode; check the endpoint ends in `/mcp` |
| 406 or content-type errors | Use Streamable HTTP and `Accept: application/json, text/event-stream`; use an MCP SDK instead of a custom partial protocol implementation |
| Cline connects as SSE | Set `type: streamableHttp` explicitly |
| Desktop cannot find a file or Node | Build first; use absolute paths to both the built script and Node executable |
| Local MCP seems silent | Normal for stdio; connect through your MCP client, not an HTTP browser |
| 429 | Back off according to `Retry-After`; the hosted API is rate limited |
| 502 or no available route | Change token/amount/chain or try later; no transaction has been executed by a quote call |
| Insufficient Solana balance | Check the funding token and SOL fees; EVM gas sponsorship does not cover Solana gas |
| SDK says an EVM signer is required | Configure the local EVM account or use a seller's accepted Solana option |
| Funding timeout / NOT_FOUND | Reconcile the same signature; do not resubmit blindly |
| `/api/info` missing or doctor fails | Check the API URL, deployment version, proxy/firewall and client logs |

## Compatibility and verification

Release v0.3.0 was verified on 2026-10-09: typecheck, 31 tests, installed release tarball exports/CLI and production API/MCP version checks passed. Installation emits peer-version warnings because token helpers used by `@x402/svm@2.27.0` declare Solana Kit 5 peers while this client uses Kit 8.3.0. Full seller-payment mainnet E2E remains unverified.

Configuration formats were checked against official docs on 2026-10-08. The AgentSwap MCP protocol, CLI generation and examples are tested independently; this does not claim that every editor UI, paid connector plan, model-provider run or mainnet payment path was exercised.

Sources: [Codex](https://developers.openai.com/learn/docs-mcp), [Claude Code](https://code.claude.com/docs/en/mcp), [Cursor](https://prod.cursor.com/help/customization/mcp), [VS Code](https://code.visualstudio.com/docs/agents/reference/mcp-configuration), [Cline](https://docs.cline.bot/mcp/mcp-overview), [local MCP/Desktop](https://modelcontextprotocol.io/docs/develop/connect-local-servers), [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents/integrations-observability).
