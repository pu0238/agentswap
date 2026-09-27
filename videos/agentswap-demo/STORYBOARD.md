---
format: 1920x1080
duration: 67s
message: "AgentSwap lets any AI agent swap Solana tokens in one x402-paid HTTP call, and it never touches the agent's keys."
arc: hook → pain → product → one continuous live demo (quote → 402 → pay/sign/send → on-chain) → MCP → next → CTA
audience: hackathon judges and crypto/AI-agent developers
mode: collaborative
music: confident minimal tech underscore, low and steady
---

## Direction

- **Format:** 1920×1080, ~130s, English VO (HeyGen), quiet music bed, captions on, so content stays in the top ~83%.
- **Spine:** the agent's **wallet tag**, a square mono tag `AGENT WALLET · USDC` in the top-left. It holds the wrong token in 01 and stays through the demo (04–06). In 07 it flips to `AGENT WALLET · SOL ✓` (callback to 01) and stays green to the end.
- **Brand (the approved AgentSwap v2 system, see frame.md):** navy ground #012136 · deep panels #000E18 (holo + 3D caltrop live here) · cream #F1EDE6 for text and 2px square frames · muted #8FA3B2 · green #14F195 only for price/live signals, with navy text. Type: Archivo 900 at width 125%, UPPERCASE display · Archivo 500 body · Geist Mono labels and terminal.
- **Bans:** no rounded corners, no dotted backgrounds, no glow or soft shadows; no fake product UI (terminal text is real `pnpm demo` / MCP output, and Solscan is a real screenshot); no invented numbers; no crypto clichés. Avoid the slideshow (every beat a fresh card) and the screensaver (motion that says nothing).
- **Held frame:** 07 (Solscan proof). The 3D holo caltrop appears in 01 (hook) and 10 (end); 03 shows it inside the real landing page.
- **Seam direction:** leftward throughout.
- **Truthfulness:** the demo (04–07) is ONE real mainnet run (capture/extracted/terminal-paid-run.txt): its quote, its 402, its receipts and its Solscan page. 08 is the real MCP output. 03 is the real landing at 1:1.

## Video direction

- **Palette (frame.md, by role):** ground navy #012136 · deep panels #000E18 for every holo, 3D or terminal surface · cream #F1EDE6 for type and 2px square frames · muted #8FA3B2 for secondary type · green #14F195 only for money/live signals ($0.01, ✓, live dot), with navy text · holo foil and holo text only on deep.
- **Type:** display = Archivo 900, width 125%, UPPERCASE · body = Archivo 500 · mono = Geist Mono (labels, terminal, code). Referenced by role; the files are in fonts/.
- **Persistent chrome:** top-left wallet tag (square, 2px cream border, mono uppercase) on 01, 02 and 04–07 and 10; top-right "NN / 10" counter on every frame except 03 (full-bleed page). A holo progress strip on a deep track sits just above the caption band and fills with the timeline (100% on 10).
- **Motion grammar:** long-tail settles (power3.out default, expo.out for fast arrivals); no bounce or overshoot. Every piece reveals on the VO word that names it (word times come from audio_meta.json); nothing is front-loaded. Entrances are fromTo. Reveals are hard wipes (clip-path inset) or short 24px rises; square things wipe, type rises. Holo surfaces shimmer (background-position sweep) across their whole life.
- **Rhythm / held frames:** 07 is the held proof beat. 04–06 read as one terminal session: the same panel in the same place, content continuing.
- **3D caltrop:** three.js holo caltrop driven by the frame timeline in 01 and 10 (right lens).
- **Negative list:** no repeated content (each fact is said or shown ONCE; the demo is the only place the flow appears), no keyboard/typing SFX, no rounded corners, no dotted backgrounds, no glow or blur bloom, no soft drop shadows, no gradient washes on navy, no emoji, no fake UI (terminal text and Solscan are real), no invented numbers, no infinite/looping tweens, no CSS keyframe motion. Both failure modes are banned: the slideshow (front-load then freeze) and the screensaver (everything drifting).

## Changes from v2

