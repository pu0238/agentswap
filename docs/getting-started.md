# Start using AgentSwap

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
git clone https://github.com/pu0238/agentswap.git agentswap-client
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

There is no published npm release implied by the package name. Do not assume `npx @agentswap/client` works. Clone/build now, or use `pnpm pack` and install the resulting tarball into your own Node project. The tarball includes SDK exports, MCP/CLI binaries, docs and examples.

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
| `SOLANA_RPC_URL` | Optional source RPC override |

The source wallet needs the selected funding token and **SOL for Solana fees**. For supported EVM exact USDC payments, the facilitator pays destination gas; you need an EVM signer and the payment asset. Source gas, bridge costs and route minimums still apply.

Embed the SDK in any agent loop, queue worker or framework tool:

```ts
import { createAgentSwap } from "./dist/index.js";

// Construct these locally using @solana/kit and viem/accounts.
const agentswap = createAgentSwap({ solana: solanaSigner, evm: evmAccount, from: "USDC" });
const response = await agentswap.fetch(sellerUrl);
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

Configuration formats were checked against official docs on 2026-10-08. The AgentSwap MCP protocol, CLI generation and examples are tested independently; this does not claim that every editor UI, paid connector plan, model-provider run or mainnet payment path was exercised.

Sources: [Codex](https://developers.openai.com/learn/docs-mcp), [Claude Code](https://code.claude.com/docs/en/mcp), [Cursor](https://prod.cursor.com/help/customization/mcp), [VS Code](https://code.visualstudio.com/docs/agents/reference/mcp-configuration), [Cline](https://docs.cline.bot/mcp/mcp-overview), [local MCP/Desktop](https://modelcontextprotocol.io/docs/develop/connect-local-servers), [OpenAI Agents SDK](https://developers.openai.com/api/docs/guides/agents/integrations-observability).
