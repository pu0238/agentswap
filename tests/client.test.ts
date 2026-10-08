import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createApiClient, AgentSwapApiError } from "../src/api.js";
import { createAgentSwapMcpServer } from "../src/mcp.js";
import { CHAINS, resolveChain } from "../src/chains.js";
import { parseChallenge, pickRequirement } from "../src/payment.js";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("public MCP forwards all six tools to the API without provider credentials or planning", async () => {
  const calls: { url: URL; body: unknown }[] = [];
  const api = "https://backend.test";
  const funding = { paymentRequired: "seller-challenge", from: "BONK", userPublicKey: "public-wallet", evmAddress: "0x-public-wallet", preferChain: "base" };
  const fetcher: typeof fetch = async (input, init) => {
    const url = new URL(String(input));
    assert.equal(url.origin, api, "MCP can contact only its configured backend");
    assert.equal(new Headers(init?.headers).has("x-lifi-api-key"), false);
    calls.push({ url, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return json({ endpoint: url.pathname, marker: "backend-owned-result" });
  };
  const server = createAgentSwapMcpServer({ api, fetch: fetcher });
  const client = new Client({ name: "public-client-test", version: "1" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    assert.equal(calls.length, 0, "listing MCP tools requires no backend connection");
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map(t => t.name).sort(), ["list_tokens", "list_chains", "get_quote", "fund_x402_payment", "bridge_status", "swap_info"].sort());
    const requests = [
      { name: "list_tokens", arguments: {} },
      { name: "list_chains", arguments: {} },
      { name: "get_quote", arguments: { from: "SOL", to: "USDC", amountOut: "1", toChain: "base" } },
      { name: "fund_x402_payment", arguments: funding },
      { name: "bridge_status", arguments: { tx: "sig/+?" } },
      { name: "swap_info", arguments: {} },
    ];
    for (const request of requests) {
      const result = await client.callTool(request);
      assert.equal(result.isError, undefined);
      assert.match(JSON.stringify(result.content), /backend-owned-result/);
    }
    assert.deepEqual(calls.map(c => c.url.pathname), ["/api/tokens", "/api/chains", "/api/quote", "/api/fund", "/api/status", "/api/info"]);
    assert.equal(calls[2].url.searchParams.get("amountOut"), "1");
    assert.equal(calls[2].url.searchParams.has("amount"), false);
    assert.deepEqual(calls[3].body, funding);
    assert.equal(calls[4].url.searchParams.get("tx"), "sig/+?");
  } finally {
    await client.close();
    await server.close();
  }
});

test("MCP reports backend failures and API exposes the HTTP status", async () => {
  const fetcher: typeof fetch = async () => json({ error: "upstream_error", detail: "No available route" }, 502);
  const api = createApiClient({ api: "https://backend.test", fetch: fetcher });
  await assert.rejects(api.chains(), (error: unknown) => error instanceof AgentSwapApiError && error.status === 502 && /No available route/.test(error.message));
  const server = createAgentSwapMcpServer({ api: "https://backend.test", fetch: fetcher });
  const client = new Client({ name: "error-test", version: "1" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(b);
  await client.connect(a);
  try {
    const result = await client.callTool({ name: "list_chains", arguments: {} });
    assert.equal(result.isError, true);
    assert.match(JSON.stringify(result.content), /502.*No available route/);
  } finally { await client.close(); await server.close(); }
});

test("public challenge parser works independently and excludes EVM without a signer", () => {
  assert.equal(resolveChain("8453"), resolveChain("eip155:8453"));
  assert.equal(resolveChain("1151111081099710"), resolveChain("solana"));
  const requirement = { scheme: "exact", network: "base", maxAmountRequired: "10000", asset: CHAINS[1].usdc, payTo: "0x000000000000000000000000000000000000dEaD" };
  const parsed = parseChallenge(btoa(JSON.stringify({ accepts: [requirement] })));
  assert.equal(parsed[0].network, "eip155:8453");
  assert.equal(parsed[0].amount, "10000");
  assert.throws(() => pickRequirement(parsed, { hasEvm: false }), /EVM signer/);
  assert.equal(pickRequirement(parsed, { hasEvm: true }).chain.key, "base");
  assert.equal("lifiId" in CHAINS[1], false);
});

test("API uses the edge-compatible redirect mode and rejects redirects", async () => {
  let calls = 0;
  const api = createApiClient({ api: "https://backend.test", fetch: async (_input, init) => {
    calls++;
    assert.equal(init?.redirect, "manual");
    return new Response(null, { status: 302, headers: { location: "https://other.test/private" } });
  } });
  await assert.rejects(api.info(), (error: unknown) => error instanceof AgentSwapApiError && error.status === 302);
  assert.equal(calls, 1);
});
