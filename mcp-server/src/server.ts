import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";

export const server = new McpServer({ name: "design-system-mcp", version: "1.0.0" });

interface TokenData {
  path?: string;
  cssVar?: string;
  category?: string;
  value?: string;
}

interface DesignSystemData {
  tokens: TokenData[];
  components: unknown[];
  themes: unknown[];
}

function loadData(): DesignSystemData {
  const path = process.env.DESIGN_SYSTEM_DATA || "./design-system.json";
  if (fs.existsSync(path)) {
    return JSON.parse(fs.readFileSync(path, "utf-8")) as DesignSystemData;
  }
  return { tokens: [], components: [], themes: [] };
}

const data = loadData();

server.tool(
  "design_system_get_token",
  "Get token by path",
  { path: z.string() },
  async ({ path }) => {
    const token = data.tokens.find((t) => t.path === path || t.cssVar === path);
    return {
      content: [
        {
          type: "text",
          text: token ? JSON.stringify(token, null, 2) : "Not found",
        },
      ],
    };
  }
);

server.tool(
  "design_system_list_tokens",
  "List tokens",
  { category: z.string().optional() },
  async ({ category }) => {
    let tokens = data.tokens;
    if (category) {
      tokens = tokens.filter((t) => t.category === category);
    }
    return {
      content: [
        {
          type: "text",
          text: tokens
            .slice(0, 50)
            .map((t) => `- \`${t.cssVar}\`: ${t.value}`)
            .join("\n"),
        },
      ],
    };
  }
);

server.tool(
  "design_system_search",
  "Search tokens",
  { query: z.string() },
  async ({ query }) => {
    const q = query.toLowerCase();
    const matches = data.tokens
      .filter((t) => t.path?.includes(q) || t.cssVar?.includes(q))
      .slice(0, 20);
    return {
      content: [
        {
          type: "text",
          text:
            matches.map((t) => `- \`${t.cssVar}\``).join("\n") || "No matches",
        },
      ],
    };
  }
);

