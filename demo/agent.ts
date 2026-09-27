/**
 * AgentSwap demo agent: quote → pay $0.01 via x402 → get unsigned swap tx → sign → send.
 *
 *   AGENT_SECRET_KEY=<base58 secret or JSON byte array> \
 *   AGENTSWAP_URL=http://localhost:8787 \
 *   pnpm demo USDC SOL 1
 *
 * Without AGENT_SECRET_KEY it runs dry: shows the quote and the x402 payment challenge.
 */
import {
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getSignatureFromTransaction,
  getTransactionDecoder,
  signTransaction,
} from "@solana/kit";
import { wrapFetchWithPayment, decodePaymentResponseHeader } from "@x402/fetch";
import { x402Client } from "@x402/core/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";

const API = process.env.AGENTSWAP_URL ?? "http://localhost:8787";
const RPC = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const [from = "USDC", to = "SOL", amount = "1"] = process.argv.slice(2);

const log = (step: string, data?: unknown) =>
  console.log(`\n▸ ${step}`, data === undefined ? "" : JSON.stringify(data, null, 2));

// 1. Free quote
const quote = await fetch(`${API}/api/quote?${new URLSearchParams({ from, to, amount })}`).then((r) => r.json());
log(`Quote ${amount} ${from} → ${to}`, quote);

const secret = process.env.AGENT_SECRET_KEY;
if (!secret) {
  const res = await fetch(`${API}/api/swap`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  const challenge = JSON.parse(atob(res.headers.get("PAYMENT-REQUIRED") ?? "e30="));
  log(`POST /api/swap without payment → HTTP ${res.status}`, challenge.accepts);
  console.log("\nDry run. Set AGENT_SECRET_KEY to pay and execute the swap.");
  process.exit(0);
}

const bytes = secret.trim().startsWith("[")
  ? new Uint8Array(JSON.parse(secret))
  : new Uint8Array(getBase58Encoder().encode(secret.trim()));
const agent = await createKeyPairSignerFromBytes(bytes);
log("Agent wallet", agent.address);

// 2. Paid call: x402 client signs a $0.01 USDC transfer and retries automatically
const paidFetch = wrapFetchWithPayment(
  fetch,
  new x402Client().register("solana:*", new ExactSvmScheme(agent, { rpcUrl: RPC })),
);
const res = await paidFetch(`${API}/api/swap`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ from, to, amount, userPublicKey: agent.address }),
});
if (!res.ok) throw new Error(`swap failed: HTTP ${res.status} ${await res.text()}`);
const receipt = res.headers.get("PAYMENT-RESPONSE");
if (receipt) log("x402 fee paid", decodePaymentResponseHeader(receipt));
const { swapTransaction } = (await res.json()) as { swapTransaction: string };

// 3. Sign locally and send — AgentSwap never sees the key
const tx = getTransactionDecoder().decode(getBase64Encoder().encode(swapTransaction));
const signed = await signTransaction([agent.keyPair], tx);
const sig = getSignatureFromTransaction(signed);
await createSolanaRpc(RPC)
  .sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64", skipPreflight: false })
  .send();
log("Swap sent", `https://solscan.io/tx/${sig}`);
