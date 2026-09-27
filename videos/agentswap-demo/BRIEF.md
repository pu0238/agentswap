---
workflow: product-launch-video
flow: automation
storyboard: yes
message: "AgentSwap lets any AI agent swap Solana tokens in one x402-paid HTTP call, and it never touches the agent's keys."
destination: youtube
aspect: 1920x1080
language: en
audience: hackathon judges and crypto/AI-agent developers
length: 59s
angle: problem-solution-live-demo
narration: yes
---

## Intent

A 3-minute hackathon demo of AgentSwap. Shape: about 30s on the problem (the agent holds USDC, but the site wants another token, or the x402 endpoint wants USDC and the agent only has SOL), about 30s on the solution and architecture (x402 paywall plus Jupiter routing, non-custodial unsigned tx), about 90s of live demo (quote → HTTP 402 challenge → x402 payment → local sign → send → Solscan, plus the MCP tools in Claude), and about 30s on the roadmap (own liquidity pools). English AI voiceover with captions and a quiet music bed.

## Assets

- ../../public/index.html: the AgentSwap landing page, captured from local `wrangler dev` (http://localhost:8787)
- ../../demo/agent.ts: the demo agent script; its real terminal output is the live-demo material
- ../../README.md, ../../public/skill.md: product facts

## Customizations

- Live-demo beat uses a REAL mainnet swap: the user funds a throwaway wallet, sets PAY_TO, runs `pnpm demo`, and the real Solscan tx link and terminal output go into the video. Never fake a transaction.
- Look taken from the landing page (dark background, Solana green #14f195 / purple #9945ff).

## Notes

- Hackathon PoC: say so honestly. Mainnet only, small amounts, 7 listed tokens.
- User chose the ~2:10 cut (VO-driven) over padding to 3:00; 3 min is a cap, not a goal.
