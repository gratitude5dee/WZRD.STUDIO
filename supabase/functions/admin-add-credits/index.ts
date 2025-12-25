import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, amount = 50000, transaction_type = 'free' } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // First check if user_credits record exists
    const { data: existingCredits } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!existingCredits) {
      // Create initial credits record
      const { error: insertError } = await supabase
        .from('user_credits')
        .insert({ user_id, total_credits: amount, used_credits: 0 });
      
      if (insertError) {
        console.error('Error creating credits record:', insertError);
        throw insertError;
      }
    } else {
      // Update existing credits
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ 
          total_credits: existingCredits.total_credits + amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);
      
      if (updateError) {
        console.error('Error updating credits:', updateError);
        throw updateError;
      }
    }

    // Record the transaction
    const { error: txError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id,
        amount,
        transaction_type,
        resource_type: 'credit',
        metadata: { source: 'admin', note: 'Admin credit addition' }
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
      // Don't fail the whole operation for this
    }

    console.log(`✅ Added ${amount} credits to user ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Added ${amount} credits to account`,
        user_id,
        amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error adding credits:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
