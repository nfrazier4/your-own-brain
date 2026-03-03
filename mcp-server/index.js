#!/usr/bin/env node

// ============================================================
// YOUR OWN BRAIN — MCP Server
// Provides tools to capture and recall personal knowledge
// ============================================================

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";

// ── Environment validation ──────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VOYAGE_API_KEY || !ANTHROPIC_API_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Helper: Generate embedding ─────────────────────────────
async function getEmbedding(text) {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: "voyage-3", input: text }),
  });
  const data = await res.json();
  return data.data?.[0]?.embedding;
}

// ── Initialize MCP Server ───────────────────────────────────
const server = new Server(
  {
    name: "your-own-brain",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ── Tool: capture ────────────────────────────────────────────
// Captures a new memory using the Supabase Edge Function
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "capture",
        description: "Capture a new memory, thought, meeting note, or insight into your personal knowledge base. The system will automatically extract people, action items, and tags.",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The memory content to capture",
            },
            context: {
              type: "string",
              description: "Context tag (e.g., 'personal', 'work', 'swell')",
              default: "personal",
            },
            type: {
              type: "string",
              description: "Memory type: thought, decision, person, meeting, or insight",
              enum: ["thought", "decision", "person", "meeting", "insight"],
              default: "thought",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "recall",
        description: "Search your memories using semantic similarity. Returns the most relevant memories based on your query.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "What you're trying to remember or search for",
            },
            limit: {
              type: "number",
              description: "Number of memories to return (default: 5)",
              default: 5,
            },
            context: {
              type: "string",
              description: "Optional: filter by context tag (e.g., 'personal', 'work', 'swell')",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "list_recent",
        description: "List your most recent memories, optionally filtered by context or type.",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of memories to return (default: 10)",
              default: 10,
            },
            context: {
              type: "string",
              description: "Optional: filter by context tag",
            },
            type: {
              type: "string",
              description: "Optional: filter by memory type",
              enum: ["thought", "decision", "person", "meeting", "insight"],
            },
          },
        },
      },
    ],
  };
});

// ── Tool Handlers ────────────────────────────────────────────
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "capture": {
        const { text, context = "personal", type = "thought" } = args;

        // Call the Supabase Edge Function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/capture`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, context, type, source: "mcp" }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Capture failed");
        }

        return {
          content: [
            {
              type: "text",
              text: `✓ Memory captured successfully!\n\n` +
                    `ID: ${result.id}\n` +
                    `Type: ${result.type}\n` +
                    `Context: ${result.context}\n` +
                    (result.people?.length ? `People: ${result.people.join(", ")}\n` : "") +
                    (result.action_items?.length ? `Action Items:\n${result.action_items.map(a => `  • ${a}`).join("\n")}\n` : "") +
                    (result.tags?.length ? `Tags: ${result.tags.join(", ")}\n` : "") +
                    `\nCaptured in ${result.elapsed_ms}ms`,
            },
          ],
        };
      }

      case "recall": {
        const { query, limit = 5, context } = args;

        // Generate embedding for the query
        const embedding = await getEmbedding(query);
        if (!embedding) {
          throw new Error("Failed to generate query embedding");
        }

        // Build query
        let dbQuery = supabase.rpc("match_memories", {
          query_embedding: embedding,
          match_threshold: 0.5,
          match_count: limit,
        });

        // Execute query
        const { data, error } = await dbQuery;

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No memories found matching: "${query}"`,
              },
            ],
          };
        }

        // Format results
        const results = data.map((m, idx) => {
          const similarity = ((1 - m.distance) * 100).toFixed(1);
          return `${idx + 1}. [${similarity}% match] ${m.raw_text}\n` +
                 `   Context: ${m.context_tag} | Type: ${m.memory_type}\n` +
                 `   Date: ${new Date(m.created_at).toLocaleDateString()}\n` +
                 (m.people?.length ? `   People: ${m.people.join(", ")}\n` : "") +
                 (m.tags?.length ? `   Tags: ${m.tags.join(", ")}\n` : "");
        }).join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Found ${data.length} relevant memories for: "${query}"\n\n${results}`,
            },
          ],
        };
      }

      case "list_recent": {
        const { limit = 10, context, type } = args;

        let query = supabase
          .from("memories")
          .select("id, raw_text, context_tag, memory_type, people, action_items, tags, created_at")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (context) {
          query = query.eq("context_tag", context);
        }
        if (type) {
          query = query.eq("memory_type", type);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (!data || data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No memories found.",
              },
            ],
          };
        }

        const results = data.map((m, idx) => {
          return `${idx + 1}. ${m.raw_text}\n` +
                 `   Context: ${m.context_tag} | Type: ${m.memory_type}\n` +
                 `   Date: ${new Date(m.created_at).toLocaleString()}\n` +
                 (m.people?.length ? `   People: ${m.people.join(", ")}\n` : "") +
                 (m.action_items?.length ? `   Actions: ${m.action_items.join(", ")}\n` : "") +
                 (m.tags?.length ? `   Tags: ${m.tags.join(", ")}\n` : "");
        }).join("\n");

        return {
          content: [
            {
              type: "text",
              text: `Recent memories${context ? ` (${context})` : ""}${type ? ` [${type}]` : ""}:\n\n${results}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// ── Start Server ─────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Your Own Brain MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
