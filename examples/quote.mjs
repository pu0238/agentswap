import { createApiClient } from "../dist/index.js";

const api = createApiClient({ api: process.env.AGENTSWAP_API });
console.log(await api.quote({ from: "SOL", to: "USDC", toChain: "base", amount: "0.05" }));
