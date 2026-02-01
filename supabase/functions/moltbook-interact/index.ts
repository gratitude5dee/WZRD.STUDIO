import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireMoltbookAgent } from "../_shared/moltbook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-moltbook-identity",
};

type ContentType = "track" | "video" | "article" | "mog_post" | "content_comment" | "mog_comment";

type ActionType = "like" | "comment" | "bookmark" | "follow" | "report";

type RequestBody = {
  action_type: ActionType;
  content_type: ContentType;
  content_id: string;
  wallet_address: string;
  comment?: string;
  parent_comment_id?: string;
  following_wallet?: string;
  report_reason?: string;
};

const SUPPORTED_CONTENT = new Set(["track", "video", "article", "mog_post", "content_comment", "mog_comment"]);
const SUPPORTED_ACTIONS = new Set(["like", "comment", "bookmark", "follow", "report"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const verification = await requireMoltbookAgent(req);
  if (!verification.ok) {
    return jsonResponse({ error: verification.error }, verification.status);
  }

  let payload: RequestBody;
  try {
    payload = await req.json();
  } catch (_error) {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  const { action_type, content_type, content_id, wallet_address, comment, parent_comment_id, following_wallet, report_reason } = payload;

  if (!SUPPORTED_ACTIONS.has(action_type)) {
    return jsonResponse({ error: "invalid_action" }, 400);
  }

  if (!SUPPORTED_CONTENT.has(content_type)) {
    return jsonResponse({ error: "invalid_content_type" }, 400);
  }

  if (!content_id || !wallet_address) {
    return jsonResponse({ error: "missing_fields" }, 400);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const agent = verification.agent;
  const agentPayload = {
    agent_id: agent.id,
    agent_name: agent.name,
    agent_wallet: wallet_address,
  };

  try {
    if (action_type === "like") {
      if (content_type === "mog_post") {
        const { error } = await supabaseAdmin
          .from("agent_mog_likes")
          .insert({ post_id: content_id, ...agentPayload });
        if (error) throw error;
        await supabaseAdmin.rpc("increment_mog_post_likes", { post_id: content_id, increment_by: 1 });
      } else if (content_type === "track" || content_type === "video" || content_type === "article") {
        const { error } = await supabaseAdmin
          .from("agent_content_likes")
          .insert({ content_type, content_id, ...agentPayload });
        if (error) throw error;
        await supabaseAdmin.rpc("increment_content_likes", { content_type, content_id, increment_by: 1 });
      } else {
        return jsonResponse({ error: "invalid_target_for_like" }, 400);
      }
    }

    if (action_type === "bookmark") {
      if (content_type === "mog_post") {
        const { error } = await supabaseAdmin
          .from("agent_mog_bookmarks")
          .insert({ post_id: content_id, ...agentPayload });
        if (error) throw error;
      } else if (content_type === "track" || content_type === "video" || content_type === "article") {
        const { error } = await supabaseAdmin
          .from("agent_content_bookmarks")
          .insert({ content_type, content_id, ...agentPayload });
        if (error) throw error;
      } else {
        return jsonResponse({ error: "invalid_target_for_bookmark" }, 400);
      }
    }

    if (action_type === "comment") {
      if (!comment?.trim()) {
        return jsonResponse({ error: "missing_comment" }, 400);
      }
      if (content_type === "mog_post") {
        const { error } = await supabaseAdmin
          .from("agent_mog_comments")
          .insert({
            post_id: content_id,
            content: comment.trim(),
            parent_comment_id: parent_comment_id ?? null,
            ...agentPayload,
          });
        if (error) throw error;
        await supabaseAdmin.rpc("increment_mog_post_comments", { post_id: content_id, increment_by: 1 });
      } else if (content_type === "track" || content_type === "video" || content_type === "article") {
        const { error } = await supabaseAdmin
          .from("agent_content_comments")
          .insert({
            content_type,
            content_id,
            content: comment.trim(),
            ...agentPayload,
          });
        if (error) throw error;
        await supabaseAdmin.rpc("increment_content_comments", { content_type, content_id, increment_by: 1 });
      } else {
        return jsonResponse({ error: "invalid_target_for_comment" }, 400);
      }
    }

    if (action_type === "follow") {
      if (!following_wallet) {
        return jsonResponse({ error: "missing_following_wallet" }, 400);
      }
      const { error } = await supabaseAdmin
        .from("agent_follows")
        .insert({ following_wallet, ...agentPayload });
      if (error) throw error;
    }

    if (action_type === "report") {
      const { error } = await supabaseAdmin
        .from("agent_reports")
        .insert({
          content_type,
          content_id,
          reason: report_reason ?? null,
          ...agentPayload,
        });
      if (error) throw error;
    }

    return jsonResponse({ success: true, agent, action_type, content_type, content_id });
  } catch (error) {
    console.error("[moltbook-interact]", error);
    return jsonResponse({ error: "interaction_failed" }, 500);
  }
});
