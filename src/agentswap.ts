import {
  address, createSolanaRpc, getBase64EncodedWireTransaction, getBase64Encoder,
  getSignatureFromTransaction, getTransactionDecoder, signTransaction, type KeyPairSigner,
} from "@solana/kit";
import { createPublicClient, erc20Abi, http, type LocalAccount } from "viem";
import { base, arbitrum, polygon, avalanche, sei, xLayer } from "viem/chains";
import { x402Client } from "@x402/core/client";
import { wrapFetchWithPayment, decodePaymentResponseHeader } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { ExactEvmSchemeV1 } from "@x402/evm/v1";
import { ExactSvmSchemeV1 } from "@x402/svm/v1";
import { parseChallenge, payableRequirements, pickRequirement, type Requirement } from "./payment.js";
import { resolveChain, type Chain } from "./chains.js";
import { createApiClient } from "./api.js";
import type { BridgeParams, BridgeQuote, Status, Quote } from "./types.js";

export type { Quote };
export type { Status, BridgeQuote };
export type AgentSwapOptions = {
  api?: string; solana: KeyPairSigner; evm?: LocalAccount; from?: string;
  solanaRpc?: string; evmRpc?: Partial<Record<string, string>>; preferChain?: string;
  log?: (step: string, data?: unknown) => void;
};
const EVM_CHAINS = { base, arbitrum, polygon, avalanche, sei, xlayer: xLayer };
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function createAgentSwap(opts: AgentSwapOptions) {
  const api = createApiClient({ api: opts.api });
  const rpcUrl = opts.solanaRpc ?? "https://api.mainnet-beta.solana.com";
  const rpc = createSolanaRpc(rpcUrl);
  const log = opts.log ?? (() => {});

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
  async function execute(transaction: string): Promise<{ signature: string; status: Status }> {
    log("Signing funding transaction on Solana");
    const tx = getTransactionDecoder().decode(getBase64Encoder().encode(transaction));
    const signed = await signTransaction([opts.solana.keyPair], tx);
    const signature = getSignatureFromTransaction(signed);
    await rpc.sendTransaction(getBase64EncodedWireTransaction(signed), { encoding: "base64", skipPreflight: false }).send();
    log("Funding sent", `https://solscan.io/tx/${signature}`);
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
    async fetch(url: string, init?: RequestInit): Promise<Response> {
      if (init?.body != null && typeof init.body !== "string") throw new Error("agentswap.fetch requires a string body (or no body) so requests can be retried");
      const res = await globalThis.fetch(url, init);
      if (res.status !== 402) return res;
      log("Seller returned 402", url);
      const challenge = res.headers.get("PAYMENT-REQUIRED") ?? await res.text();
      const reqs = parseChallenge(challenge);
      const selection = { hasEvm: !!opts.evm, preferChain: opts.preferChain };
      let selected = pickRequirement(reqs, selection);
      let funded = false;
      for (const option of payableRequirements(reqs, selection)) {
        const available = await balance(option.req, option.chain);
        log("Payment balance", { chain: option.chain.key, asset: option.req.asset, available: String(available), required: option.req.amount });
        if (available >= BigInt(option.req.amount)) { selected = option; funded = true; break; }
      }
      if (!funded) {
        log("Planning funding", { from: opts.from ?? "USDC", chain: selected.chain.key });
        const plan = await api.fund({
          paymentRequired: challenge, from: opts.from ?? "USDC", userPublicKey: opts.solana.address,
          evmAddress: opts.evm?.address, preferChain: selected.chain.key,
        });
        if (plan.action === "pay_directly") throw new Error("Insufficient Solana payment token balance; deposit funds or select a different source token with from");
        const chain = resolveChain(plan.network);
        const req = reqs.find((r) => r.network === plan.network && r.asset === plan.asset && r.payTo === plan.payTo);
        if (!req) throw new Error("Funding response does not match seller challenge");
        selected = { chain, req };
        log("Funding quote", plan.quote);
        await execute(plan.transaction);
        await waitForBalance(req, chain);
      }
      log("Paying seller via x402", selected.chain.caip2);
      const client = new x402Client();
      if (selected.chain.kind === "evm") {
        client.register(selected.chain.caip2, new ExactEvmScheme(opts.evm!));
        client.registerV1(selected.chain.key, new ExactEvmSchemeV1(opts.evm!));
      } else {
        client.register(selected.chain.caip2, new ExactSvmScheme(opts.solana, { rpcUrl }));
        client.registerV1(selected.chain.key, new ExactSvmSchemeV1(opts.solana, { rpcUrl }));
      }
      const paid = await wrapFetchWithPayment(globalThis.fetch, client)(url, init);
      const receipt = paid.headers.get("PAYMENT-RESPONSE") ?? paid.headers.get("X-PAYMENT-RESPONSE");
      if (receipt) {
        const payment = decodePaymentResponseHeader(receipt);
        log("x402 payment receipt", payment);
        if (payment.transaction) log("Payment transaction", `${selected.chain.explorerTx}${payment.transaction}`);
      }
      log("Seller response", paid.status);
      return paid;
    },
  };
}
