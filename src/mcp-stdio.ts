#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAgentSwapMcpServer } from "./mcp.js";

const server = createAgentSwapMcpServer({ api: process.env.AGENTSWAP_API });
await server.connect(new StdioServerTransport());
