import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuthRequest {
  action: 'validate' | 'check-quota' | 'rate-limit';
  user_id?: string;
  resource_type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, user_id, resource_type }: AuthRequest = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    switch (action) {
      case 'validate':
        return new Response(
          JSON.stringify({ 
            success: true, 
            user_id: userId,
            email: authData.user.email 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'check-quota':
        // Check user credits
        const { data: credits, error: creditsError } = await supabase
          .from('user_credits')
          .select('total_credits, used_credits')
          .eq('user_id', userId)
          .single();

        if (creditsError) {
          return new Response(
            JSON.stringify({ success: false, error: "Failed to check credits" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const availableCredits = (credits?.total_credits || 0) - (credits?.used_credits || 0);
        const hasCredits = availableCredits > 0;

        return new Response(
          JSON.stringify({ 
            success: true, 
            has_credits: hasCredits,
            available_credits: availableCredits
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'rate-limit':
        // Simple rate limiting check
        const { data: rateLimitData, error: rateLimitError } = await supabase
          .from('function_rate_limits')
          .select('call_count, window_start')
          .eq('user_id', userId)
          .eq('function_name', resource_type || 'default')
          .single();

        const now = new Date();
        const windowStart = rateLimitData?.window_start ? new Date(rateLimitData.window_start) : now;
        const timeDiff = now.getTime() - windowStart.getTime();
        const withinWindow = timeDiff < 60000; // 1 minute window
        const callCount = rateLimitData?.call_count || 0;

        const rateLimited = withinWindow && callCount >= 10; // Max 10 calls per minute

        return new Response(
          JSON.stringify({ 
            success: true, 
            rate_limited: rateLimited,
            calls_remaining: Math.max(0, 10 - callCount)
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});