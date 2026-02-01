import { useNavigate, useSearchParams } from "react-router-dom";
import { useWallet } from "@/contexts/WalletContext";
import { useMoltbook } from "@/contexts/MoltbookContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Music, Loader2, Mail, Apple, Chrome, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function Welcome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isConnected, isConnecting, connect, address } = useWallet();
  const { agent, verifyAgent, isVerifying, error: moltbookError, isAuthenticated } = useMoltbook();
  const [isNewUser, setIsNewUser] = useState(false);
  const [moltbookToken, setMoltbookToken] = useState("");
  const [showMoltbookDialog, setShowMoltbookDialog] = useState(false);

  // Check for moltbook_token in URL params (for OAuth-style redirects)
  useEffect(() => {
    const tokenFromUrl = searchParams.get("moltbook_token");
    if (tokenFromUrl) {
      handleMoltbookAuth(tokenFromUrl);
    }
  }, [searchParams]);

  // Handle wallet connection success
  useEffect(() => {
    if (isConnected) {
      const onboardingComplete =
        localStorage.getItem("mog_onboarding_complete") ||
        localStorage.getItem("eartone_onboarding_complete");
      if (!onboardingComplete) {
        setIsNewUser(true);
        navigate("/onboarding");
      } else {
        navigate("/home");
      }
    }
  }, [isConnected, navigate]);

  // Handle Moltbook auth success
  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Signed in with Moltbook!");
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  // Show Moltbook errors
  useEffect(() => {
    if (moltbookError) {
      toast.error(moltbookError);
    }
  }, [moltbookError]);

  const handleConnect = async () => {
    await connect();
  };

  const handleMoltbookAuth = async (token: string) => {
    const success = await verifyAgent(token);
    if (!success) return;

    setShowMoltbookDialog(false);
    setMoltbookToken("");

    if (!address) {
      toast("Connect your wallet to link your Moltbook profile.");
      return;
    }

    const storedAgent = agent ?? ((): typeof agent => {
      try {
        const stored = localStorage.getItem("moltbook_agent");
        return stored ? (JSON.parse(stored) as typeof agent) : null;
      } catch {
        return null;
      }
    })();

    if (storedAgent) {
      const { error: upsertError } = await supabase
        .from("moltbook_profiles" as any)
        .upsert(
          {
            wallet_address: address.toLowerCase(),
            agent_id: storedAgent.id,
            agent_name: storedAgent.name,
            agent_avatar: storedAgent.avatar_url,
            verified_at: new Date().toISOString(),
          },
          { onConflict: "wallet_address" }
        );

      if (upsertError) {
        toast("Verified, but failed to store in Supabase.");
      }
    }
  };

  const handleMoltbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (moltbookToken.trim()) {
      handleMoltbookAuth(moltbookToken.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 safe-top safe-bottom relative">
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
        <p className="text-muted-foreground mt-2">Pay per stream • Artists first</p>
      </div>

      {/* Connect Card */}
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground text-center">Sign in</h2>

        {/* Social Login Options */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Chrome className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Google</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Apple className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Apple</span>
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            <Mail className="h-5 w-5" />
            <span className="flex-1 text-left">Continue with Email</span>
          </Button>

          {/* Moltbook Sign-in for AI Agents */}
          <Dialog open={showMoltbookDialog} onOpenChange={setShowMoltbookDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start gap-3 bg-background hover:bg-secondary border-primary/30"
                disabled={isVerifying}
              >
                <Bot className="h-5 w-5 text-primary" />
                <span className="flex-1 text-left">
                  {isVerifying ? "Verifying..." : "Continue with Moltbook"}
                </span>
                <span className="text-xs text-muted-foreground">For AI agents</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Sign in with Moltbook
                </DialogTitle>
                <DialogDescription>
                  Enter your Moltbook identity token to authenticate as an AI agent. Your karma and
                  owner information will be verified.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleMoltbookSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Enter Moltbook identity token..."
                    value={moltbookToken}
                    onChange={(e) => setMoltbookToken(e.target.value)}
                    disabled={isVerifying}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Test tokens: <code className="bg-muted px-1 rounded">mock_agent_1</code>,{" "}
                    <code className="bg-muted px-1 rounded">mock_agent_2</code>,{" "}
                    <code className="bg-muted px-1 rounded">test_token</code>
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isVerifying || !moltbookToken.trim()}>
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Sign In"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>

        {/* Wallet Connection */}
        <Button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full h-12 bg-primary hover:bg-primary/90"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        {/* All Wallets Link */}
        <button
          className="w-full text-center text-sm text-primary hover:underline"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          View all 500+ wallets →
        </button>
      </div>

      {/* Footer - Partner Logos */}
      <div className="mt-8 flex items-center justify-center gap-6 opacity-80">
        <span className="font-mono tracking-tighter text-xs text-muted-foreground">Espresso</span>
        <span className="font-bold text-blue-500 text-xs">ApeChain ⛓️</span>
        <span className="text-xs text-muted-foreground">thirdweb</span>
        <span className="text-xs text-primary font-medium">Moltbook 🤖</span>
      </div>
    </div>
  );
}
