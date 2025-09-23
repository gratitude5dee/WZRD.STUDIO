import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequest {
  action: 'create' | 'update' | 'get' | 'cancel';
  job_id?: string;
  job_type?: string;
  payload?: any;
  status?: string;
  priority?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, job_id, job_type, payload, status, priority = 0 }: JobRequest = await req.json();

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.split("Bearer ")[1];
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    switch (action) {
      case 'create':
        if (!job_type || !payload) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing job_type or payload" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: newJob, error: createError } = await supabase
          .from('job_queue')
          .insert({
            user_id: userId,
            task_type: job_type,
            payload: payload,
            priority: priority,
            status: 'pending'
          })
          .select()
          .single();

        if (createError) {
          return new Response(
            JSON.stringify({ success: false, error: createError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, job: newJob }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'update':
        if (!job_id || !status) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing job_id or status" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabase
          .from('job_queue')
          .update({ 
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id)
          .eq('user_id', userId);

        if (updateError) {
          return new Response(
            JSON.stringify({ success: false, error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'get':
        const query = supabase
          .from('job_queue')
          .select('*')
          .eq('user_id', userId);

        if (job_id) {
          query.eq('id', job_id);
        }

        const { data: jobs, error: getError } = await query;

        if (getError) {
          return new Response(
            JSON.stringify({ success: false, error: getError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, jobs: jobs }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      case 'cancel':
        if (!job_id) {
          return new Response(
            JSON.stringify({ success: false, error: "Missing job_id" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: cancelError } = await supabase
          .from('job_queue')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', job_id)
          .eq('user_id', userId);

        if (cancelError) {
          return new Response(
            JSON.stringify({ success: false, error: cancelError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      default:
        return new Response(
          JSON.stringify({ success: false, error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

  } catch (error) {
    console.error('Job queue error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});