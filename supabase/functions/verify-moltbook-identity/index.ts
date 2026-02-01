import { verifyMoltbookIdentity } from "../_shared/moltbook-verify.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-moltbook-identity",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get identity token from header or body
    let identityToken = req.headers.get("X-Moltbook-Identity");
    
    // Also check request body for token (for frontend testing)
    if (!identityToken && req.method === "POST") {
      try {
        const body = await req.json();
        identityToken = body.token;
      } catch {
        // Body parsing failed, continue without
      }
    }

    if (!identityToken) {
      return new Response(
        JSON.stringify({
          success: false,
          valid: false,
          error: "missing_identity_token",
          message: "X-Moltbook-Identity header or token in body is required",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify the identity token
    const result = await verifyMoltbookIdentity(identityToken);

    if (!result.valid) {
      return new Response(JSON.stringify(result), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Success - return the verified agent profile
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        valid: false,
        error: "verification_failed",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
