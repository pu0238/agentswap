---
format: 1920x1080
duration: 130s
message: "AgentSwap lets any AI agent swap Solana tokens in one x402-paid HTTP call, and it never touches the agent's keys."
arc: PAS with a Demo Loop (hook → pain → product intro → mechanism → trust → demo ×5 → breadth → roadmap → CTA)
audience: hackathon judges and crypto/AI-agent developers
mode: collaborative
music: confident minimal tech underscore, low and steady
---

## Direction

- **Format:** 1920×1080, ~130s, English VO (HeyGen), quiet music bed, captions on, so content stays in the top ~83%.
- **Spine:** the agent's **wallet tag**, a square mono tag `AGENT WALLET · USDC` in the top-left. It holds the wrong token in 01, gets struck in 02, and ticks through the demo (06–08). In 09 it flips to `AGENT · SOL ✓` (callback to 01), then settles into the lockup in 13.
- **Brand (the approved AgentSwap v2 system, see frame.md):** navy ground #012136 · deep panels #000E18 (holo + 3D caltrop live here) · cream #F1EDE6 for text and 2px square frames · muted #8FA3B2 · green #14F195 only for price/live signals, with navy text. Type: Archivo 900 at width 125%, UPPERCASE display · Archivo 500 body · Geist Mono labels and terminal.
- **Bans:** no rounded corners, no dotted backgrounds, no glow or soft shadows; no fake product UI (terminal text is real `pnpm demo` / MCP output, and Solscan is a real screenshot); no invented numbers; no crypto clichés. Avoid the slideshow (every beat a fresh card) and the screensaver (motion that says nothing).
- **Held frame:** 09. The 3D holo caltrop appears in 01 (hook), 03 (intro) and 13 (end). The Solscan proof holds still for a beat while the line lands.
- **Seam direction:** leftward throughout.
- **Truthfulness:** 06, 07, 08 and 10 use real captured output (capture/extracted/*.txt), and 09 uses a real Solscan screenshot of the finalized mainnet swap.

## Video direction

- **Palette (frame.md, by role):** ground navy #012136 · deep panels #000E18 for every holo, 3D or terminal surface · cream #F1EDE6 for type and 2px square frames · muted #8FA3B2 for secondary type · green #14F195 only for money/live signals ($0.01, ✓, live dot), with navy text · holo foil and holo text only on deep.
- **Type:** display = Archivo 900, width 125%, UPPERCASE · body = Archivo 500 · mono = Geist Mono (labels, terminal, code). Referenced by role; the files are in fonts/.
- **Persistent chrome:** top-left wallet tag (square, 2px cream border, mono uppercase) and top-right "NN / 13" mono counter on every frame except 03, 04, 05, 11 and 12, which carry only the counter. A holo progress strip on a deep track sits at the bottom edge, just above the caption band, and fills with the timeline (frame 13 reaches 100%).
- **Motion grammar:** long-tail settles (power3.out default, expo.out for fast arrivals); no bounce or overshoot. Every piece reveals on the VO word that names it (word times come from audio_meta.json); nothing is front-loaded. Entrances are fromTo. Reveals are hard wipes (clip-path inset) or short 24px rises; square things wipe, type rises. Holo surfaces shimmer (background-position sweep) across their whole life.
- **Rhythm / held frames:** 09 is the held proof beat (Solscan stays still after its reveal). 05 and 12 settle early and hold. 01, 04, 07 and 08 are the high-energy reveal frames.
- **3D caltrop:** a three.js holo caltrop renders from HyperFrames time (hf-seek) in 01 (right lens), 03 (the landing screenshot's own capture shows it; no live 3D), and 13 (right lens). Rotation is time-driven only.
- **Negative list:** no rounded corners, no dotted backgrounds, no glow or blur bloom, no soft drop shadows, no gradient washes on navy, no emoji, no fake UI (terminal text and Solscan are real), no invented numbers, no infinite/looping tweens, no CSS keyframe motion. Both failure modes are banned: the slideshow (front-load then freeze) and the screensaver (everything drifting).

## Changes from v1

- The user approved the AgentSwap v2 design system (navy #012136, square 2px frames, Archivo Expanded, holo on deep panels, 3D holo caltrop) and asked for it on every material. frame.md is remapped and the sketch sheet is redrawn as v2.
- Landing re-captured after the site redesign. Frames 03, 04 and 11 now use the new screenshots (full-page, scroll-034, scroll-069).
- Frame 04 now shows the landing's real "ONE SWAP, FOUR MESSAGES." table instead of the three "How it works" cards.

## Still open

- HeyGen sign-in for the voiceover.

## Frame 1 — Wrong token

- scene: "Your agent has USDC." holds; beneath it the checkout's token cycles SOL → BONK → JUP → WIF, then "AgentSwap" crashes in over the cycle
- voiceover: "Your agent has USDC. The site wants SOL. Or BONK. Or JUP. AgentSwap fixes that in one HTTP call."
- duration: 9.038s
- transition_in: cut
- status: animated
- src: compositions/frames/01-wrong-token.html
- type: hook
- persuasion: Pain validation resolved in the same breath
- beat: tension → relief
- asset_candidates:

- blueprint: ticker-takeover (Adapt)
- focal: 3D caltrop lens
- roles: caltrop = supporting (right lens, deep panel)
- sfx: tick (each token swap), impact-soft (AGENTSWAP bar)

Adapt: keep the in-place token cycle as the signature; the hero crash-in becomes a cream AGENTSWAP bar instead of a logo.
Scene 1 (0.0–2.2s): navy ground, wallet tag "AGENT WALLET · USDC" top-left, counter top-right. "YOUR AGENT HAS USDC." rises word-group on "Your agent has USDC" (0.3s) in display type, left 60% of the frame, upper third. The deep 2px-framed lens on the right 35% wipes open with the caltrop already tumbling. Asymmetric 60/40, 3 layers (ground, lens, type).
Scene 2 (2.2–5.8s): "THE SITE WANTS" (muted) rises at 2.3s; beneath it a deep block holds one holo token that hard-cuts SOL (2.9s) → BONK (4.1s) → JUP (4.9s), in-place token cycle, one tick per swap.
Scene 3 (5.8–9.0s): on "AgentSwap" (6.0s) a cream bar with navy "AGENTSWAP FIXES THAT IN ONE HTTP CALL." wipes in left→right under the token block; "ONE HTTP CALL" gets a green underline wipe at 7.3s. Hold still to the end; the caltrop keeps tumbling (time-driven).

narrativeRole: open on the exact mismatch every paying agent hits, and land the value claim immediately.
keyMessage: the token in the wallet is rarely the token at the checkout, and AgentSwap closes that gap.

## Frame 2 — Agents can't click

- scene: pain lands line by line on a bare dark field: "x402 made agents customers." / "open a DEX" / "connect a wallet" / "click swap" (these three get struck through) / "an agent can't click."
- voiceover: "x402 turned AI agents into paying customers. But when they hold the wrong token, a human would open a DEX, connect a wallet, and click swap. An agent can't click."
- duration: 10.005s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-agents-cant-click.html
- type: pain_point
- persuasion: Negative contrast, the human flow versus the agent's reality
- beat: frustration
- asset_candidates:

- blueprint: kinetic-type-beats (Adapt)
- focal: "AN AGENT CAN'T CLICK." panel
- roles: none (typography)
- sfx: whoosh-soft (strike), impact-soft (final line)

Adapt: keep the pain-lands-alone signature; the steps land inside a framed split instead of a bare canvas.
Scene 1 (0.0–3.9s): framed split (left cream-bordered navy panel, right deep panel), both wiping open at t=0 with only the mono kicker "X402 MADE AGENTS CUSTOMERS" on the right (0.3s). Split-screen, top ~83%.
Scene 2 (3.9–8.7s): left panel kicker "A HUMAN WOULD" at 5.5s; "OPEN A DEX" rises at 6.1s, "CONNECT A WALLET" at 6.9s, "CLICK SWAP" at 7.8s. Each gets a green strike-through wiping across ~0.4s after it lands.
Scene 3 (8.7–10.0s): right panel "AN AGENT CAN'T" rises at 8.8s and "CLICK." lands in holo text at 9.6s. Hold.

narrativeRole: explain why the gap exists. Swap UIs are built for humans with wallets and mouse clicks.
keyMessage: swapping today assumes a human in the loop.

## Frame 3 — Meet AgentSwap

- scene: the real navy landing hero rises into frame; the H1 "YOUR AGENT HAS USDC. THE SITE WANTS BONK." and the live-quote bar get outlined in turn
- voiceover: "Meet AgentSwap. A swap API built for agents on Solana. Pay per call with x402, and get back a transaction ready to sign."
- duration: 8.856s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-meet-agentswap.html
- type: product_intro
- persuasion: Show-don't-tell proof, the real product surface
- beat: curiosity → clarity
- asset_candidates: assets/full-page.png — navy v2 landing, hero at top: H1 with holo BONK, 3D caltrop panel, live-quote bar

- blueprint: titlecard-reveal (Adapt)
- focal: assets/full-page.png
- roles: full-page.png = focal (hero crop of the landing)
- sfx: whoosh-soft (landing rise)

Adapt: keep the near-still title prelude; the title is the real landing hero instead of a card.
Scene 1 (0.0–1.6s): the landing's hero crop (full-page.png, top ~1080px region) rises into a 2px cream frame filling ~88% width, top ~83% of frame; on "Meet AgentSwap" (0.3s) a green label tag "MEET AGENTSWAP" wipes in at the frame's lower-left.
Scene 2 (1.6–4.6s): on "a swap API built for agents" (1.8s) a green outline box draws around the H1 region (hard wipe of 4 sides).
Scene 3 (4.6–8.9s): on "Pay per call with x402" (4.6s) the outline slides to the live-quote bar at the hero's lower right; on "ready to sign" (8.2s) it holds. No camera move; still read.

narrativeRole: name the product and its promise on its own real surface.
keyMessage: AgentSwap is an API for agents, not a UI for people.

## Frame 4 — Three calls

- scene: the landing's real "ONE SWAP, FOUR MESSAGES." table; rows light up one per VO cue: 1 quote (free) → 2 402 (holo row) → 3 pay $0.01 → 4 sign & send
- voiceover: "Three steps. Ask for a quote, which is free. Call swap: it answers HTTP 402, your agent pays one cent in USDC, and gets an unsigned transaction. Then the agent signs it and sends it itself."
- duration: 13.61s
- transition_in: crossfade
- status: animated
- src: compositions/frames/04-three-calls.html
- type: feature_showcase
- persuasion: Rule of three
- beat: clarity + ease
- asset_candidates: assets/scroll-034.png — "ONE SWAP, FOUR MESSAGES." flow table: quote, 402 on holo, $0.01 tag, sign and send

- blueprint: agent-progress-theater (Adapt)
- focal: assets/scroll-034.png (reference only: rebuilt as real table text from the landing)
- roles: scroll-034.png = reference (the table copy is re-set live in brand type, same words as the landing)
- sfx: tick (each row)

Adapt: keep the trigger → working → receipt rows; rows are the landing's real "ONE SWAP, FOUR MESSAGES." table.
Scene 1 (0.0–1.4s): "ONE SWAP, FOUR MESSAGES." display headline rises on "Three steps" (0.3s), top-left; the 2px table frame with its deep header row (# / REQUEST / RESPONSE / COST) wipes open below it, rows empty. Full-width strip, top ~83%.
Scene 2 (1.4–3.3s): row 1 wipes in on "Ask for a quote" (1.4s): 1 · GET /api/quote · 200 · amount + route · free.
Scene 3 (3.3–6.5s): row 2 wipes in on "Call swap" (3.3s): POST /api/swap · 402 · $0.01 USDC; its cost cell fills with holo foil on "402" (5.5s).
Scene 4 (6.5–11.0s): row 3 wipes in on "your agent pays" (6.7s): + x402 payment · 200 · unsigned tx, and the green "$0.01" tag pops in on "one cent" (7.2s).
Scene 5 (11.0–13.6s): row 4 wipes in on "Then the agent signs" (11.0s): sign → send · tokens in wallet · SOL fee. Hold.

narrativeRole: walk the mechanism in the product's own three-step language before the live demo proves it.
keyMessage: quote, pay, sign. That is the whole flow.

## Frame 5 — Never your keys

- scene: split. Left, "AgentSwap" builds the transaction via Jupiter (route labels from real quotes: Raydium CLMM, Whirlpool, GoonFi V2). Right, "Agent" signs it with its own key, shown as a lock. The transaction token slides from left to right.
- voiceover: "Routing comes from Jupiter, across every major Solana DEX. The signing stays with the agent. AgentSwap never sees a private key and never holds a cent of your funds."
- duration: 9.378s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-never-your-keys.html
- type: benefit_highlight
- persuasion: Risk reversal, non-custodial by design
- beat: trust + control
- asset_candidates:

- blueprint: comparison-split (Reproduce)
- focal: the "UNSIGNED TX" block crossing the divide
- roles: none (typography)
- sfx: whoosh-soft (tx block crossing)

Scene 1 (0.0–3.8s): split frame (left navy panel "AGENTSWAP DOES", right deep panel "YOUR AGENT DOES") wipes open; on "Routing comes from Jupiter" (0.3s) the left headline "FINDS THE ROUTE." rises and the mono route list (RAYDIUM CLMM · WHIRLPOOL · GOONFI V2, real hops from our quotes) types in by 2.6s. Split-screen 50/50.
Scene 2 (3.8–5.5s): on "The signing stays with the agent" (3.8s) a cream "UNSIGNED TX" block slides left → right across the divide, and the right headline "HOLDS THE KEY. SIGNS IT." rises with "SIGNS IT." in holo.
Scene 3 (5.5–9.4s): on "never sees a private key" (6.4s) the mono line "0 KEYS SHARED" lands under the right headline; on "never holds a cent" (8.0s) "0 FUNDS HELD" lands. Hold.

narrativeRole: answer the judge's first objection (custody and trust) before the demo.
keyMessage: we build the transaction, and the agent owns the signature.

## Frame 6 — Demo: quote

- scene: terminal. `pnpm demo USDC SOL 1` types in; the real quote JSON streams back (1 USDC → 0.008235526 SOL, route GoonFi V2)
- voiceover: "Here's a real agent. It asks: how much SOL for one USDC? The quote comes back live from Jupiter, with the route."
- duration: 7.993s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/06-demo-quote.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: curiosity
- asset_candidates:

- blueprint: prompt-type-submit-generate (Adapt)
- focal: terminal panel
- roles: none (real terminal text from capture/extracted/terminal-demo-dryrun.txt)
- sfx: keyboard-typing (command), tick (JSON lines)

Adapt: the prompt is a shell command; the "answer" is the real quote JSON.
Scene 1 (0.0–1.5s): wallet tag top-left; a deep terminal panel with a 2px cream frame and a mono title bar "TERMINAL · PNPM DEMO" wipes open, filling ~85% width, top ~83%.
Scene 2 (1.5–5.4s): "$ pnpm demo USDC SOL 1" types on with a caret, from "It asks" (1.6s) to about 3.9s.
Scene 3 (5.4–8.0s): on "The quote comes back live" (5.4s) the real JSON lines land one per ~0.25s ("▸ Quote 1 USDC → SOL", outAmount, minOutAmount, route); outAmount is set in green on "live" (6.2s) and the route line lands on "with the route" (7.2s). Hold.

narrativeRole: the start of the live demo loop: the free, zero-risk call.
keyMessage: pricing is one GET away.

Source: capture/extracted/terminal-demo-dryrun.txt (real output). Re-captured from the real run.

## Frame 7 — Demo: 402

- scene: `POST /api/swap` → a big "HTTP 402 Payment Required" stamp → the decoded PAYMENT-REQUIRED rows land one by one: scheme exact · network solana mainnet · amount 10000 (= $0.01 USDC) · feePayer
- voiceover: "Now it asks for the swap. The server says: 402, payment required. One cent, in USDC, on Solana mainnet. And the network fee is sponsored."
- duration: 11.363s
- transition_in: crossfade
- status: animated
- src: compositions/frames/07-demo-402.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: intrigue
- asset_candidates:

- blueprint: agent-progress-theater (Adapt)
- focal: "402" in holo on the deep panel
- roles: none (real PAYMENT-REQUIRED values)
- sfx: impact-soft ("402" stamp), tick (rows)

Scene 1 (0.0–3.8s): wallet tag; left deep panel with mono "POST /API/SWAP" wipes in on "asks for the swap" (0.9s); the right 2px-framed panel for the decoded challenge wipes open empty at 2.5s.
Scene 2 (3.8–6.3s): "402" slams in huge in holo text on "402" (3.8s); "PAYMENT REQUIRED" mono label on "payment required" (4.9s).
Scene 3 (6.3–11.4s): decoded rows land in the right panel on their cues: "amount 10000 = $0.01 USDC" (green tag) on "One cent" (6.3s); "scheme exact · asset EPjFWdd5…Dt1v USDC" on "in USDC" (7.6s); "network solana mainnet" on "Solana mainnet" (8.7s); "feePayer CjNFTjvB…eKww · SPONSORED" on "sponsored" (10.6s). Hold.

narrativeRole: show x402 doing its job, a machine-readable price tag.
keyMessage: the paywall speaks the agent's language.

## Frame 8 — Demo: pay, sign, send

- scene: three receipts check off in order: "x402 fee paid ✓" (the real PAYMENT-RESPONSE) → "tx signed locally ✓" → "swap sent ✓", with the real signature
- voiceover: "The agent pays. It gets back an unsigned transaction. It signs it locally, with its own key, and sends it. No browser. No wallet popup. No human."
- duration: 10.083s
- transition_in: crossfade
- status: animated
- src: compositions/frames/08-demo-pay-sign-send.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease → power
- asset_candidates:

- blueprint: agent-progress-theater (Reproduce)
- focal: the receipt stack
- roles: none (real text from capture/extracted/terminal-paid-run.txt)
- sfx: tick (each ✓), impact-soft ("NO HUMAN.")

Scene 1 (0.0–1.9s): wallet tag reads "AGENT WALLET · USDC → SOL"; row 1 "X402 FEE PAID" wipes in with its green ✓ on "The agent pays" (0.8s); a mono receipt line under it shows "success: true · tx 3Vw7GZn4…c6f4e".
Scene 2 (1.9–4.1s): row 2 "UNSIGNED TX RECEIVED" + ✓ on "gets back an unsigned transaction" (2.6s).
Scene 3 (4.1–7.2s): row 3 "SIGNED LOCALLY" + ✓ on "signs it locally" (4.2s); row 4 "SWAP SENT" + ✓ on "sends it" (6.3s), with the mono line "tx 2SpRNZCS…BopWMx".
Scene 4 (7.2–10.1s): below the stack, three mono words hard-cut in on their cues: "NO BROWSER." (7.4s), "NO WALLET POPUP." (8.4s), "NO HUMAN." (9.4s, in holo). Hold.

narrativeRole: the core loop, done end to end by software.
keyMessage: an agent can now buy the token it needs, fully on its own.

Source: capture/extracted/terminal-paid-run.txt, the real mainnet run. x402 fee tx 3Vw7GZn4…c6f4e, swap tx 2SpRNZCS…BopWMx. Both finalized.

## Frame 9 — Demo: on-chain

- scene: the real Solscan transaction page slides in, and the "Success" status and the token balance change get highlighted, then the frame pivots to one line: "1 USDC → 0.008186967 SOL · $0.01 fee · 0 keys shared"
- voiceover: "And there it is on Solscan. A real mainnet swap, paid for and executed by an agent."
- duration: 6.4s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/09-demo-onchain.html
- type: feature_showcase
- persuasion: Show-don't-tell proof, verifiable on-chain
- beat: triumph
- asset_candidates: assets/solscan-tx.png — real Solscan page: Swap 1 USDC for 0.008186967 WSOL, SUCCESS · Finalized (crop y≈230–660)

- blueprint: video-text-pivot (Adapt)
- focal: assets/solscan-tx.png
- roles: solscan-tx.png = focal (crop y≈230–660: summary, signature, SUCCESS · Finalized, signer; no ad line, no cookie banner)
- sfx: impact-soft (SUCCESS outline)

Adapt: the "video" is the real Solscan page; the pivot lands on the real numbers.
Scene 1 (0.0–2.4s): wallet tag flips green "AGENT WALLET · SOL ✓" (callback to 01); the Solscan crop wipes in on "on Solscan" (1.1s) inside a 2px cream frame, left ~58%, top ~83%.
Scene 2 (2.4–4.1s): a green outline draws around the "SUCCESS · Finalized" row on "A real mainnet swap" (2.6s).
Scene 3 (4.1–6.4s): the right deep panel reveals "1 USDC → 0.008186967 SOL" on "paid for" (4.1s), then "$0.01 FEE · 0 KEYS" on "by an agent" (5.5s). The held proof beat: nothing moves after 5.8s.

narrativeRole: independent, verifiable proof, so judges don't have to trust us.
keyMessage: it is real, and on-chain.

Real: solscan.io/tx/2SpRNZCS6Gw3UeEpjGGaummpkxEJYfYrXCLyncwkooQCWT4kHUKNDyrbX3MBUjUirTmduHZAdAeW2u8jKgBopWMx

## Frame 10 — Ask Claude

- scene: an agent chat. The prompt "How much BONK do I get for 5 USDC?" types in, a `get_quote` MCP tool call runs, and the real result returns: 1,366,700 BONK via BisonFi → Whirlpool → Scorch
- voiceover: "It's also an MCP server. Plug it into Claude, and just ask: how much BONK for five USDC? The tool call answers with a live route."
- duration: 8.829s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/10-ask-claude.html
- type: feature_showcase
- persuasion: Friction reduction, works in the tools agents already use
- beat: delight
- asset_candidates:

- blueprint: prompt-type-submit-generate (Reproduce)
- focal: the MCP tool-call panel
- roles: none (real MCP output from capture/extracted/mcp-get-quote.txt)
- sfx: keyboard-typing (question), tick (result)

Scene 1 (0.0–2.1s): mono kicker "MCP · ANY CLIENT" and "IT'S ALSO AN MCP SERVER." display line rise on "MCP server" (0.9s), top-left.
Scene 2 (2.1–6.7s): "claude mcp add --transport http agentswap …/mcp" types into a thin deep bar on "Plug it into Claude" (2.1s); then the question "HOW MUCH BONK FOR 5 USDC?" types on in display type from "ask" (3.5s) to about 5.8s.
Scene 3 (6.7–8.8s): on "The tool call answers" (6.7s) a deep 2px-framed panel wipes in with "⚙ agentswap · get_quote {from: USDC, to: BONK, amount: 5}", then "→ outAmount 1366700 BONK" (green number) and "route BisonFi → Whirlpool → Scorch" on "live route" (8.0s). Hold.

narrativeRole: show that any MCP-capable agent can use it with zero integration code.
keyMessage: one line of config and your agent can swap.

Source: capture/extracted/mcp-get-quote.txt (real MCP output).

## Frame 11 — Built for agents

- scene: four cards assemble, each from the real surfaces: HTTP API · MCP server · skill.md · llms.txt
- voiceover: "Everything is written for machines. An HTTP API, an MCP server, a skill file, and llms.txt. An agent reads the docs and starts swapping."
- duration: 11.52s
- transition_in: crossfade
- status: animated
- src: compositions/frames/11-built-for-agents.html
- type: benefit_highlight
- persuasion: Value stacking
- beat: confidence
- asset_candidates: assets/scroll-069.png — "FOUR WAYS IN." cards, claude mcp add command, token table

- blueprint: grid-card-assemble (Reproduce)
- focal: the four interface cells
- roles: scroll-069.png = reference only (backplate dropped: it cluttered the cells)
- sfx: tick (each cell)

Scene 1 (0.0–2.2s): "FOUR WAYS IN." display headline rises on "written for machines" (0.8s); the 2px 4-cell grid frame wipes open empty below it. Full-width strip.
Scene 2 (2.2–7.2s): the cells fill left → right on their nouns: "HTTP API" (2.4s), "MCP" in a deep cell (4.3s), "SKILL.MD" (5.7s), "LLMS.TXT" (6.8s). Each cell gets a mono sub-line (/quote · /swap · get_quote · drop-in skill · discoverable).
Scene 3 (7.2–11.5s): the scroll-069 backplate fades up behind the grid to ~30%; on "starts swapping" (10.5s) a green "→ SWAPPING" tag pops at the grid's lower right. Hold.

narrativeRole: breadth. Every way an agent discovers and uses the product.
keyMessage: agent-native from the docs up.

## Frame 12 — What's next

- scene: a timeline pans across three stations: Today: Jupiter-routed, 7 tokens → Next: our own liquidity pools → Then: any token, more chains
- voiceover: "Today, AgentSwap rides on Jupiter's liquidity. Next, we run our own pools, tuned for agent flow. Then, any token, and more chains."
- duration: 10.136s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/12-whats-next.html
- type: benefit_highlight
- persuasion: Future pacing
- beat: aspiration
- asset_candidates:

- blueprint: spatial-pan-stations (Adapt)
- focal: the three roadmap columns
- roles: none (typography)
- sfx: whoosh-soft (each station)

Adapt: the stations are the landing's roadmap columns; no camera pan (the doctrine bans back-half pans), so the columns wipe in place left → right.
Scene 1 (0.0–4.0s): "WHERE THIS GOES." display rises (0.3s); the 3-column 2px frame opens; column 1 header wipes green "NOW · SHIPPED" and "WRAPPER" plus "Jupiter-routed · 7 tokens" land on "Today" / "Jupiter's liquidity" (0.3–2.7s).
Scene 2 (4.0–7.6s): column 2 header in holo "NEXT", with "OWN POOLS" and "tuned for agent flow" landing on "Next" (4.0s) / "agent flow" (6.4s).
Scene 3 (7.6–10.1s): column 3 header "LATER", with "ANY TOKEN" and "more chains" on "Then" (7.6s) / "more chains" (9.3s). Hold.

narrativeRole: show where the hackathon PoC goes, stated honestly as the plan and not as done.
keyMessage: the wrapper is step one, and own liquidity is the business.

## Frame 13 — Plug it in

- scene: the AgentSwap wordmark (purple→green gradient on "Swap") holds; below it the terminal pill types `claude mcp add --transport http agentswap …/mcp`, then github.com/pu0238/agentswap settles
- voiceover: "AgentSwap. Let your agent pay with whatever the world accepts."
- duration: 4.362s
- transition_in: crossfade
- status: animated
- src: compositions/frames/13-plug-it-in.html
- type: cta
- persuasion: Friction reduction, a single command
- beat: motivation
- asset_candidates:

- blueprint: logo-assemble-lockup (Adapt)
- focal: AGENTSWAP lockup
- roles: caltrop = supporting (right lens, callback to 01)
- sfx: impact-soft (lockup)

Adapt: the lockup is the display wordmark plus the caltrop lens; no push-through.
Scene 1 (0.0–1.6s): wallet tag green "AGENT WALLET · SOL ✓"; "AGENTSWAP" display wordmark slams in on "AgentSwap" (0.3s) at the left 60%; the caltrop lens wipes open on the right.
Scene 2 (1.6–4.4s): "LET YOUR AGENT PAY WITH" rises on "Let your agent pay" (1.6s) and "WHATEVER THE WORLD ACCEPTS." lands in holo text on "whatever" (2.9s); the deep command bar "$ claude mcp add --transport http agentswap …/mcp" and the mono "github.com/pu0238/agentswap" wipe in under it by 3.6s; the progress strip completes to 100%. Final frame: hold on a blinking caret.

narrativeRole: close on the brand and the one action that gets someone started.
keyMessage: one command away.
