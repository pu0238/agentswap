import type { Requirement } from "./payment.js";
import type { Status } from "./types.js";

export type PaymentReceipt = {
  intentId: string; url: string; attempts: number;
  outcome: "planned" | "funding_unknown" | "funded" | "payment_unknown" | "confirmed" | "rejected" | "failed";
  selection: { network: string; chain: string; reason: "existing_balance" | "funding_priority"; requirement: Requirement };
  funding: { sourceToken: string; route: string[]; maxSlippageBps: number; inAmount?: string; minOutAmount?: string;
    feeUsd?: string; gasUsd?: string; signature?: string; status?: Status };
  retry: { reusesPaymentIntent: boolean; reusesFunding: boolean; reusesAuthorization: boolean; automaticChainFallback: false };
  seller?: { httpStatus: number; settlement?: unknown };
};

/** Journal contains a signed payment authorization. Keep private; never log/export it as a receipt. */
export type PaymentIntentState = {
  binding: string; challenge: string; receipt: PaymentReceipt;
  paymentHeaders?: Record<string, string>;
};
export type PaymentIntentStore = {
  get(id: string): Promise<PaymentIntentState | undefined>;
  set(id: string, state: PaymentIntentState): Promise<void>;
  acquire?(id: string): Promise<() => Promise<void>>;
};
export type PaymentFetchOptions = { paymentIntentId?: string };

export class AgentSwapPaymentError extends Error {
  constructor(message: string, public readonly receipt: PaymentReceipt, options?: ErrorOptions) {
    super(message, options);
  }
}

export function memoryIntentStore(): PaymentIntentStore {
  const entries = new Map<string, PaymentIntentState>();
  const active = new Set<string>();
  return {
    acquire: async (id) => {
      if (active.has(id)) throw new Error(`Payment intent ${id} is already running`);
      active.add(id);
      return async () => { active.delete(id); };
    },
    get: async (id) => { const entry = entries.get(id); return entry && structuredClone(entry); },
    set: async (id, state) => { entries.set(id, structuredClone(state)); },
  };
}
