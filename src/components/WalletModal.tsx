import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownLeft, CreditCard, List, Eye, Wallet, LogOut, Copy, Check, ChevronRight, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { TransactionsSheet } from "./TransactionsSheet";

interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: string;
  onDisconnect: () => void;
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

export function WalletModal({
  open,
  onOpenChange,
  address,
  onDisconnect
}: WalletModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast({
      title: "Address copied to clipboard"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    onDisconnect();
    onOpenChange(false);
  };

  const handleTransactionsClick = () => {
    setTransactionsOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-3xl border-border/50 bg-background">
          <SheetHeader className="sr-only">
            <SheetTitle>Wallet</SheetTitle>
          </SheetHeader>
          
          {/* Profile Section */}
          <div className="flex flex-col items-center pt-2 pb-6">
            <div className="h-16 w-16 rounded-full mb-4" style={{
              background: generateGradient(address)
            }} />
            <button onClick={copyAddress} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-lg font-semibold text-foreground">
                {formatAddress(address)}
              </span>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </button>
            <span className="text-sm text-muted-foreground mt-1">MetaMask</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-border/50 hover:bg-muted/50">
              <ArrowUpRight className="h-5 w-5" />
              <span className="text-sm">Send</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-border/50 hover:bg-muted/50">
              <ArrowDownLeft className="h-5 w-5" />
              <span className="text-sm">Receive</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-auto py-4 gap-2 border-border/50 hover:bg-muted/50">
              <CreditCard className="h-5 w-5" />
              <span className="text-sm">Buy</span>
            </Button>
          </div>

          {/* Network Info */}
          <button className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">M</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">GRATITUD3.ETH</p>
                <p className="text-sm text-muted-foreground">0 ETH</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Menu Items */}
          <div className="space-y-1 mb-4">
            <button 
              onClick={() => {
                onOpenChange(false);
                navigate("/upload");
              }}
              className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Upload</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </button>
            <button 
              onClick={handleTransactionsClick}
              className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <List className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Transactions</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">View Assets</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Manage Wallet</span>
            </button>
          </div>

          <Separator className="my-4" />

          {/* Disconnect */}
          <button onClick={handleDisconnect} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-destructive/10 transition-colors text-destructive">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Disconnect Wallet</span>
          </button>
        </SheetContent>
      </Sheet>

      {/* Transactions Sheet */}
      <TransactionsSheet
        open={transactionsOpen}
        onOpenChange={setTransactionsOpen}
        walletAddress={address}
      />
    </>
  );
}
