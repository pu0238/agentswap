import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAgentSwapMcpServer } from "./mcp.js";
import type { ApiOptions } from "./api.js";

/** Stateless public adapter. Its only backend dependency is an HTTP API URL/fetch. */
export async function handleMcp(req: Request, options: ApiOptions = {}): Promise<Response> {
  const server = createAgentSwapMcpServer(options);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  return transport.handleRequest(req);
}