- User review (2026-09-27): "the keyboard sound goes", "don't repeat content: the idea is repeated, and it's shown again in the demo; shorten if there isn't enough content", "keep continuity", "the AgentSwap page doesn't look like a real page".
- Cut: old 04 (three-steps table), 05 (never your keys) and 11 (four ways in). They re-told what the demo shows or what 03/08 already say. "No browser, no wallet popup" is cut from the demo because it repeated 02.
- Review 2 (2026-09-27): tokens must appear as they are spoken (01); 02 needs "but"; 03 opens with "That's why we built AgentSwap"; 08 adds the Claude Code strategy line (true: code on the HTTP API; no MCP swap execution claimed); 10 gets a closing sentence for a falling end tone.
- The demo is now ONE continuous run (the real paid mainnet run): the same terminal panel carries the quote, the 402 and the receipts.
- 03 shows the landing full-bleed at 1:1 so it reads as a real web page, not a thumbnail in a frame.
- No typing SFX anywhere. The new length follows the new VO (~65–70s).

## Still open

- Old storyboard.html sketches show the v2 13-frame cut; the built frames are the truth for this revision.

## Frame 1 — Wrong token

- scene: "YOUR AGENT HAS USDC." then a holo token cycle ends on BONK; caltrop lens right
- voiceover: "Your agent has USDC. But the site wants SOL. Or BONK. Or JUP."
- duration: 5.812s
- transition_in: crossfade
- status: animated
- src: compositions/frames/01-wrong-token.html
- type: hook
- persuasion: Pain validation
- beat: tension
- blueprint: compose
- focal: caltrop lens
- asset_candidates:

Scene 1 (0.0–2.7s): lens wipes open with the caltrop tumbling; "YOUR AGENT HAS USDC." rises on "Your agent". Scene 2 (2.7–4.5s): "THE SITE WANTS" rises; the holo token hard-cuts SOL → JUP → BONK, landing on BONK on the spoken word. Hold.


## Frame 2 — Agents can't click

- scene: three human steps struck through; "AGENTS CAN'T CLICK." on deep
- voiceover: "Swapping takes a DEX, a wallet popup and a click. But an agent can't click."
- duration: 6.421s
- transition_in: crossfade
- status: animated
- src: compositions/frames/02-agents-cant-click.html
- type: pain_point
- persuasion: Negative contrast
- beat: frustration
- blueprint: kinetic-type-beats (Adapt)
- focal: "AGENTS CAN'T CLICK."
- asset_candidates:

Scene 1 (0.0–4.2s): split opens; "OPEN A DEX", "WALLET POPUP", "CLICK" land on their words and each gets a green strike. Scene 2 (4.2–5.7s): "AGENTS CAN'T" then holo "CLICK." on the right. Hold.


## Frame 3 — Meet AgentSwap

- scene: the real landing full-bleed at 1:1, then a slow scroll to the trust band
- voiceover: "That's why we built AgentSwap: swaps and payments made for agents. It builds the transaction through Jupiter, and your agent signs it. We never touch the keys."
- duration: 9.678s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/03-meet-agentswap.html
- type: product_intro
- persuasion: Show-don't-tell proof, risk reversal
- beat: clarity + trust
- blueprint: titlecard-reveal (Adapt)
- focal: assets/full-page.png
- asset_candidates: assets/full-page.png — the real navy landing, 1920 wide, shown 1:1 full-bleed

Scene 1 (0.0–7.3s): the real landing fills the frame 1:1 (it reads as the actual web page) and holds while the VO names what it is. Scene 2 (7.3–9.0s): one page scroll down to the "NON-CUSTODIAL BY DESIGN" band on "We never touch the keys". Hold.


## Frame 4 — Demo: quote

- scene: terminal: pnpm demo USDC SOL 1 → the real quote (0.008186968 SOL via Byreal)
- voiceover: "Here is a real agent on mainnet. It asks for a quote. That part is free."
- duration: 4.95s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/04-demo-quote.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: curiosity
- blueprint: prompt-type-submit-generate (Adapt)
- focal: terminal panel
- asset_candidates:

Scene 1 (0.0–2.5s): the shared terminal panel; "$ pnpm demo USDC SOL 1" types on (silent). Scene 2 (2.5–4.7s): the real quote lines land (0.008186968 SOL, Byreal via Jupiter); a green FREE tag pops on "free".


## Frame 5 — Demo: 402

