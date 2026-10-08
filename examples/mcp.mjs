import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
const api=(process.env.AGENTSWAP_API??'https://agentswap.forge-3.workers.dev').replace(/\/$/,'');
const client=new Client({name:'agentswap-example',version:'1.0.0'});
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(`${api}/mcp`)));
  console.log('Tools:',(await client.listTools()).tools.map(tool=>tool.name));
  console.log(await client.readResource({uri:'agentswap://getting-started'}));
} finally {await client.close();}
