# AgentSwap: pitch deck outline (hackathon, recorded)

Format: 12 slides, about 3 minutes spoken (about 15s per slide). This is a hackathon pitch rather than a fundraise, so the ask slide asks for what a hackathon can give. Every number is either real (from the PoC) or marked **[verify]** with the way to get it. Nothing is invented.

---

## 1. Title
- **Key message:** A swap button for AI agents.
- **Content:** AgentSwap · "Your agent has USDC. The site wants something else. We fix that in one API call." · Michał Łustyk, Forge3
- **Design:** Dark canvas, "Agent**Swap**" wordmark with the purple→green gradient, one line of copy, nothing else.

## 2. Problem
- **Key message:** Agents can pay now, but only with the token they happen to hold.
- **Content:**
  - x402 lets agents pay per HTTP call. On Solana, x402 payments are settled in USDC.
  - Sites, APIs and on-chain services price in SOL, USDC, USDT, memecoins and their own tokens. The token in the wallet rarely matches the one at checkout.
  - Today's fix is a human: open a DEX, connect a wallet, click swap. Agents have no browser wallet and no mouse.
  - [verify] number of x402 transactions and paying agents on Solana this month (x402 explorers / facilitator stats)
- **Design:** Big type. The agent wallet shows "USDC", the checkout wants "BONK", and a red ✕ sits between them.

## 3. Solution
- **Key message:** One HTTP call turns the token you have into the token you need.
- **Content:**
  - **Priced per call:** $0.01 USDC via x402, with no accounts and no API keys.
  - **Best route:** Jupiter-routed across every major Solana DEX.
  - **Non-custodial:** we return an unsigned transaction, the agent signs it, and we never see a key.
- **Design:** Three columns taken from the landing page's "How it works" cards.

## 4. Demo
- **Key message:** A real agent buys a token on mainnet with no human in the loop.
- **Content:** `GET /quote` (free) → `POST /swap` → **HTTP 402** → the x402 client pays $0.01 → unsigned tx → sign locally → send → Solscan ✓
  - **Magic moment:** the 402 is machine-readable. The agent pays, retries and continues on its own.
  - Before: 6 human clicks and a wallet popup. After: 2 HTTP calls.
- **Design:** Terminal screenshot of the real `pnpm demo` run next to the Solscan tx page.

## 5. Market
- **Key message:** Every agent that pays in crypto sometimes holds the wrong token.
- **Content (bottom-up, fill before recording):**
  - [verify] agent payment volume: monthly x402 transactions on Solana
  - Assumption: X% of agent payments need a swap first, with an average swap of $Y
  - Revenue = transactions × X% × $0.01 now, plus a pool spread later
  - **Why now:** the x402 v2 SDKs have Solana support, facilitators sponsor fees, MCP made "tools for agents" a distribution channel, and Jupiter made routing a commodity.
- **Design:** One funnel of the formula. Don't show TAM numbers we can't source.

## 6. Traction
- **Key message:** Built and working on mainnet in one hackathon.
- **Content (honest):**
  - Working API, MCP server, landing page, skill.md and llms.txt, deployed on Cloudflare Workers
  - Live Jupiter quotes; x402 402-challenge verified against a mainnet facilitator
  - [after run] first real mainnet swap paid via x402: tx link
  - 0 users and $0 revenue so far. That is day 0, and we say so.
- **Design:** A checklist with ✓ marks and the Solscan link as a QR code. No fake charts.

## 7. Business model
- **Key message:** Toll per call today, spread on our own liquidity tomorrow.
- **Content:**
  - Phase 1: $0.01 per swap build (x402). Facilitator cost is about $0.0015 per settlement, so gross margin is about 85% per call [verify facilitator fee].
  - Phase 2: our own pools tuned for agent flow (small, frequent, predictable swaps) earning an LP spread.
  - CAC is about $0: agents find us through MCP registries, llms.txt and x402 directories.
- **Design:** Two-step staircase: "toll" → "liquidity".

## 8. Competition
- **Key message:** DEXs are built for humans and wallets. We're built for agents.
- **Content:** 2×2 matrix with the axes **agent-native (x402 / MCP) ↔ human UI** and **non-custodial ↔ custodial**.
  - Jupiter/Raydium UIs: non-custodial, human-first
  - Custodial agent wallets/exchanges: agent-friendly, custodial
  - AgentSwap: agent-native **and** non-custodial
  - Defensibility: owned pools plus agent-flow data. Being a wrapper is not a moat, and we say that openly.
- **Design:** Classic 2×2 with AgentSwap alone in the top-right quadrant.

## 9. Go-to-market
- **Key message:** Distribution happens where agents already look for tools.
- **Content:**
  - List in MCP registries, x402 service directories and agent frameworks (Claude, ElizaOS, Solana Agent Kit)
  - Ship a plugin or skill for each major agent framework
  - Pair with x402 sellers: "accept any token" via AgentSwap
- **Design:** Three logos or badges in a row, one sentence each.

## 10. Team
- **Key message:** A team that ships Solana infra fast.
- **Content:** Michał Łustyk, Forge3. [add: previous Solana bots, trackers, liquidity tooling, anything shipped]. Built this PoC end to end during the hackathon.
- **Design:** One photo, three proof bullets.

## 11. The ask
- **Key message:** Help us move from wrapper to liquidity.
- **Content (hackathon version):**
  - Feedback from x402 and agent-framework builders
  - Intros to agent teams that pay on Solana today
  - Grant or prize money for the first pool, with milestones: 100 agent swaps on mainnet → first own pool → second chain
- **Design:** Three milestones on a line.

## 12. Closing
- **Key message:** Agents should pay with whatever the world accepts.
- **Content:** "AgentSwap: let your agent pay with whatever the world accepts." · github.com/pu0238/agentswap · michal.lustyk@forge-3.com · data point to remember: **$0.01 and 0 keys shared**
- **Design:** The wordmark again, plus the `claude mcp add …` command in a terminal pill.

---

## Appendix (Q&A backup)
1. Architecture: Worker → x402 middleware → Jupiter, with the non-custodial flow diagram
2. The x402 flow in detail: 402 challenge → payment payload → facilitator verify and settle
3. Security: why unsigned transactions make the service non-custodial; slippage bounds; limits
4. Unit economics sheet: fee, facilitator cost, pool spread assumptions
5. Competitive detail: Jupiter API vs. custodial agent wallets vs. AgentSwap
