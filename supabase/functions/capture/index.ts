// ============================================================
// YOUR OWN BRAIN — Capture Edge Function
// Uses: Voyage AI (embeddings) + Claude claude-haiku-4-5-20251001 (metadata)
//
// Supabase secrets needed:
//   supabase secrets set VOYAGE_API_KEY=pa-...
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
//
// Deploy:
//   supabase functions deploy capture
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { text, context = "personal", type = "thought", source = "dashboard" } = await req.json();

    if (!text?.trim()) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const VOYAGE_KEY    = Deno.env.get("VOYAGE_API_KEY")!;
    const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
    const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // ── Run embedding + metadata extraction in parallel ──────
    const [embeddingRes, metaRes] = await Promise.all([

      // 1. Voyage AI embedding (voyage-3, 1024 dims)
      fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VOYAGE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model: "voyage-3", input: text }),
      }),

      // 2. Claude Haiku metadata extraction
      fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_KEY,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 300,
          system: `You extract structured metadata from personal notes. Return ONLY valid JSON, no other text.

Fields:
- people: string[] — proper names mentioned (e.g. ["Dan", "Sarah (PSU)"])
- action_items: string[] — concrete next actions, start with a verb (e.g. ["Follow up with Dan by Friday"])
- tags: string[] — 1-4 word topic slugs, lowercase-hyphenated (e.g. ["spring-cohort", "client-work"])
- memory_type: one of [thought, decision, person, meeting, insight]

Return example:
{"people":["Dan"],"action_items":["Check in with Dan Friday"],"tags":["silver-line","client-work"],"memory_type":"person"}`,
          messages: [{ role: "user", content: text }],
        }),
      }),
    ]);

    // ── Parse embedding ──────────────────────────────────────
    const embeddingData = await embeddingRes.json();
    const embedding = embeddingData.data?.[0]?.embedding;
    if (!embedding) throw new Error(`Voyage embedding failed: ${JSON.stringify(embeddingData)}`);

    // ── Parse metadata ───────────────────────────────────────
    let metadata = { people: [], action_items: [], tags: [], memory_type: type };
    try {
      const metaData = await metaRes.json();
      console.log("Claude raw response:", JSON.stringify(metaData));
      let raw = metaData.content?.[0]?.text ?? "{}";
      // Strip markdown code fences if Claude wrapped the JSON
      raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
      metadata = { ...metadata, ...JSON.parse(raw) };
    } catch (e) {
      console.error("Metadata parse failed:", e.message);
    }

    // ── Store in Supabase ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const { data, error } = await supabase
      .from("memories")
      .insert({
        raw_text:     text,
        embedding,
        context_tag:  context,
        memory_type:  metadata.memory_type || type,
        people:       metadata.people       || [],
        action_items: metadata.action_items || [],
        tags:         metadata.tags         || [],
        source,
      })
      .select("id, context_tag, memory_type, people, action_items, tags, created_at")
      .single();

    if (error) throw error;

    const elapsed = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      id: data.id,
      context: data.context_tag,
      type: data.memory_type,
      people: data.people,
      action_items: data.action_items,
      tags: data.tags,
      elapsed_ms: elapsed,
      message: `Captured in ${elapsed}ms`,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Capture error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});