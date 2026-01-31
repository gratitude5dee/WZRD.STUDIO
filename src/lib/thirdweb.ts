import { createThirdwebClient } from "thirdweb";
import { monad } from "thirdweb/chains";

// Thirdweb client - uses public client ID from env
// The client ID is safe to expose in frontend code
export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || "placeholder",
});

// Monad chain configuration
export const chain = monad;

// Wallet connection configuration
export const walletConfig = {
  chain,
  client: thirdwebClient,
};
