import { useNavigate } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import { Wallet, Music, Loader2, Mail, Apple, Chrome } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Welcome() {
  const navigate = useNavigate();
  const {
    isConnected,
    isConnecting,
    connect
  } = useWallet();
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (isConnected) {
      const onboardingComplete = localStorage.getItem('mog_onboarding_complete') || localStorage.getItem('eartone_onboarding_complete');
      if (!onboardingComplete) {
        setIsNewUser(true);
        navigate("/onboarding");
      } else {
        navigate("/home");
      }
    }
  }, [isConnected, navigate]);
  const handleConnect = async () => {
    await connect();
  };
  return <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 safe-top safe-bottom relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Monad Music Branding */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <Music className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Mog</h1>
        <p className="text-muted-foreground mt-2">
          Pay per stream • Artists first
        </p>
      </div>

      {/* Connect Card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground text-center">
          Sign in
        </h2>

        {/* Social Login Options */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary" onClick={handleConnect} disabled={isConnecting}>
            <Chrome className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Google</span>
          </Button>

          <Button variant="outline" className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary" onClick={handleConnect} disabled={isConnecting}>
            <Apple className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Apple</span>
          </Button>

          <Button variant="outline" className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary" onClick={handleConnect} disabled={isConnecting}>
            <Mail className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Email</span>
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Wallet Connection */}
        <Button onClick={handleConnect} disabled={isConnecting} className="w-full h-12 bg-primary hover:bg-primary/90">
          {isConnecting ? <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Connecting...
            </> : <>
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </>}
        </Button>

        {/* All Wallets Link */}
        <button className="w-full text-center text-sm text-primary hover:underline" onClick={handleConnect} disabled={isConnecting}>
          View all 500+ wallets →
        </button>
      </div>

      {/* Footer - Partner Logos */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-80">
        <span className="font-mono tracking-tighter text-xs text-muted-foreground">Espresso</span>
        <span className="font-bold text-blue-500 text-xs">ApeChain ⛓️</span>
        <span className="text-xs text-muted-foreground">thirdweb</span>
      </div>
    </div>;
}