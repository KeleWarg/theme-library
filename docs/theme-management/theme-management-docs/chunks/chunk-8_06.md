# Chunk 8.06 — MCP Server

## Purpose
Standalone MCP server for design system queries.

---

## Inputs
- `DesignToken` type (from chunk 8.01)

## Outputs
- `mcp-server/` package (consumed by 8.08)

---

## Dependencies
- Chunk 8.01 must be complete

---

## Files Created
- `mcp-server/package.json`
- `mcp-server/tsconfig.json`
- `mcp-server/src/server.ts`
- `mcp-server/src/index.ts`

---

## Implementation

### `mcp-server/package.json`

```json
{
  "name": "@yourorg/design-system-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "bin": { "design-system-mcp": "dist/index.js" },
  "scripts": { "build": "tsc", "start": "node dist/index.js" },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

### `mcp-server/src/server.ts`

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";

export const server = new McpServer({ name: "design-system-mcp", version: "1.0.0" });

function loadData() {
  const path = process.env.DESIGN_SYSTEM_DATA || "./design-system.json";
  if (fs.existsSync(path)) return JSON.parse(fs.readFileSync(path, "utf-8"));
  return { tokens: [], components: [], themes: [] };
}

let data = loadData();

server.tool("design_system_get_token", "Get token by path", { path: z.string() }, async ({ path }) => {
  const token = data.tokens.find((t: any) => t.path === path || t.cssVar === path);
  return { content: [{ type: "text", text: token ? JSON.stringify(token, null, 2) : "Not found" }] };
});

server.tool("design_system_list_tokens", "List tokens", { category: z.string().optional() }, async ({ category }) => {
  let tokens = data.tokens;
  if (category) tokens = tokens.filter((t: any) => t.category === category);
  return { content: [{ type: "text", text: tokens.slice(0, 50).map((t: any) => `- \`${t.cssVar}\`: ${t.value}`).join("\n") }] };
});

server.tool("design_system_search", "Search tokens", { query: z.string() }, async ({ query }) => {
  const q = query.toLowerCase();
  const matches = data.tokens.filter((t: any) => t.path.includes(q) || t.cssVar.includes(q)).slice(0, 20);
  return { content: [{ type: "text", text: matches.map((t: any) => `- \`${t.cssVar}\``).join("\n") || "No matches" }] };
});
```

### `mcp-server/src/index.ts`

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Design System MCP Server running");
}

main().catch(console.error);
```

---

## Tests

### Unit Tests
- [ ] Server initializes without error
- [ ] Tools respond to queries

### Verification
- [ ] `cd mcp-server && npm install && npm run build`
- [ ] Test with MCP client

---

## Time Estimate
2 hours
