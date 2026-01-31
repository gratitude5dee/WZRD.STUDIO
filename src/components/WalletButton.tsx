import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useState } from "react";
import { WalletModal } from "./WalletModal";

function generateGradient(address: string): string {
  const hash = address.slice(2, 10);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 70%, 50%))`;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnecting) {
    return (
      <Button disabled variant="secondary" size="sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <Button 
          variant="secondary" 
          size="sm" 
          className="gap-2 pl-1.5 pr-3"
          onClick={() => setModalOpen(true)}
        >
          <div 
            className="h-6 w-6 rounded-full flex-shrink-0"
            style={{ background: generateGradient(address) }}
          />
          <span className="font-medium">{formatAddress(address)}</span>
        </Button>
        <WalletModal 
          open={modalOpen} 
          onOpenChange={setModalOpen}
          address={address}
          onDisconnect={disconnect}
        />
      </>
    );
  }

  return (
    <Button onClick={connect} size="sm" className="gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
