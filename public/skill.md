---
name: agentswap
description: Swap tokens on Solana (e.g. USDC → SOL, SOL → USDC, USDC → BONK) when you need a different token to pay for something. Paid per call via x402; returns an unsigned transaction you sign yourself.
---

# AgentSwap: token swaps for agents on Solana

Use this skill when you hold one Solana token and need another one. Common cases are a site that won't take the token you have, or an x402 endpoint that needs USDC while you only hold SOL.

Base URL: the origin you loaded this file from (below: `$API`).

## Flow

1. **List tokens** (free): `GET $API/api/tokens` returns `[{ symbol, mint, decimals }]`. `from` and `to` accept either a symbol or a mint.
2. **Quote** (free): `GET $API/api/quote?from=USDC&to=SOL&amount=1&slippageBps=50`
   - `amount` is in human units of `from`, e.g. `"1.5"`.
   - Response: `{ from, to, inAmount, outAmount, minOutAmount, priceImpactPct, route }`.
3. **Build swap** (paid, $0.01 USDC via x402): `POST $API/api/swap`
   ```json
   { "from": "USDC", "to": "SOL", "amount": "1", "userPublicKey": "<your wallet>", "slippageBps": 50 }
   ```
   - The first call returns **HTTP 402** with a `PAYMENT-REQUIRED` header (base64 JSON). Use an x402 client such as `@x402/fetch` with `@x402/svm` to pay and retry automatically.
   - On success: `{ swapTransaction, lastValidBlockHeight, quote }`. `swapTransaction` is a base64 unsigned `VersionedTransaction`.
4. **Sign and send** it yourself. Decode it, sign it with your keypair, and send it to any Solana RPC before `lastValidBlockHeight`.

## TypeScript

```ts
import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { createSolanaRpc, getBase64Encoder, getBase64EncodedWireTransaction,
         getTransactionDecoder, signTransaction } from "@solana/kit";

const paidFetch = wrapFetchWithPayment(fetch,
  new x402Client().register("solana:*", new ExactSvmScheme(signer)));

const res = await paidFetch(`${API}/api/swap`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ from: "USDC", to: "SOL", amount: "1", userPublicKey: signer.address }),
});
const { swapTransaction } = await res.json();
const tx = getTransactionDecoder().decode(getBase64Encoder().encode(swapTransaction));
const signed = await signTransaction([signer.keyPair], tx);
await createSolanaRpc(RPC_URL).sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" }).send();
```

## Notes

- Solana mainnet only. Swaps are routed through Jupiter.
- You need a little SOL for network fees. The x402 fee itself is sponsored by the facilitator.
- AgentSwap never sees your private key.
- MCP: `$API/mcp` exposes `list_tokens`, `get_quote` and `swap_info`.
