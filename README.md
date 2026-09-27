# AgentSwap

Hackathon PoC: token swaps for AI agents on Solana.

Agents pay for services with **x402**, but they don't always hold the token a service accepts. AgentSwap wraps **Jupiter** behind an agent-friendly API:

- `GET /api/quote` is free.
- `POST /api/swap` costs **$0.01 USDC via x402** and returns an **unsigned** transaction. The agent signs it, so the service is non-custodial.
- `POST /mcp` is an MCP server (`list_tokens`, `get_quote`, `swap_info`).
- `/`, `/skill.md` and `/llms.txt` serve the landing page and the agent docs.

It all runs in one stateless Cloudflare Worker (Hono) with no database.

```
src/index.ts    routes + x402 paywall on /api/swap
src/jupiter.ts  Jupiter quote/swap client
src/tokens.ts   token list + amount conversion
src/mcp.ts      stateless MCP server
public/         landing, skill.md, llms.txt
demo/agent.ts   end-to-end agent: quote → pay → sign → send
```

## Run

```bash
pnpm install
pnpm dev                       # http://localhost:8787
pnpm demo USDC SOL 1           # dry run: prints the quote and the x402 challenge
```

Full demo on mainnet:

```bash
cp .dev.vars.example .dev.vars   # set PAY_TO (wallet that receives fees)
cp .env.example .env             # set AGENT_SECRET_KEY (throwaway wallet: ~$2 USDC + ~0.01 SOL)
pnpm dev                         # restart so .dev.vars is picked up
pnpm demo USDC SOL 1
```

## Config (`wrangler.jsonc` vars)

| var | default | |
|---|---|---|
| `PAY_TO` | — | **set this**: Solana address that receives swap fees |
| `X402_NETWORK` | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | mainnet; devnet is `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |
| `FACILITATOR_URL` | `https://facilitator.payai.network` | x402 facilitator that supports Solana |
| `SWAP_PRICE` | `$0.01` | |
| `JUP_API_BASE` | `https://lite-api.jup.ag/swap/v1` | set a `JUP_API_KEY` secret together with `https://api.jup.ag/swap/v1` |

## Deploy

```bash
pnpm wrangler deploy
```

## Not in scope (yet)

Own liquidity pools, accounts/API keys, rate limiting, arbitrary mints, EVM chains.
