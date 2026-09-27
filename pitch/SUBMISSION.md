# AgentSwap: hackathon submission kit

## 1. Project logo or graphic

`pitch/logo/agentswap-logo.png`: 1200×1200 PNG, 150 KB (under the 0.5 MB limit). The source is `pitch/logo/logo.html` (paper style, holo 3D caltrop).

## 2. Important context about the repo (paste as is)

> Live: https://agentswap.forge-3.workers.dev (landing, API, `/mcp`, `/skill.md`, `/llms.txt`).
>
> AgentSwap is a hackathon proof of concept built during this event. The repo contains the whole product: a stateless Cloudflare Worker (Hono) that serves the AgentSwap HTTP API (`src/`), an MCP server (`/mcp`), the landing page plus `skill.md` and `llms.txt` (`public/`), and a demo agent script (`demo/agent.ts`) that performs a real paid swap on Solana mainnet.
>
> What it is and isn't:
> - Swaps are routed through Jupiter. We do not run our own liquidity yet; own pools are the next step.
> - The service is non-custodial. `/api/swap` returns an unsigned transaction that the agent signs itself. We never see or store keys.
> - Swap builds cost $0.01 USDC, paid via x402 (v2, Solana mainnet, PayAI facilitator). Quotes are free.
> - 7 supported tokens for now: SOL, USDC, USDT, JUP, BONK, WIF, PYUSD.
> - The MCP server exposes read-only tools (`list_tokens`, `get_quote`, `swap_info`). Executing a swap goes through the paid HTTP endpoint, because the signing key stays with the agent.
> - Proof of a real run: a paid mainnet swap of 1 USDC → 0.008186967 SOL, https://solscan.io/tx/2SpRNZCS6Gw3UeEpjGGaummpkxEJYfYrXCLyncwkooQCWT4kHUKNDyrbX3MBUjUirTmduHZAdAeW2u8jKgBopWMx (the x402 fee tx is 3Vw7GZn4…c6f4e).
> - `videos/` (the HyperFrames project for the demo video) and `pitch/` (deck, logo) are submission materials, not product code.

## 3. Demo video (up to 3 min)

`videos/agentswap-demo/renders/agentswap-demo.mp4`, 1:08, 1920×1080, with voiceover and captions. It shows the real product: the live landing page, a real agent run in the terminal (quote → HTTP 402 → x402 payment → local signing → send), the transaction on Solscan, and a real MCP tool call.

Upload it to YouTube (Unlisted is fine), Loom or Vimeo and paste the link.

## 4. Pitch video (up to 2 min): talk track to record

Record yourself on camera (Loom with camera + screen works well). Put the deck on screen with `cd pitch/deck && npm run dev`, then press P, and advance it while you talk. The judges want you and how you think, so keep your face in frame. About 260 words is roughly 1:50 at a calm pace.

> **[Intro, 15s]** Hi, I'm Michał Łustyk from Forge3. [ADD: one line on who you are, e.g. "I build Solana infrastructure" plus one concrete thing you've shipped.]
>
> **[The problem, 25s]** AI agents can pay for things now. x402 turned an HTTP request into a checkout, and on Solana that checkout takes USDC. But the world doesn't price everything in USDC. A service wants SOL, or BONK, or its own token. A human would open a DEX, connect a wallet and click swap. An agent can't click.
>
> **[What we built, 30s]** So we built AgentSwap: a swap API made for agents. Ask for a quote for free. Ask for a swap and the server answers with an HTTP 402 price tag, one cent in USDC. The agent's x402 client pays it, gets back an unsigned transaction routed by Jupiter, signs it locally and sends it. We never touch the keys. We ran it for real on mainnet during the hackathon, and the transaction is on Solscan.
>
> **[Why us, 25s]** [ADD: why you: previous Solana or trading infra, agents you've built, how fast you ship. Keep it concrete.] We shipped the API, the x402 paywall, the MCP server, the site and a real paid swap within this hackathon.
>
> **[What's next, 20s]** Today we're a thin, honest wrapper over Jupiter. The business is next: our own liquidity pools tuned for agent flow, meaning small, frequent, predictable swaps. Then any token, for any x402 seller that wants to accept whatever an agent holds.
>
> **[Close, 5s]** AgentSwap: let your agent pay with whatever the world accepts. Thanks.

## Before you submit

- [x] Deployed: https://agentswap.forge-3.workers.dev (PAY_TO set in wrangler.jsonc; MCP: `claude mcp add --transport http agentswap https://agentswap.forge-3.workers.dev/mcp`).
- [ ] Commit and push everything to github.com/pu0238/agentswap (the videos/, pitch/ and site changes are not committed yet).
- [ ] Fill the two [ADD] lines in the pitch script with real facts about you.
