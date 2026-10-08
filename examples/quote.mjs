import { createApiClient } from '../dist/index.js';
const [from='USDC',to='SOL',amount='1',toChain]=process.argv.slice(2);
const api=createApiClient({api:process.env.AGENTSWAP_API});
console.log(JSON.stringify(await api.quote({from,to,amount,toChain}),null,2));
