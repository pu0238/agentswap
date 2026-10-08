import { createKeyPairSignerFromBytes, getBase58Encoder } from '@solana/kit';
import { privateKeyToAccount } from 'viem/accounts';
import { createAgentSwap, parseChallenge } from '../dist/index.js';
import { fileIntentStore } from '../dist/file-intent-store.js';

const args=process.argv.slice(2);
const execute=args.includes('--execute');
const url=args.find(arg=>!arg.startsWith('--'));
if(!url || args.some(arg=>arg.startsWith('--') && arg!=='--execute')) throw new Error('Usage: pnpm example:pay <seller URL> [--execute]');
const target=new URL(url);
if(!['http:','https:'].includes(target.protocol) || target.username || target.password) throw new Error('Use an HTTP(S) seller URL without credentials');

if(!execute) {
  const res=await fetch(url,{signal:AbortSignal.timeout(20_000)});
  console.log(`HTTP ${res.status}`);
  if(res.status===402) {
    const challenge=res.headers.get('PAYMENT-REQUIRED') ?? await res.text();
    console.log(JSON.stringify(parseChallenge(challenge),null,2));
    console.log('Inspection only. To fund and pay, configure local wallet keys and add --execute. Provider/network costs apply.');
  } else console.log(await res.text());
} else {
  const secret=process.env.AGENT_SECRET_KEY?.trim();
  if(!secret) throw new Error('Set AGENT_SECRET_KEY locally (64-byte base58 secret or JSON byte array); never paste it into MCP/chat');
  const decoded=secret.startsWith('[')?JSON.parse(secret):Array.from(getBase58Encoder().encode(secret));
  if(!Array.isArray(decoded) || decoded.length!==64 || decoded.some(byte=>!Number.isInteger(byte)||byte<0||byte>255)) throw new Error('AGENT_SECRET_KEY must decode to exactly 64 bytes');
  const solana=await createKeyPairSignerFromBytes(new Uint8Array(decoded));
  const evmKey=process.env.AGENT_EVM_PRIVATE_KEY;
  if(evmKey && !/^0x[0-9a-fA-F]{64}$/.test(evmKey)) throw new Error('AGENT_EVM_PRIVATE_KEY must be 0x-prefixed, 32-byte hex');
  const agentswap=createAgentSwap({api:process.env.AGENTSWAP_API,solana,evm:evmKey?privateKeyToAccount(evmKey):undefined,from:process.env.AGENT_FROM??'USDC',preferChain:process.env.AGENT_PREFER_CHAIN,solanaRpc:process.env.SOLANA_RPC_URL,slippageBps:Number(process.env.AGENT_SLIPPAGE_BPS??50),intentStore:fileIntentStore(),log:(step,data)=>console.log(step,data??'')});
  const paymentIntentId=process.env.AGENT_PAYMENT_INTENT_ID??crypto.randomUUID();
  console.log('Payment intent:',paymentIntentId,'— reuse this ID to reconcile/retry, not a new ID.');
  const {response:res,receipt}=await agentswap.fetchWithReceipt(url,undefined,{paymentIntentId});
  console.log('Receipt:',JSON.stringify(receipt,null,2));
  console.log(`HTTP ${res.status}\n${await res.text()}`);
  if(!res.ok) process.exitCode=1;
}
