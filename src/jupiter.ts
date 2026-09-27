import { fromBaseUnits, resolveToken, toBaseUnits } from "./tokens";

export type JupEnv = { JUP_API_BASE: string; JUP_API_KEY?: string };

export type SwapParams = {
  from: string;
  to: string;
  amount: string;
  slippageBps?: number;
};

export class UpstreamError extends Error {}

async function jup<T>(env: JupEnv, path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (env.JUP_API_KEY) headers["x-api-key"] = env.JUP_API_KEY;
  const res = await fetch(`${env.JUP_API_BASE}${path}`, { ...init, headers });
  const body = await res.text();
  if (!res.ok) throw new UpstreamError(`Jupiter ${res.status}: ${body.slice(0, 300)}`);
  return JSON.parse(body) as T;
}

export async function getQuote(env: JupEnv, p: SwapParams) {
  const input = resolveToken(p.from);
  const output = resolveToken(p.to);
  if (input.mint === output.mint) throw new Error("from and to must differ");
  const slippageBps = p.slippageBps ?? 50;
  if (!Number.isInteger(slippageBps) || slippageBps < 1 || slippageBps > 1000) {
    throw new Error("slippageBps must be an integer between 1 and 1000");
  }

  const qs = new URLSearchParams({
    inputMint: input.mint,
    outputMint: output.mint,
    amount: toBaseUnits(p.amount, input.decimals),
    slippageBps: String(slippageBps),
  });
  const quoteResponse = await jup<any>(env, `/quote?${qs}`);

  return {
    from: input.symbol,
    to: output.symbol,
    inAmount: fromBaseUnits(quoteResponse.inAmount, input.decimals),
    outAmount: fromBaseUnits(quoteResponse.outAmount, output.decimals),
    minOutAmount: fromBaseUnits(quoteResponse.otherAmountThreshold, output.decimals),
    priceImpactPct: quoteResponse.priceImpactPct,
    route: (quoteResponse.routePlan ?? []).map((r: any) => r.swapInfo?.label).filter(Boolean),
    quoteResponse,
  };
}

/** Build an unsigned swap transaction for `userPublicKey`. The agent signs and sends it. */
export async function buildSwap(env: JupEnv, p: SwapParams & { userPublicKey: string }) {
  const quote = await getQuote(env, p);
  const swap = await jup<{ swapTransaction: string; lastValidBlockHeight: number }>(env, "/swap", {
    method: "POST",
    body: JSON.stringify({
      quoteResponse: quote.quoteResponse,
      userPublicKey: p.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  const { quoteResponse: _, ...summary } = quote;
  return {
    swapTransaction: swap.swapTransaction,
    lastValidBlockHeight: swap.lastValidBlockHeight,
    quote: summary,
  };
}
