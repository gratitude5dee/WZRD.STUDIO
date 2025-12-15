import { createThirdwebClient } from "thirdweb";

// Using the THIRDWEB_CLIENT_ID from environment
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "YOUR_CLIENT_ID";

export const thirdwebClient = createThirdwebClient({
  clientId,
});
