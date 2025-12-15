import { inAppWallet, createWallet } from "thirdweb/wallets";

export const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "apple", "discord", "email", "passkey", "phone"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("walletConnect"),
];
