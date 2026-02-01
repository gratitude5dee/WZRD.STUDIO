import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireMoltbookAgent } from "../_shared/moltbook.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-moltbook-identity",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const verification = await requireMoltbookAgent(req);

  if (!verification.ok) {
    return new Response(
      JSON.stringify({
        valid: false,
        error: verification.error,
      }),
      {
        status: verification.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Attach for downstream handlers (if you expand this function later)
  (req as Request & { moltbookAgent?: unknown }).moltbookAgent = verification.agent;

  return new Response(
    JSON.stringify({
      valid: true,
      agent: verification.agent,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
