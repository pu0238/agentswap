# Asset descriptions

The page loads no raster images; the captured screens are the visual assets. Written by hand from the screenshots because no vision key is available. This is the paper landing (#DCD3C6 ground, ink #121212, square frames, Archivo Expanded, holo on ink, 3D caltrop), re-captured after the switch from navy.

- screenshots/full-page.png: the whole landing at 1920 wide, top to bottom: header, hero (H1 "YOUR AGENT HAS USDC. THE SITE WANTS BONK." with holo BONK, deep panel with the 3D holo caltrop and a live-quote bar), 4-stat strip ($0.01 / 0 / 2 / 0), problem/fix split, "ONE SWAP, FOUR MESSAGES." flow table, curl + TypeScript code panes, "FOUR WAYS IN." (HTTP API / MCP / SKILL.MD / LLMS.TXT) with the claude mcp add command, "SEVEN TO START." token table, "NON-CUSTODIAL BY DESIGN." trust band, "WHERE THIS GOES." roadmap, QUOTE ✦ PAY $0.01 marquee, footer claim and holo rule
- screenshots/scroll-000.png: hero, starting mid-H1 ("THE SITE WANTS BONK."), lead copy, CTAs, live-quote bar and stat strip
- screenshots/scroll-017.png: CTAs, live quote, stat strip, problem/fix split
- screenshots/scroll-034.png: fix column and the full "ONE SWAP, FOUR MESSAGES." flow table (402 row on holo foil, $0.01 green tag)
- screenshots/scroll-052.png: curl + TypeScript code panes and "FOUR WAYS IN." cards
- screenshots/scroll-069.png: the four interface cards, the claude mcp add command, and the "SEVEN TO START." token table
- screenshots/scroll-086.png: the token table tail and the "NON-CUSTODIAL BY DESIGN." trust band
- screenshots/scroll-100.png: trust tail, roadmap (NOW green / NEXT holo / LATER), marquee and footer

Real text outputs (not images): extracted/terminal-demo-dryrun.txt (real `pnpm demo` dry run), extracted/mcp-get-quote.txt (real MCP get_quote).
Real mainnet run (2026-09-27 07:47 UTC), both txs finalized with err=None:
- extracted/terminal-paid-run.txt: real `pnpm demo USDC SOL 1` output: quote 1 USDC → 0.008186967 SOL via Byreal; x402 fee paid (payer 7QbNPZ…DuSL, tx 3Vw7GZn4…c6f4e); swap sent, tx 2SpRNZCS…BopWMx
- assets/solscan-tx.png: real Solscan page for the swap tx: "Swap 1 USDC for 0.008186967 WSOL on Jupiter Aggregator v6", Result SUCCESS · Finalized (MAX Confirmations), signer 7QbNPZ…DuSL, route Byreal CLMM. Use the crop y≈230–660 (summary, signature, result, signer, actions). It has a third-party "Sponsored" ad line at y≈168 and a cookie banner at the bottom, so crop both out.
