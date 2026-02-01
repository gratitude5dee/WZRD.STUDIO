import { createThirdwebClient, getContract, defineChain } from "thirdweb";

// Thirdweb client - uses public client ID from env
// The client ID is safe to expose in frontend code
export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "placeholder",
});

// ApeChain configuration (Mainnet)
export const apeChain = defineChain({
  id: 33139,
  name: "ApeChain",
  rpc: "https://rpc.apechain.com",
  nativeCurrency: {
    name: "ApeCoin",
    symbol: "APE",
    decimals: 18,
  },
});

// $5DEE token contract (replace with actual address)
export const FIVE_DEE_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";

export const tokenContract = getContract({
  client: thirdwebClient,
  chain: apeChain,
  address: FIVE_DEE_TOKEN_ADDRESS,
});

// Wallet connection configuration
export const walletConfig = {
  chain: apeChain,
  client: thirdwebClient,
};
