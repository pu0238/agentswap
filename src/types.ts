/** Public HTTP contracts only. Provider implementation and environment stay on the server. */
export type Token = { symbol: string; mint: string; decimals: number };
export type Chain = {
  key: string; name: string; caip2: `${string}:${string}`; kind: "svm" | "evm";
  usdc: string; nativeSymbol: string; explorerTx: string;
};
export type BridgeParams = {
  from: string; toChain: string; to: string; amount?: string; amountOut?: string;
  amountOutRaw?: string; userPublicKey?: string; recipient?: string; slippageBps?: number;
};
export type QuoteParams = Omit<BridgeParams, "toChain" | "userPublicKey" | "recipient" | "amountOutRaw"> & { toChain?: string };
export type SwapQuote = {
  from: string; to: string; inAmount: string; outAmount: string; minOutAmount: string;
  priceImpactPct: string; route: string[];
};
export type BridgeQuote = {
  kind: "bridge" | "swap"; fromChain: string; toChain: string; from: string; to: string;
  inAmount: string; outAmount: string; minOutAmount: string; sourceTokenPriceUsd?: string;
  sourceGasCosts?: { amountUSD?: string; amount?: string; token?: { chainId: number; priceUSD?: string } }[];
  feeUsd: string; gasUsd: string; etaSeconds: number; route: string[]; transaction?: string;
};
export type Quote = SwapQuote | BridgeQuote;
export type Status = {
  status: "NOT_FOUND" | "PENDING" | "DONE" | "FAILED"; substatus?: string;
  receivingTxHash?: string; receivingTxLink?: string; receivedAmount?: string; toChain?: string;
};
export type FundingParams = {
  paymentRequired: string | object; from: string; userPublicKey: string;
  evmAddress?: string; preferChain?: string; slippageBps?: number;
};
export type FundingPlan =
  | { action: "pay_directly"; network: string; asset: string; amount: string }
  | { action: "fund_then_pay"; network: string; chain: string; asset: string; required: string;
      payTo: string; quote: BridgeQuote; transaction: string; next: string };
