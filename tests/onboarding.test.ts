import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { setupConfig, CLIENTS } from '../src/setup.js';
import { doctor } from '../src/doctor.js';
import { handleMcp } from '../src/mcp-http.js';
import { createAgentSwapMcpServer } from '../src/mcp.js';

const api='https://backend.test';
const scriptPath='/absolute/path with spaces/dist/mcp-stdio.js';
test('all client configurations use their own schema and keep local paths out of hosted configs',()=>{
  for(const client of CLIENTS) {
    const result=setupConfig({client,api,scriptPath});
    assert.ok(result.location);
    if(client==='claude-code') assert.match(result.text,/--transport http.*--scope user/);
    else if(client==='codex') assert.match(result.text,/\[mcp_servers.agentswap\]\nurl = "https:\/\/backend.test\/mcp"/);
    else {
      const config=JSON.parse(result.text);
      const server=client==='vscode'?config.servers.agentswap:config.mcpServers.agentswap;
      if(client==='claude-desktop') assert.deepEqual(server.args,[scriptPath]);
      else assert.equal(server.url,`${api}/mcp`);
      if(client==='cline') assert.equal(server.type,'streamableHttp');
      if(client==='vscode') assert.equal(server.type,'http');
    }
    const local=setupConfig({client,api,scriptPath,transport:'stdio'});
    assert.ok(local.text.includes(scriptPath));
    assert.ok(local.text.includes('AGENTSWAP_API'));
    assert.equal(/PRIVATE_KEY|SECRET_KEY/.test(local.text),false);
  }
  assert.throws(()=>setupConfig({client:'unknown'}),/Unknown client/);
  assert.throws(()=>setupConfig({client:'cursor',api:'file:///private'}),/HTTP/);
  assert.throws(()=>setupConfig({client:'cursor',transport:'stdio',scriptPath:'relative.js'}),/absolute path/);
  assert.throws(()=>setupConfig({client:'claude-desktop',transport:'http'}),/Use stdio/);
});

test('compiled setup CLI prints valid mergeable config and rejects bad arguments',()=>{
  const script=fileURLToPath(new URL('../dist/cli.js',import.meta.url));
  const output=execFileSync(process.execPath,[script,'setup','cursor','--transport','stdio','--path',scriptPath],{encoding:'utf8',stdio:['ignore','pipe','pipe']});
  assert.deepEqual(JSON.parse(output).mcpServers.agentswap.args,[scriptPath]);
  assert.throws(()=>execFileSync(process.execPath,[script,'setup','cursor','--transport','invalid'],{stdio:'pipe'}));
});

test('MCP describes planning-only tools and supplies a first-run resource/prompt without network',async()=>{
  const server=createAgentSwapMcpServer({api,fetch:async()=>{throw new Error('No network for onboarding');}});
  const client=new Client({name:'onboarding-test',version:'1'});
  const [a,b]=InMemoryTransport.createLinkedPair();
  await server.connect(b); await client.connect(a);
  try {
    const tools=(await client.listTools()).tools;
    assert.equal(tools.length,6);
    for(const tool of tools) {assert.equal(tool.annotations?.readOnlyHint,true);assert.equal(tool.annotations?.destructiveHint,false);}
    assert.ok(tools.find(tool=>tool.name==='list_tokens')?.inputSchema.properties?.chain);
    const resource=await client.readResource({uri:'agentswap://getting-started'});
    const text=resource.contents[0];
    assert.ok('text' in text);
    const guide=JSON.parse(text.text as string);
    assert.equal(guide.mcp,`${api}/mcp`);
    assert.match(guide.wallet,/Never put private keys/);
    const prompt=await client.getPrompt({name:'first_quote'});
    assert.match(JSON.stringify(prompt),/Do not request a wallet key/);
  } finally {await client.close();await server.close();}
});

test('doctor checks the actual MCP HTTP protocol without quotes, wallets or payments',async(t)=>{
  const paths:string[]=[];
  let omitTool=false;
  t.mock.method(globalThis,'fetch',async(input:RequestInfo|URL,init?:RequestInit)=>{
    const req=new Request(input,init);
    const path=new URL(req.url).pathname;
    paths.push(path);
    if(path==='/api/chains') return Response.json([{key:'solana'}]);
    if(path==='/api/info') return Response.json({endpoint:`${api}/api/swap`,fund:{endpoint:`${api}/api/fund`}});
    assert.equal(path,'/mcp','Doctor must not request a quote or payment endpoint');
    const body=init?.body?JSON.parse(String(init.body)):undefined;
    const response=await handleMcp(req,{api});
    if(omitTool && body?.method==='tools/list') {
      const payload=await response.json() as {result:{tools:{name:string}[]}};
      payload.result.tools=payload.result.tools.filter(tool=>tool.name!=='fund_x402_payment');
      return Response.json(payload,{headers:response.headers});
    }
    return response;
  });
  const ok=await doctor({api,timeoutMs:1000});
  assert.equal(ok.ok,true,JSON.stringify(ok));
  assert.equal(ok.signingOrPayments,false);
  assert.ok(paths.includes('/mcp'));
  omitTool=true;
  const broken=await doctor({api,timeoutMs:1000});
  assert.equal(broken.ok,false);
  assert.match(broken.checks.find(check=>check.name==='mcp')!.detail,/Missing MCP tools: fund_x402_payment/);
});
