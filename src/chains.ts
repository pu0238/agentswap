import type { Chain } from "./types.js";
export type { Chain } from "./types.js";

export const CHAINS: Chain[] = [
  { key: "solana", name: "Solana", caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", kind: "svm", usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", nativeSymbol: "SOL", explorerTx: "https://solscan.io/tx/" },
  { key: "base", name: "Base", caip2: "eip155:8453", kind: "evm", usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", nativeSymbol: "ETH", explorerTx: "https://basescan.org/tx/" },
  { key: "arbitrum", name: "Arbitrum", caip2: "eip155:42161", kind: "evm", usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", nativeSymbol: "ETH", explorerTx: "https://arbiscan.io/tx/" },
  { key: "polygon", name: "Polygon", caip2: "eip155:137", kind: "evm", usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", nativeSymbol: "POL", explorerTx: "https://polygonscan.com/tx/" },
  { key: "avalanche", name: "Avalanche", caip2: "eip155:43114", kind: "evm", usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", nativeSymbol: "AVAX", explorerTx: "https://snowtrace.io/tx/" },
  { key: "sei", name: "Sei", caip2: "eip155:1329", kind: "evm", usdc: "0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392", nativeSymbol: "SEI", explorerTx: "https://seiscan.io/tx/" },
  { key: "xlayer", name: "XLayer", caip2: "eip155:196", kind: "evm", usdc: "0x74b7F16337b8972027F6196A17a631aC6dE26d22", nativeSymbol: "OKB", explorerTx: "https://www.oklink.com/xlayer/tx/" },
];

export function resolveChain(input: string): Chain {
  if (input === "1151111081099710") return CHAINS[0]; // Preserve the existing numeric Solana alias.
  const chain = CHAINS.find((c) => c.key === input.toLowerCase() || c.caip2 === input || (c.kind === "evm" && c.caip2.split(":")[1] === input));
  if (!chain) throw new Error(`Unsupported chain "${input}". See GET /api/chains.`);
  return chain;
}
export function chainByCaip2(caip2: string): Chain | undefined {
  return CHAINS.find((c) => c.caip2 === caip2);
}
export function isEvmAddress(s: string): boolean { return /^0x[0-9a-fA-F]{40}$/.test(s); }
export function isSolanaAddress(s: string): boolean { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s); }
