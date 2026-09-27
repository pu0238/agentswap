/**
 * One-time setup: make sure PAY_TO has a USDC token account, because x402 payments are plain
 * USDC transfers into that account and fail if it doesn't exist. Pays ~0.002 SOL rent from
 * the agent wallet and sends 0.01 USDC so the account is live.
 *
 *   PAY_TO=<address> AGENT_SECRET_KEY=<...> pnpm tsx --env-file-if-exists=.env demo/init-payto.ts
 */
import {
  address,
  appendTransactionMessageInstructions,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createTransactionMessage,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  TOKEN_PROGRAM_ADDRESS,
  findAssociatedTokenPda,
  getCreateAssociatedTokenIdempotentInstructionAsync,
  getTransferCheckedInstruction,
} from "@solana-program/token";

const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const RPC = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const payTo = address(process.env.PAY_TO ?? "");
const secret = (process.env.AGENT_SECRET_KEY ?? "").trim();
const bytes = secret.startsWith("[") ? new Uint8Array(JSON.parse(secret)) : new Uint8Array(getBase58Encoder().encode(secret));
const payer = await createKeyPairSignerFromBytes(bytes);
const rpc = createSolanaRpc(RPC);

const [fromAta] = await findAssociatedTokenPda({ owner: payer.address, mint: USDC, tokenProgram: TOKEN_PROGRAM_ADDRESS });
const [toAta] = await findAssociatedTokenPda({ owner: payTo, mint: USDC, tokenProgram: TOKEN_PROGRAM_ADDRESS });
console.log("PAY_TO", payTo, "→ USDC account", toAta);

const createIx = await getCreateAssociatedTokenIdempotentInstructionAsync({ payer, owner: payTo, mint: USDC });
const transferIx = getTransferCheckedInstruction({ source: fromAta, mint: USDC, destination: toAta, authority: payer, amount: 10_000n, decimals: 6 });

const { value: blockhash } = await rpc.getLatestBlockhash().send();
const message = pipe(
  createTransactionMessage({ version: 0 }),
  (m) => setTransactionMessageFeePayerSigner(payer, m),
  (m) => setTransactionMessageLifetimeUsingBlockhash(blockhash, m),
  (m) => appendTransactionMessageInstructions([createIx, transferIx], m),
);
const signed = await signTransactionMessageWithSigners(message);
const sig = getSignatureFromTransaction(signed);
await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64" }).send();
for (let i = 0; i < 30; i++) {
  const { value } = await rpc.getSignatureStatuses([sig]).send();
  const st = value[0];
  if (st?.err) throw new Error(`failed: ${JSON.stringify(st.err)}`);
  if (st?.confirmationStatus === "confirmed" || st?.confirmationStatus === "finalized") break;
  await new Promise((r) => setTimeout(r, 1000));
}
console.log("done", `https://solscan.io/tx/${sig}`);
