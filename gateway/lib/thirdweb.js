import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";
import { defineChain } from "thirdweb/chains";

export function getServerClient() {
  if (!process.env.THIRDWEB_SECRET_KEY) {
    throw new Error("THIRDWEB_SECRET_KEY is not set");
  }

  return createThirdwebClient({
    secretKey: process.env.THIRDWEB_SECRET_KEY,
  });
}

export function getFacilitator() {
  if (!process.env.THIRDWEB_SERVER_WALLET_ADDRESS) {
    throw new Error("THIRDWEB_SERVER_WALLET_ADDRESS is not set");
  }

  const client = getServerClient();
  return facilitator({
    client,
    serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS,
  });
}

export function getNetwork() {
  const chainId = Number(process.env.X402_CHAIN_ID || 33139);
  const rpcUrl = process.env.X402_RPC_URL || "https://rpc.apechain.com";

  return defineChain({
    id: chainId,
    rpc: rpcUrl,
  });
}
