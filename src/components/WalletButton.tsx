import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2 } from "lucide-react";
import { useState } from "react";
import { WalletModal } from "./WalletModal";
import { cn } from "@/lib/utils";

interface WalletButtonProps {
  compact?: boolean;
}

function generateGradient(address: string): string {
  const hash = address.slice(2, 10);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 40) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 80%, 60%), hsl(${hue2}, 70%, 50%))`;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletButton({ compact = false }: WalletButtonProps) {
  const { address, isConnected, isConnecting, connect, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  if (isConnecting) {
    return (
      <Button disabled variant="secondary" size="sm" className={cn(compact && "h-9 w-9 p-0")}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!compact && <span className="ml-2">Connecting...</span>}
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <button 
          onClick={() => setModalOpen(true)}
          className={cn(
            "flex items-center justify-center rounded-full transition-all hover:ring-2 hover:ring-primary/50 active:scale-95 touch-target",
            compact ? "h-9 w-9" : "gap-2 pl-1.5 pr-3 h-9 bg-secondary hover:bg-secondary/80"
          )}
          aria-label="Open wallet menu"
        >
          <div 
            className={cn(
              "rounded-full flex-shrink-0",
              compact ? "h-8 w-8" : "h-6 w-6"
            )}
            style={{ background: generateGradient(address) }}
          />
          {!compact && (
            <span className="font-medium text-sm text-foreground">{formatAddress(address)}</span>
          )}
        </button>
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
    <Button 
      onClick={connect} 
      size="sm" 
      className={cn("gap-2", compact && "h-9 w-9 p-0")}
    >
      <Wallet className="h-4 w-4" />
      {!compact && <span>Connect</span>}
    </Button>
  );
}
