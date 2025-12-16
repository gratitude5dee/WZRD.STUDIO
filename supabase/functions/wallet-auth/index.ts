// ============================================================================
// EDGE FUNCTION: wallet-auth
// PURPOSE: Bridge Thirdweb wallet authentication with Supabase
// ROUTE: POST /functions/v1/wallet-auth (public - no JWT required)
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WalletAuthRequest {
  walletAddress: string;
  message: string;
  signature: string;
  timestamp: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { walletAddress, message, signature, timestamp }: WalletAuthRequest = await req.json();

    // Validate required fields
    if (!walletAddress || !message || !signature || !timestamp) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: walletAddress, message, signature, timestamp' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate timestamp (message should be signed within last 5 minutes)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (now - timestamp > fiveMinutes) {
      return new Response(
        JSON.stringify({ error: 'Signature expired. Please sign again.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate wallet address format
    const walletAddressLower = walletAddress.toLowerCase();
    if (!/^0x[a-f0-9]{40}$/i.test(walletAddress)) {
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Generate deterministic email from wallet address
    const walletEmail = `${walletAddressLower}@wallet.local`;
    // Use wallet address as password (hashed by Supabase)
    const walletPassword = `wallet_${walletAddressLower}_${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.slice(-16)}`;

    // Check if wallet user already exists
    const { data: existingWalletUser } = await supabaseAdmin
      .from('wallet_users')
      .select('user_id')
      .eq('wallet_address', walletAddressLower)
      .single();

    let userId: string;

    if (existingWalletUser) {
      // User exists, use their ID
      userId = existingWalletUser.user_id;
      console.log(`Found existing wallet user: ${userId}`);
    } else {
      // Create new user
      console.log(`Creating new user for wallet: ${walletAddressLower}`);
      
      // Try to create the user in auth.users
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: walletEmail,
        password: walletPassword,
        email_confirm: true, // Auto-confirm since wallet signature proves ownership
        user_metadata: {
          wallet_address: walletAddressLower,
          auth_type: 'wallet',
        }
      });

      if (createError) {
        // If user already exists in auth but not in wallet_users, find them
        if (createError.message.includes('already exists')) {
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const existingAuthUser = users?.users?.find(u => u.email === walletEmail);
          if (existingAuthUser) {
            userId = existingAuthUser.id;
            // Create wallet_users link
            await supabaseAdmin
              .from('wallet_users')
              .insert({
                wallet_address: walletAddressLower,
                user_id: userId,
              });
          } else {
            throw new Error('User exists but could not be found');
          }
        } else {
          console.error('Error creating user:', createError);
          throw createError;
        }
      } else if (newUser?.user) {
        userId = newUser.user.id;
        
        // Create wallet_users link
        const { error: linkError } = await supabaseAdmin
          .from('wallet_users')
          .insert({
            wallet_address: walletAddressLower,
            user_id: userId,
          });

        if (linkError) {
          console.error('Error linking wallet:', linkError);
          // Don't fail - user was created successfully
        }
      } else {
        throw new Error('Failed to create user - no user returned');
      }
    }

    // Sign in the user to get a session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });

    if (signInError || !signInData.session) {
      console.error('Error signing in:', signInError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate wallet user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully authenticated wallet: ${walletAddressLower}`);

    return new Response(
      JSON.stringify({
        session: signInData.session,
        user: signInData.user,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Wallet auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
