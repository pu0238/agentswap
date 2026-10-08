import type { BridgeParams, BridgeQuote, Chain, FundingParams, FundingPlan, Quote, QuoteParams, Status, Token } from "./types.js";

export const DEFAULT_API = "https://agentswap.forge-3.workers.dev";
export type ApiOptions = { api?: string; fetch?: typeof globalThis.fetch; timeoutMs?: number };

export class AgentSwapApiError extends Error {
  constructor(public readonly status: number, public readonly body: string) {
    super(`AgentSwap HTTP ${status}: ${body}`);
  }
}

/** Thin transport: all quoting, funding and provider fees are implemented by the API. */
export function createApiClient(options: ApiOptions = {}) {
  const base = new URL(options.api ?? DEFAULT_API);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error("api must be an HTTP(S) URL without credentials, query or fragment");
  const api = base.href.replace(/\/$/, "");
  const fetcher = options.fetch ?? ((...args: Parameters<typeof globalThis.fetch>) => globalThis.fetch(...args));
  async function request<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetcher(`${api}${path}`, {
      ...(body === undefined ? {} : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(options.timeoutMs ?? 30_000),
      // Cloudflare Request supports manual/follow; reject redirects through the status check below.
      redirect: "manual",
    });
    if (!response.ok) throw new AgentSwapApiError(response.status, await response.text());
    return response.json() as Promise<T>;
  }
  return {
    chains: () => request<Chain[]>("/api/chains"),
    tokens: (chain?: string) => request<Token[]>(`/api/tokens${chain ? `?chain=${encodeURIComponent(chain)}` : ""}`),
    quote: (params: QuoteParams) => {
      const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined).map(([key, value]) => [key, String(value)]));
      return request<Quote>(`/api/quote?${query}`);
    },
    bridge: (params: BridgeParams) => request<BridgeQuote>("/api/bridge", params),
    fund: (params: FundingParams) => request<FundingPlan>("/api/fund", params),
    status: (tx: string) => request<Status>(`/api/status?tx=${encodeURIComponent(tx)}`),
    info: () => request<Record<string, unknown>>("/api/info"),
  };
}
