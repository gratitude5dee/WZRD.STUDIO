import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createThirdwebClient, defineChain, getContract, prepareContractCall, sendTransaction } from "npm:thirdweb";
import { privateKeyToAccount } from "npm:thirdweb/wallets";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const apeChain = defineChain({
  id: 33139,
  name: "ApeChain",
  rpc: "https://rpc.apechain.com",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function toTokenUnits(amount: string, decimals = 18) {
  const [whole, fraction = ""] = amount.split(".");
  const padded = (fraction + "0".repeat(decimals)).slice(0, decimals);
  return BigInt(whole || "0") * 10n ** BigInt(decimals) + BigInt(padded || "0");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  try {
    const { creatorWallet, amount, actionType, contentType, contentId, payerWallet } = await req.json();

    if (!creatorWallet || !amount) {
      return jsonResponse({ error: "missing_fields" }, 400);
    }

    const secretKey = Deno.env.get("THIRDWEB_SECRET_KEY");
    const adminPrivateKey = Deno.env.get("ADMIN_PRIVATE_KEY");
    const tokenAddress = Deno.env.get("FIVE_DEE_TOKEN_ADDRESS");

    if (!secretKey || !adminPrivateKey || !tokenAddress) {
      return jsonResponse({ error: "missing_env" }, 500);
    }

    const client = createThirdwebClient({ secretKey });
    const account = privateKeyToAccount({ client, privateKey: adminPrivateKey });

    const contract = getContract({
      client,
      chain: apeChain,
      address: tokenAddress,
    });

    const tx = prepareContractCall({
      contract,
      method: "function transfer(address to, uint256 amount) returns (bool)",
      params: [creatorWallet, toTokenUnits(String(amount))],
    });

    const result = await sendTransaction({ transaction: tx, account });

    if (contentType && contentId && payerWallet) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (supabaseUrl && supabaseServiceKey) {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from("engagement_payouts")
          .upsert({
            content_type: contentType,
            content_id: contentId,
            action_type: actionType ?? "like",
            payer_wallet: String(payerWallet).toLowerCase(),
            creator_wallet: String(creatorWallet).toLowerCase(),
            amount: Number(amount),
            tx_hash: result.transactionHash,
            status: "confirmed",
            confirmed_at: new Date().toISOString(),
          }, {
            onConflict: "content_type,content_id,action_type,payer_wallet",
          });
      }
    }

    return jsonResponse({
      success: true,
      transactionHash: result.transactionHash,
      actionType,
    });
  } catch (error) {
    console.error("[distribute-rewards]", error);
    return jsonResponse({ error: "transaction_failed" }, 500);
  }
});
