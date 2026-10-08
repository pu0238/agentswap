import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSigner, blockhash, compileTransaction, createTransactionMessage, getBase64EncodedWireTransaction, setTransactionMessageFeePayer, setTransactionMessageLifetimeUsingBlockhash } from "@solana/kit";
import { privateKeyToAccount } from "viem/accounts";
import { createAgentSwap } from "../src/agentswap.js";
import { resolveChain } from "../src/chains.js";

const evmAddress = "0x000000000000000000000000000000000000dEaD";
const req = { scheme: "exact", network: "eip155:8453", amount: "10000", asset: resolveChain("base").usdc, payTo: evmAddress };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

test("SDK returns ordinary responses and rejects non-replayable bodies", async (t) => {
  const solana = await generateKeyPairSigner();
  let calls = 0;
  t.mock.method(globalThis, "fetch", async () => { calls++; return new Response("ordinary", { status: 200 }); });
  const sdk = createAgentSwap({ solana });
  assert.equal(await (await sdk.fetch("https://seller.test")).text(), "ordinary");
  await assert.rejects(() => sdk.fetch("https://seller.test", { body: new Uint8Array([1]) }), /string body/);
  assert.equal(calls, 1);
});

test("SDK sufficient EVM balance skips funding and signs a network-specific x402 payment on repeated calls", async (t) => {
  const solana = await generateKeyPairSigner();
  // Disposable public fixture key, never funded.
  const evm = privateKeyToAccount(`0x${"01".repeat(32)}`);
  let paidCalls = 0;
  let balanceCalls = 0;
  const requirement = { ...req, maxTimeoutSeconds: 300, extra: { name: "USD Coin", version: "2" } };
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("rpc.test")) {
      balanceCalls++;
      const request = JSON.parse(init!.body as string);
      assert.equal(request.method, "eth_call");
      return json({ jsonrpc: "2.0", id: request.id, result: `0x${(20000n).toString(16).padStart(64, "0")}` });
    }
    assert.equal(url, "https://seller.test/paid", "SDK must not contact /api/fund when already funded");
    const header = (input instanceof Request ? input.headers : new Headers(init?.headers)).get("PAYMENT-SIGNATURE");
    if (header) {
      const payment = JSON.parse(atob(header));
      assert.equal(payment.accepted.network, req.network);
      assert.equal(payment.accepted.asset, req.asset);
      paidCalls++;
      return json({ paid: true });
    }
    return new Response(null, { status: 402, headers: { "PAYMENT-REQUIRED": btoa(JSON.stringify({ x402Version: 2, resource: { url, description: "test", mimeType: "application/json" }, accepts: [requirement] })) } });
  });
  const sdk = createAgentSwap({ solana, evm, evmRpc: { base: "https://rpc.test" } });
  for (let i = 0; i < 2; i++) assert.equal((await sdk.fetch("https://seller.test/paid")).status, 200);
  assert.equal(paidCalls, 2);
  assert.equal(balanceCalls, 2);
});


test("SDK empty destination balance signs funding, waits for DONE, then pays; FAILED stops payment", async (t) => {
  const solana = await generateKeyPairSigner();
  const evm = privateKeyToAccount(`0x${"01".repeat(32)}`);
  const message = setTransactionMessageLifetimeUsingBlockhash({ blockhash: blockhash("11111111111111111111111111111111"), lastValidBlockHeight: 1n }, setTransactionMessageFeePayer(solana.address, createTransactionMessage({ version: 0 })));
  const transaction = getBase64EncodedWireTransaction(compileTransaction(message));
  const steps: string[] = [];
  let complete = false;
  let failed = false;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url.includes("rpc.test")) {
      const call = JSON.parse(init!.body as string);
      if (call.method === "sendTransaction") {
        steps.push("send");
        assert.notEqual(call.params[0], transaction, "SDK should sign the transaction before sending");
        return json({ jsonrpc: "2.0", id: call.id, result: "1".repeat(88) });
      }
      assert.equal(call.method, "eth_call");
      steps.push("balance");
      return json({ jsonrpc: "2.0", id: call.id, result: `0x${(complete ? 20000n : 0n).toString(16).padStart(64, "0")}` });
    }
    if (url.endsWith("/api/fund")) {
      steps.push("fund");
      const body = JSON.parse(init!.body as string);
      assert.equal(body.from, "BONK");
      assert.equal(body.evmAddress, evm.address);
      assert.equal(body.preferChain, "base");
      return json({ action: "fund_then_pay", network: req.network, asset: req.asset, payTo: req.payTo, transaction });
    }
    if (url.includes("/api/status?tx=")) {
      steps.push("status"); complete = !failed;
      return json({ status: failed ? "FAILED" : "DONE", substatus: failed ? "REFUNDED" : "COMPLETED" });
    }
    assert.equal(url, "https://seller.test/paid");
    const headers = input instanceof Request ? input.headers : new Headers(init?.headers);
    if (headers.has("PAYMENT-SIGNATURE")) { steps.push("pay"); return json({ paid: true }); }
    return new Response(null, { status: 402, headers: { "PAYMENT-REQUIRED": btoa(JSON.stringify({ x402Version: 2, resource: { url, description: "test", mimeType: "application/json" }, accepts: [{ ...req, maxTimeoutSeconds: 300, extra: { name: "USD Coin", version: "2" } }] })) } });
  });
  const sdk = createAgentSwap({ api: "https://api.test", solana, evm, from: "BONK", solanaRpc: "https://solana.rpc.test", evmRpc: { base: "https://evm.rpc.test" } });
  assert.equal((await sdk.fetch("https://seller.test/paid")).status, 200);
  assert.deepEqual(steps, ["balance", "fund", "send", "status", "balance", "pay"]);
  complete = false; failed = true; steps.length = 0;
  await assert.rejects(() => sdk.fetch("https://seller.test/paid"), /failed: REFUNDED/);
  assert.deepEqual(steps, ["balance", "fund", "send", "status"]);
});
