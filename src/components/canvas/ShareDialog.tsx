import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, Check, Globe, Lock } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasId: string | null;
}

export function ShareDialog({ open, onOpenChange, canvasId }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = canvasId
    ? `${window.location.origin}/kanvas/${canvasId}`
    : '';

  useEffect(() => {
    if (open && canvasId) {
      loadCanvasSettings();
    }
  }, [open, canvasId]);

  const loadCanvasSettings = async () => {
    if (!canvasId) return;

    try {
      const { data, error } = await supabase
        .from('canvas_projects')
        .select('settings')
        .eq('id', canvasId)
        .single();

      if (error) throw error;

      const settings = data?.settings as any;
      setIsPublic(settings?.isPublic || false);
    } catch (error) {
      console.error('Failed to load canvas settings:', error);
    }
  };

  const updatePublicStatus = async (newIsPublic: boolean) => {
    if (!canvasId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('canvas_projects')
        .update({
          settings: { isPublic: newIsPublic }
        })
        .eq('id', canvasId);

      if (error) throw error;

      setIsPublic(newIsPublic);
      toast.success(
        newIsPublic
          ? 'Canvas is now public'
          : 'Canvas is now private'
      );
    } catch (error) {
      console.error('Failed to update canvas:', error);
      toast.error('Failed to update sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Canvas</DialogTitle>
          <DialogDescription>
            Share your canvas with others via a link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-toggle" className="flex items-center gap-2">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4" />
                    Public Access
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Private
                  </>
                )}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Anyone with the link can view'
                  : 'Only you can access this canvas'}
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={updatePublicStatus}
              disabled={loading}
            />
          </div>

          {/* Share Link */}
          {isPublic && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isPublic && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
              Enable public access to generate a shareable link
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
