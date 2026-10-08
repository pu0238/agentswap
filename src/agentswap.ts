import {
  address, createSolanaRpc, getBase64EncodedWireTransaction, getBase64Encoder,
  getSignatureFromTransaction, getTransactionDecoder, signTransaction, type KeyPairSigner,
} from "@solana/kit";
import { createPublicClient, erc20Abi, http, type LocalAccount } from "viem";
import { base, arbitrum, polygon, avalanche, sei, xLayer } from "viem/chains";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { ExactEvmSchemeV1 } from "@x402/evm/v1";
import { ExactSvmSchemeV1 } from "@x402/svm/v1";
import { parseChallenge, payableRequirements, pickRequirement, type Requirement } from "./payment.js";
import { resolveChain, type Chain } from "./chains.js";
import { createApiClient } from "./api.js";
import type { BridgeParams, BridgeQuote, Status, Quote } from "./types.js";
import { AgentSwapPaymentError, memoryIntentStore, type PaymentFetchOptions, type PaymentIntentState, type PaymentIntentStore, type PaymentReceipt } from "./intents.js";

export type { Quote };
export type { Status, BridgeQuote };
export type AgentSwapOptions = {
  api?: string; solana: KeyPairSigner; evm?: LocalAccount; from?: string;
  solanaRpc?: string; evmRpc?: Partial<Record<string, string>>; preferChain?: string;
  log?: (step: string, data?: unknown) => void;
  slippageBps?: number; intentStore?: PaymentIntentStore;
};
const EVM_CHAINS = { base, arbitrum, polygon, avalanche, sei, xlayer: xLayer };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createAgentSwap(opts: AgentSwapOptions) {
  const api = createApiClient({ api: opts.api });
  const rpcUrl = opts.solanaRpc ?? "https://api.mainnet-beta.solana.com";
  const rpc = createSolanaRpc(rpcUrl);
  const log = opts.log ?? (() => {});
  const maxSlippageBps = opts.slippageBps ?? 50;
  if (!Number.isInteger(maxSlippageBps) || maxSlippageBps < 1 || maxSlippageBps > 1000) throw new Error("slippageBps must be an integer between 1 and 1000");
  const store = opts.intentStore ?? memoryIntentStore();
  const active = new Set<string>();

  async function balance(req: Requirement, chain: Chain): Promise<bigint> {
    if (chain.kind === "evm") {
      if (!opts.evm) throw new Error("EVM signer required");
      const client = createPublicClient({ chain: EVM_CHAINS[chain.key as keyof typeof EVM_CHAINS], transport: http(opts.evmRpc?.[chain.key]) });
      return client.readContract({ address: req.asset as `0x${string}`, abi: erc20Abi, functionName: "balanceOf", args: [opts.evm.address] });
    }
    const accounts = await rpc.getTokenAccountsByOwner(opts.solana.address, { mint: address(req.asset) }, { encoding: "jsonParsed", commitment: "confirmed" }).send();
    return accounts.value.reduce((sum, a) => {
      const data = a.account.data as { parsed: { info: { tokenAmount: { amount: string } } } };
      return sum + BigInt(data.parsed.info.tokenAmount.amount);
    }, 0n);
  }
  async function execute(transaction: string, beforeSend?: (signature: string) => Promise<void>): Promise<{ signature: string; status: Status }> {
    log("Signing funding transaction on Solana");
    const tx = getTransactionDecoder().decode(getBase64Encoder().encode(transaction));
    const signed = await signTransaction([opts.solana.keyPair], tx);
    const signature = getSignatureFromTransaction(signed);
    await beforeSend?.(signature);
    await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64", skipPreflight: false }).send();
    log("Funding sent", `https://solscan.io/tx/${signature}`);
    return reconcile(signature);
  }
  async function reconcile(signature: string): Promise<{ signature: string; status: Status }> {
    const deadline = Date.now() + 5 * 60_000;
    while (Date.now() < deadline) {
      const status = await api.status(signature);
      log("Funding status", status);
      if (status.status === "FAILED") throw new Error(`Funding ${signature} failed: ${status.substatus ?? "unknown"}`);
      if (status.status === "DONE") {
        if (status.receivingTxLink) log("Received on destination", status.receivingTxLink);
        return { signature, status };
      }
      await sleep(3_000);
    }
    throw new Error(`Funding status timed out for ${signature}; outcome unknown. Reconcile this signature before submitting another transaction.`);
  }
  async function waitForBalance(req: Requirement, chain: Chain) {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      if (await balance(req, chain) >= BigInt(req.amount)) return;
      log("Waiting for destination RPC balance", chain.key);
      await sleep(2_000);
    }
    throw new Error(`Destination balance on ${chain.key} is still below ${req.amount}; check the completed funding transaction before retrying`);
  }
  async function pay(url: string, init?: RequestInit, payment: PaymentFetchOptions = {}): Promise<{ response: Response; receipt?: PaymentReceipt }> {
    if (init?.body != null && typeof init.body !== "string") throw new Error("agentswap.fetch requires a string body (or no body) so requests can be retried");
    const intentId = payment.paymentIntentId ?? crypto.randomUUID();
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(intentId)) throw new Error("Invalid paymentIntentId");
    if (active.has(intentId)) throw new Error(`Payment intent ${intentId} is already running`);
    const requestHeaders = new Headers(init?.headers);
    if (requestHeaders.has("PAYMENT-SIGNATURE") || requestHeaders.has("X-PAYMENT")) throw new Error("Pass payment intents, not pre-signed payment headers");
    const bytes = new TextEncoder().encode(JSON.stringify({ url: new URL(url).href, method: (init?.method ?? "GET").toUpperCase(),
      body: init?.body ?? null, headers: [...requestHeaders.entries()].sort(), solana: opts.solana.address, evm: opts.evm?.address }));
    const binding = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
    if (active.has(intentId)) throw new Error(`Payment intent ${intentId} is already running`);
    active.add(intentId);
    let release: (() => Promise<void>) | undefined;
    let state: PaymentIntentState | undefined;
    const save = async () => { await store.set(intentId, state!); log("Payment intent receipt", structuredClone(state!.receipt)); };
    try {
      release = await store.acquire?.(intentId);
      state = await store.get(intentId);
      if (state) {
        if (state.binding !== binding) throw new Error("Payment intent is bound to a different request or payer");
        if (["confirmed", "failed"].includes(state.receipt.outcome)) throw new Error(`Payment intent is ${state.receipt.outcome}; inspect its receipt instead of paying again`);
        state.receipt.attempts++;
        state.receipt.retry.reusesPaymentIntent = true;
        state.receipt.retry.reusesFunding = !!state.receipt.funding.signature;
        state.receipt.retry.reusesAuthorization = !!state.paymentHeaders;
        await save();
      } else {
        const res = await globalThis.fetch(url, { ...init, redirect: "error" });
        if (res.status !== 402) return { response: res };
        const challenge = res.headers.get("PAYMENT-REQUIRED") ?? await res.text();
        const reqs = parseChallenge(challenge);
        const selection = { hasEvm: !!opts.evm, preferChain: opts.preferChain };
        let selected = pickRequirement(reqs, selection);
        let hasBalance = false;
        for (const option of payableRequirements(reqs, selection)) {
          const available = await balance(option.req, option.chain);
          log("Payment balance", { chain: option.chain.key, asset: option.req.asset, available: String(available), required: option.req.amount });
          if (available >= BigInt(option.req.amount)) { selected = option; hasBalance = true; break; }
        }
        state = { binding, challenge, receipt: { intentId, url, attempts: 1, outcome: hasBalance ? "funded" : "planned",
          selection: { network: selected.req.network, chain: selected.chain.key, reason: hasBalance ? "existing_balance" : "funding_priority", requirement: selected.req },
          funding: { sourceToken: opts.from ?? "USDC", route: [], maxSlippageBps },
          retry: { reusesPaymentIntent: false, reusesFunding: false, reusesAuthorization: false, automaticChainFallback: false } } };
        await save();
      }
      const receipt = state.receipt;
      const req = receipt.selection.requirement;
      const chain = resolveChain(receipt.selection.network);
      if (receipt.outcome === "planned") {
        // Restrict the server to exactly the pinned seller option, not just a chain preference.
        const plan = await api.fund({ paymentRequired: { accepts: [req] }, from: receipt.funding.sourceToken,
          userPublicKey: opts.solana.address, evmAddress: opts.evm?.address, preferChain: chain.key,
          slippageBps: receipt.funding.maxSlippageBps, paymentIntentId: intentId });
        if (plan.action === "pay_directly") throw new Error("Insufficient Solana payment token balance; deposit funds or select a different source token with from");
        if (plan.network !== req.network || plan.asset !== req.asset || plan.payTo !== req.payTo ||
            (plan.receipt && (plan.receipt.amountAtomic !== req.amount || plan.receipt.intentId !== intentId))) throw new Error("Funding response does not match pinned seller requirement");
        if (!plan.quote?.route?.length) throw new Error("Funding response is missing its bridge route");
        if (plan.quote?.slippageBps !== undefined && plan.quote.slippageBps !== receipt.funding.maxSlippageBps) throw new Error("Funding quote changed maximum slippage");
        receipt.funding = { ...receipt.funding, route: plan.quote.route, inAmount: plan.quote.inAmount,
          minOutAmount: plan.quote.minOutAmount, feeUsd: plan.quote.feeUsd, gasUsd: plan.quote.gasUsd };
        await save();
        const result = await execute(plan.transaction, async (signature) => {
          receipt.funding.signature = signature;
          receipt.outcome = "funding_unknown";
          await save(); // Journal the signature BEFORE broadcasting; a timeout must never create another bridge.
        });
        receipt.funding.status = result.status;
        receipt.outcome = "funded";
        await save();
      } else if (receipt.outcome === "funding_unknown") {
        const result = await reconcile(receipt.funding.signature!);
        receipt.funding.status = result.status;
        receipt.outcome = "funded";
        await save();
      }
      if (receipt.funding.signature && !state.paymentHeaders) await waitForBalance(req, chain);
      if (!state.paymentHeaders) {
        const client = new x402Client();
        if (chain.kind === "evm") {
          client.register(chain.caip2, new ExactEvmScheme(opts.evm!));
          client.registerV1(chain.key, new ExactEvmSchemeV1(opts.evm!));
        } else {
          client.register(chain.caip2, new ExactSvmScheme(opts.solana, { rpcUrl }));
          client.registerV1(chain.key, new ExactSvmSchemeV1(opts.solana, { rpcUrl }));
        }
        const httpClient = new x402HTTPClient(client);
        const challenge = state.challenge.trim();
        const paymentRequired = challenge.startsWith("{") || challenge.startsWith("[")
          ? httpClient.getPaymentRequiredResponse(() => null, JSON.parse(challenge))
          : httpClient.getPaymentRequiredResponse((name) => name.toLowerCase() === "payment-required" ? challenge : null);
        paymentRequired.accepts = paymentRequired.accepts.filter((option) => {
          const candidate = parseChallenge({ accepts: [option] })[0];
          return candidate.network === req.network && candidate.scheme === req.scheme && candidate.asset === req.asset && candidate.amount === req.amount && candidate.payTo === req.payTo;
        }).slice(0, 1);
        if (!paymentRequired.accepts.length) throw new Error("Pinned payment requirement is missing from original challenge");
        state.paymentHeaders = httpClient.encodePaymentSignatureHeader(await client.createPaymentPayload(paymentRequired));
      }
      receipt.outcome = "payment_unknown";
      await save(); // Persist the SAME signed authorization before a potentially ambiguous paid request.
      const headers = new Headers(init?.headers);
      for (const [key, value] of Object.entries(state.paymentHeaders)) headers.set(key, value);
      log("Paying seller via x402", { intentId, network: chain.caip2, retry: receipt.retry });
      const response = await globalThis.fetch(url, { ...init, headers, redirect: "error" });
      const encoded = response.headers.get("PAYMENT-RESPONSE") ?? response.headers.get("X-PAYMENT-RESPONSE");
      const settlement = encoded ? decodePaymentResponseHeader(encoded) : undefined;
      receipt.seller = { httpStatus: response.status, ...(settlement ? { settlement } : {}) };
      // A seller's 200 alone is not cryptographic settlement confirmation. Keep unknown outcomes explicit.
      receipt.outcome = settlement?.success === true ? "confirmed" : settlement?.success === false || response.status === 402 ? "rejected" : "payment_unknown";
      if (settlement?.transaction) log("Payment transaction", `${chain.explorerTx}${settlement.transaction}`);
      await save();
      return { response, receipt: structuredClone(receipt) };
    } catch (error) {
      if (state) {
        if (state.receipt.funding.signature && error instanceof Error && /failed:/.test(error.message)) state.receipt.outcome = "failed";
        // Keep the original exception if journaling itself fails; never broadcast after an unsuccessful save.
        try { await save(); } catch { /* caller must reconcile the receipt/signature below */ }
        throw new AgentSwapPaymentError(error instanceof Error ? error.message : String(error), structuredClone(state.receipt), { cause: error });
      }
      throw error;
    } finally {
      active.delete(intentId);
      await release?.();
    }
  }
  return {
    async quote(p: Omit<BridgeParams, "toChain" | "userPublicKey" | "recipient" | "amountOutRaw"> & { toChain?: string }): Promise<Quote> {
      return api.quote(p);
    },
    async bridge(p: Omit<BridgeParams, "userPublicKey">): Promise<{ signature: string; status: Status }> {
      const chain = resolveChain(p.toChain);
      const recipient = p.recipient ?? (chain.kind === "svm" ? opts.solana.address : opts.evm?.address);
      if (!recipient) throw new Error("EVM recipient or signer required");
      const q = await api.bridge({ ...p, userPublicKey: opts.solana.address, recipient });
      log("Bridge quote", q);
      if (!q.transaction) throw new Error("Missing funding transaction");
      return execute(q.transaction);
    },
    fetch: async (url: string, init?: RequestInit, payment?: PaymentFetchOptions): Promise<Response> => (await pay(url, init, payment)).response,
    fetchWithReceipt: pay,
    async getReceipt(intentId: string): Promise<PaymentReceipt | undefined> {
      return (await store.get(intentId))?.receipt;
    },
  };
}