- scene: same terminal: POST /api/swap → 402 stamp + decoded price
- voiceover: "Then it asks for the swap. The server answers 402: one cent, in USDC."
- duration: 6.413s
- transition_in: crossfade
- status: animated
- src: compositions/frames/05-demo-402.html
- type: feature_showcase
- persuasion: Show-don't-tell proof
- beat: intrigue
- blueprint: agent-progress-theater (Adapt)
- focal: "402" in holo
- sfx: impact-soft (402 stamp)
- asset_candidates:

Scene 1 (0.0–2.8s): same terminal; the quote collapses to one muted line; "$ POST /api/swap" lands. Scene 2 (2.8–6.1s): "← 402 Payment Required" and a big holo 402 stamp; then "= $0.01 USDC" (green) on "one cent", and network/fee on "USDC".


## Frame 6 — Demo: pay, sign, send

- scene: same terminal: the real receipts check off (fee paid · unsigned tx · signed · sent)
- voiceover: "Its x402 client pays, gets an unsigned transaction, signs it locally and sends it. No human in the loop."
- duration: 8.999s
- transition_in: crossfade
- status: animated
- src: compositions/frames/06-demo-pay-sign-send.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: ease → power
- blueprint: agent-progress-theater (Reproduce)
- focal: receipt lines
- sfx: tick (receipts)
- asset_candidates:

Scene 1 (0.0–6.6s): same terminal; the real receipts check off on their words: fee paid (pays), unsigned tx (unsigned), signed locally (signs), swap sent (sends). Scene 2 (7.3–8.7s): holo "NO HUMAN IN THE LOOP." Hold.


## Frame 7 — Demo: on-chain

- scene: the real Solscan page; wallet tag flips to SOL ✓
- voiceover: "Confirmed on Solscan: one USDC in, SOL out."
- duration: 5.611s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/07-demo-onchain.html
- type: feature_showcase
- persuasion: Show-don't-tell proof, verifiable
- beat: triumph
- blueprint: video-text-pivot (Adapt)
- focal: assets/solscan-tx.png
- sfx: impact-soft (success outline)
- asset_candidates: assets/solscan-tx.png — real Solscan page of the swap (crop y≈230–660)

Scene 1 (0.0–1.8s): the wallet tag is green SOL ✓; the real Solscan crop wipes in and SUCCESS · Finalized gets outlined. Scene 2 (1.8–4.9s): "1 USDC IN" then "0.008186967 SOL OUT". Held proof beat.


## Frame 8 — Ask Claude

- scene: one real get_quote tool call and result
- voiceover: "It's also an MCP server. Ask Claude how much BONK five USDC buys, or let Claude Code build your trading strategy on top of the API."
- duration: 9.051s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/08-ask-claude.html
- type: feature_showcase
- persuasion: Friction reduction
- beat: delight
- blueprint: prompt-type-submit-generate (Reproduce)
- focal: MCP result panel
- asset_candidates:

Scene 1 (0.0–3.6s): "NO CODE · MCP" then "ALSO AN MCP SERVER.". Scene 2 (3.6–6.5s): the question types on (silent), then the real get_quote result: 1,366,700 BONK via BisonFi → Whirlpool → Scorch.


## Frame 9 — What's next

- scene: NOW (green) → NEXT (holo) → LATER
- voiceover: "Next: our own liquidity pools, built for agent flow."
- duration: 5.232s
- transition_in: crossfade
- status: animated
- src: compositions/frames/09-whats-next.html
- type: benefit_highlight
- persuasion: Future pacing
- beat: aspiration
- blueprint: compose
- focal: NEXT column
- asset_candidates:

Scene 1 (0.0–4.2s): two columns: NOW (green, muted content: Jupiter-routed) and NEXT (holo header), where "OWN POOLS" and "built for agent flow" land on their words. Hold.


## Frame 10 — Plug it in

- scene: wordmark + holo claim + claude mcp add + GitHub; caltrop callback
- voiceover: "AgentSwap. Let your agent pay with whatever the world accepts. Plug it in today."
- duration: 5.616s
- transition_in: zoom-through
- status: animated
- src: compositions/frames/10-plug-it-in.html
- type: cta
- persuasion: Friction reduction, single command
- beat: motivation
- blueprint: logo-assemble-lockup (Adapt)
- focal: AgentSwap lockup
- sfx: impact-soft (lockup)
- asset_candidates:

Scene 1 (0.0–4.4s): the wordmark slams in, the caltrop lens opens, the holo claim lands on "whatever", and the MCP command and GitHub URL settle; the progress strip completes. Final frame.

