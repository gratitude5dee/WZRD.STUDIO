import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link, Users, X, Check, Globe, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SharedUserProfile {
  email?: string;
  display_name?: string;
  avatar_url?: string;
}

interface ProjectShare {
  id: string;
  is_public: boolean;
  permission_level: string;
  share_token: string | null;
  shared_with_user?: SharedUserProfile | null;
}

export const ShareModal = ({ projectId, projectName, isOpen, onClose }: ShareModalProps) => {
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState('');
  const [permission, setPermission] = useState('view');
  const [isPublic, setIsPublic] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [existingShares, setExistingShares] = useState<ProjectShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Note: project_shares table may not exist yet - handle gracefully
    const fetchShares = async () => {
      try {
        // For now, just set empty shares since the table doesn't exist in types
        setExistingShares([]);
      } catch (error) {
        console.error('Error fetching shares:', error);
      }
    };

    fetchShares();
  }, [isOpen, projectId]);

  const createShare = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-share', {
        body: {
          projectId,
          permission,
          isPublic,
          inviteEmail: inviteEmail || undefined,
        },
      });

      if (error) throw error;

      const link = data?.shareLink || data?.shareUrl;
      if (link) {
        setShareLink(link);
        toast({
          title: 'Share link created',
          description: 'Your share link has been generated.',
        });
      } else {
        throw new Error('No share link returned');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create share link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Share link copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const revokeShare = async (shareId: string) => {
    try {
      const { error } = await supabase.functions.invoke('revoke-share', {
        body: { shareId },
      });

      if (error) throw error;

      setExistingShares((prev) => prev.filter((s) => s.id !== shareId));
      toast({
        title: 'Share revoked',
        description: 'The share has been revoked.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke share',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share "{projectName}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Permission Level */}
          <div className="space-y-2">
            <Label>Permission Level</Label>
            <Select value={permission} onValueChange={setPermission}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="comment">Can Comment</SelectItem>
                <SelectItem value="edit">Can Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3">
            <div className="flex items-center gap-3">
              {isPublic ? <Globe className="h-5 w-5 text-green-500" /> : <Lock className="h-5 w-5 text-zinc-500" />}
              <div>
                <p className="text-sm font-medium">{isPublic ? 'Public' : 'Private'}</p>
                <p className="text-xs text-zinc-500">
                  {isPublic ? 'Anyone with the link can access' : 'Only invited users can access'}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Invite by Email */}
          {!isPublic && (
            <div className="space-y-2">
              <Label>Invite by Email</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          )}

          {/* Generate Link Button */}
          <Button onClick={createShare} disabled={isLoading} className="w-full">
            <Link className="mr-2 h-4 w-4" />
            {isLoading ? 'Generating...' : 'Generate Share Link'}
          </Button>

          {/* Share Link Display */}
          {shareLink && (
            <div className="flex items-center gap-2">
              <Input value={shareLink} readOnly className="flex-1" />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {/* Existing Shares */}
          {existingShares.length > 0 && (
            <div className="space-y-2">
              <Label>Active Shares</Label>
              <div className="space-y-2">
                {existingShares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                        {share.is_public ? (
                          <Globe className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">
                            {share.shared_with_user?.display_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm">
                          {share.is_public
                            ? 'Public Link'
                            : share.shared_with_user?.email || 'Invited User'}
                        </p>
                        <p className="text-xs text-zinc-500 capitalize">{share.permission_level}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => revokeShare(share.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
