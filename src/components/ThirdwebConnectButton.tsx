import { ConnectButton } from "thirdweb/react";
import { thirdwebClient, apeChain } from "@/lib/thirdweb";

interface ThirdwebConnectButtonProps {
  label?: string;
  fullWidth?: boolean;
  className?: string;
}

export function ThirdwebConnectButton({ 
  label = "Connect Wallet", 
  fullWidth = false,
  className = ""
}: ThirdwebConnectButtonProps) {
  return (
    <ConnectButton
      client={thirdwebClient}
      chain={apeChain}
      connectButton={{
        label,
        className: `${fullWidth ? 'w-full' : ''} ${className}`,
      }}
      theme="dark"
      connectModal={{
        size: "compact",
        title: "Connect to Monad",
        showThirdwebBranding: false,
      }}
    />
  );
}
