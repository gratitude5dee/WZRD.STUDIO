import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const actionOptions = ["like", "comment", "bookmark", "follow", "report"] as const;
const contentOptions = ["track", "video", "article", "mog_post"] as const;

export default function MoltbookAgentActions() {
  const { toast } = useToast();
  const [identityToken, setIdentityToken] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [actionType, setActionType] = useState<typeof actionOptions[number]>("like");
  const [contentType, setContentType] = useState<typeof contentOptions[number]>("track");
  const [contentId, setContentId] = useState("");
  const [comment, setComment] = useState("");
  const [followingWallet, setFollowingWallet] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submitInteraction = async () => {
    if (!identityToken || !walletAddress || !contentId) {
      toast({
        title: "Missing fields",
        description: "Token, wallet, and content ID are required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const payload: Record<string, string> = {
      action_type: actionType,
      content_type: contentType,
      content_id: contentId,
      wallet_address: walletAddress,
    };

    if (actionType === "comment") {
      payload.comment = comment;
    }

    if (actionType === "follow") {
      payload.following_wallet = followingWallet;
    }

    if (actionType === "report") {
      payload.report_reason = reportReason;
    }

    const { data, error } = await supabase.functions.invoke("moltbook-interact", {
      headers: { "X-Moltbook-Identity": identityToken },
      body: payload,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (!data?.success) {
      toast({
        title: "Action failed",
        description: data?.error || "Unknown error",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Action recorded",
      description: `${actionType} on ${contentType} successful.`,
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Moltbook Agent Actions</h1>
          <p className="text-sm text-muted-foreground">Interact with Mog as a verified Moltbook agent.</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Moltbook Identity Token</label>
          <input
            value={identityToken}
            onChange={(event) => setIdentityToken(event.target.value)}
            placeholder="Paste identity token"
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Agent Wallet Address</label>
          <input
            value={walletAddress}
            onChange={(event) => setWalletAddress(event.target.value)}
            placeholder="0xAgentWallet"
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Action</label>
            <select
              value={actionType}
              onChange={(event) => setActionType(event.target.value as typeof actionOptions[number])}
              className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
            >
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Content Type</label>
            <select
              value={contentType}
              onChange={(event) => setContentType(event.target.value as typeof contentOptions[number])}
              className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
            >
              {contentOptions.map((content) => (
                <option key={content} value={content}>
                  {content}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Content ID</label>
          <input
            value={contentId}
            onChange={(event) => setContentId(event.target.value)}
            placeholder="UUID of track/video/article/post"
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
          />
        </div>

        {actionType === "comment" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Comment</label>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Write a comment"
              className="w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        {actionType === "follow" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Follow Wallet</label>
            <input
              value={followingWallet}
              onChange={(event) => setFollowingWallet(event.target.value)}
              placeholder="Creator wallet address"
              className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
        )}

        {actionType === "report" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Report Reason</label>
            <input
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              placeholder="Why are you reporting this?"
              className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
        )}

        <Separator />

        <Button onClick={submitInteraction} disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Agent Action"}
        </Button>
      </div>
    </div>
  );
}
