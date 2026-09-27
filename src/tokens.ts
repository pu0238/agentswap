export type Token = { symbol: string; mint: string; decimals: number };

export const TOKENS: Token[] = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "USDT", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6 },
  { symbol: "JUP", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  { symbol: "WIF", mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", decimals: 6 },
  { symbol: "PYUSD", mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo", decimals: 6 },
];

const BY_SYMBOL = new Map(TOKENS.map((t) => [t.symbol, t]));
const BY_MINT = new Map(TOKENS.map((t) => [t.mint, t]));

/** Resolve a symbol ("usdc") or a known mint address to a token. */
export function resolveToken(input: string): Token {
  const t = BY_SYMBOL.get(input.toUpperCase()) ?? BY_MINT.get(input);
  if (t) return t;
  throw new Error(`Unsupported token "${input}". See GET /api/tokens.`);
}

/** Convert a human amount ("1.5") into base units as a string, without float rounding. */
export function toBaseUnits(amount: string, decimals: number): string {
  if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error(`Invalid amount "${amount}"`);
  const [whole, frac = ""] = amount.split(".");
  if (frac.length > decimals) throw new Error(`Too many decimals (max ${decimals})`);
  const raw = BigInt(whole + frac.padEnd(decimals, "0"));
  if (raw <= 0n) throw new Error("Amount must be > 0");
  return raw.toString();
}

export function fromBaseUnits(raw: string, decimals: number): string {
  const s = raw.padStart(decimals + 1, "0");
  const whole = s.slice(0, s.length - decimals);
  const frac = s.slice(s.length - decimals).replace(/0+$/, "");
  return frac ? `${whole}.${frac}` : whole;
}
