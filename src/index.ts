import { Hono, type MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/hono";
import { ExactSvmScheme } from "@x402/svm/exact/server";
import { buildSwap, getQuote, UpstreamError } from "./jupiter";
import { handleMcp } from "./mcp";
import { TOKENS } from "./tokens";

type Env = {
  PAY_TO: string;
  X402_NETWORK: `${string}:${string}`;
  FACILITATOR_URL: string;
  SWAP_PRICE: string;
  JUP_API_BASE: string;
  JUP_API_KEY?: string;
  FREE_LIMITER: RateLimit;
  SWAP_LIMITER: RateLimit;
};

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", cors({ origin: "*", exposeHeaders: ["PAYMENT-REQUIRED", "PAYMENT-RESPONSE"] }));

// Per-IP rate limits (quotes are free, so they're the abuse surface; swap builds hit Jupiter twice).
const limited = (pick: (e: Env) => RateLimit): MiddlewareHandler<{ Bindings: Env }> => async (c, next) => {
  const ip = c.req.header("cf-connecting-ip") ?? "unknown";
  const { success } = await pick(c.env).limit({ key: ip });
  if (!success) return c.json({ error: "rate_limited", detail: "Too many requests, retry in a minute." }, 429, { "Retry-After": "60" });
  await next();
};
app.use("/api/quote", limited((e) => e.FREE_LIMITER));
app.use("/api/tokens", limited((e) => e.FREE_LIMITER));
app.use("/mcp", limited((e) => e.FREE_LIMITER));
app.use("/api/swap", limited((e) => e.SWAP_LIMITER));

app.onError((err, c) => {
  const status = err instanceof UpstreamError ? 502 : 400;
  return c.json({ error: status === 502 ? "upstream_error" : "bad_request", detail: err.message }, status);
});

app.get("/api/tokens", (c) => c.json(TOKENS));

app.get("/api/quote", async (c) => {
  const q = c.req.query();
  const { quoteResponse: _, ...quote } = await getQuote(c.env, {
    from: q.from ?? "",
    to: q.to ?? "",
    amount: q.amount ?? "",
    slippageBps: q.slippageBps ? Number(q.slippageBps) : undefined,
  });
  return c.json(quote);
});

// x402 paywall for /api/swap. Built lazily because Worker env is only available per request.
let paywall: MiddlewareHandler | undefined;
app.use("/api/swap", (c, next) => {
  paywall ??= paymentMiddleware(
    {
      "POST /api/swap": {
        accepts: {
          scheme: "exact",
          price: c.env.SWAP_PRICE,
          network: c.env.X402_NETWORK,
          payTo: c.env.PAY_TO,
        },
        description: "AgentSwap: build an unsigned Solana swap transaction (Jupiter-routed)",
        mimeType: "application/json",
      },
    },
    new x402ResourceServer(new HTTPFacilitatorClient({ url: c.env.FACILITATOR_URL })).register(
      c.env.X402_NETWORK,
      new ExactSvmScheme(),
    ),
  );
  return paywall(c, next);
});

app.post("/api/swap", async (c) => {
  const body = await c.req.json<Record<string, unknown>>().catch(() => ({}) as Record<string, unknown>);
  if (typeof body.userPublicKey !== "string") throw new Error("userPublicKey is required");
  const result = await buildSwap(c.env, {
    from: String(body.from ?? ""),
    to: String(body.to ?? ""),
    amount: String(body.amount ?? ""),
    slippageBps: body.slippageBps === undefined ? undefined : Number(body.slippageBps),
    userPublicKey: body.userPublicKey,
  });
  return c.json(result);
});

app.all("/mcp", (c) => handleMcp(c.req.raw, c.env));

export default app;
