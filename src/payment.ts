import { CHAINS, chainByCaip2, resolveChain } from "./chains.js";

export type Requirement = { scheme: string; network: string; amount: string; asset: string; payTo: string; extra?: unknown };
const V1_NETWORKS: Record<string, string> = Object.fromEntries(CHAINS.map((c) => [c.key, c.caip2]));

export function parseChallenge(input: string | object): Requirement[] {
  let parsed: unknown = input;
  if (typeof input === "string") {
    try { parsed = JSON.parse(input); } catch {
      try { parsed = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(input), (c) => c.charCodeAt(0)))); }
      catch { throw new Error("Invalid paymentRequired: expected JSON or a base64 PAYMENT-REQUIRED header"); }
    }
  }
  const accepts = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? (parsed as { accepts?: unknown }).accepts : undefined;
  if (!Array.isArray(accepts) || !accepts.length) throw new Error("paymentRequired must contain a non-empty accepts array");
  return accepts.map((r: unknown) => {
    if (!r || typeof r !== "object") throw new Error("Invalid payment requirement");
    const p = r as Record<string, unknown>;
    const amount = p.amount ?? p.maxAmountRequired;
    if ([p.scheme, p.network, p.asset, p.payTo, amount].some((v) => typeof v !== "string" || !v.length) || !/^\d+$/.test(amount as string) || BigInt(amount as string) <= 0n) throw new Error("Invalid payment requirement: scheme, network, asset, payTo and positive atomic amount are required");
    return { scheme: p.scheme as string, network: V1_NETWORKS[p.network as string] ?? p.network as string, amount: amount as string, asset: p.asset as string, payTo: p.payTo as string, extra: p.extra };
  });
}
export const PRIORITY = ["solana", "base", "arbitrum", "polygon", "avalanche", "sei", "xlayer"];
export type PickOptions = { hasEvm: boolean; preferChain?: string };
export function payableRequirements(reqs: Requirement[], opts: PickOptions) {
  const preferred = opts.preferChain ? resolveChain(opts.preferChain).key : undefined;
  const order = preferred ? [preferred, ...PRIORITY.filter((c) => c !== preferred)] : PRIORITY;
  return reqs.flatMap((req) => {
    const chain = chainByCaip2(req.network);
    return req.scheme === "exact" && chain && (chain.kind === "svm" || opts.hasEvm) ? [{ req, chain }] : [];
  }).sort((a, b) => order.indexOf(a.chain.key) - order.indexOf(b.chain.key));
}
export function pickRequirement(reqs: Requirement[], opts: PickOptions) {
  const picked = payableRequirements(reqs, opts)[0];
  if (!picked) throw new Error(`No payable option: seller accepts [${reqs.map((r) => `${r.scheme} ${r.network}`).join(", ")}]; AgentSwap supports [${CHAINS.map((c) => c.caip2).join(", ")}]. ${opts.hasEvm ? "" : "Provide an EVM signer/address for EVM payments."}`);
  return picked;
}
