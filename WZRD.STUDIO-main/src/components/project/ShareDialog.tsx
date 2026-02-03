import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Copy, Mail, Link2, Users, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

export const ShareDialog = ({ open, onOpenChange, projectId, projectTitle }: ShareDialogProps) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'links'>('invite');
  
  // Invite tab state
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer' | 'commenter'>('editor');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  
  // Links tab state
  const [isPublic, setIsPublic] = useState(false);
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [linkName, setLinkName] = useState('');
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email || !projectId) return;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);

    try {
      // TODO: Implement actual invitation logic when backend is ready
      toast.success(`Invitation will be sent to ${email}`);
      setEmail('');
      setInviteMessage('');
    } catch (error: any) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateLink = async () => {
    if (!projectId) return;

    setIsCreatingLink(true);

    try {
      // TODO: Implement actual link creation when backend is ready
      const mockUrl = `${window.location.origin}/shared/${projectId}`;
      setShareUrl(mockUrl);
      toast.success('Share link created');
    } catch (error: any) {
      toast.error('Failed to create share link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-black/95 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Share "{projectTitle}"
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Collaborate with others or create shareable links
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900">
            <TabsTrigger 
              value="invite" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              Invite People
            </TabsTrigger>
            <TabsTrigger 
              value="links"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Link2 className="h-4 w-4 mr-2" />
              Share Links
            </TabsTrigger>
          </TabsList>

          {/* Invite People Tab */}
          <TabsContent value="invite" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && email) {
                      handleInvite();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-zinc-300">Role</Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="editor" className="text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">Editor</span>
                        <span className="text-xs text-zinc-400">Can edit and collaborate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="commenter" className="text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">Commenter</span>
                        <span className="text-xs text-zinc-400">Can view and comment</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer" className="text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">Viewer</span>
                        <span className="text-xs text-zinc-400">Can only view</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-zinc-300">
                  Message (Optional)
                </Label>
                <Input
                  id="message"
                  placeholder="Add a personal message..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button
                onClick={handleInvite}
                disabled={!email || isInviting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isInviting ? (
                  <>Sending Invitation...</>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>

            {/* Placeholder for invited collaborators */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Pending Invitations</h4>
              <div className="text-sm text-zinc-500 text-center py-4">
                No pending invitations
              </div>
            </div>
          </TabsContent>

          {/* Share Links Tab */}
          <TabsContent value="links" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <div className="flex items-center gap-3">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-green-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-zinc-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {isPublic ? 'Public Access' : 'Private Project'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {isPublic 
                        ? 'Anyone with the link can access' 
                        : 'Only invited people can access'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkName" className="text-zinc-300">Link Name (Optional)</Label>
                <Input
                  id="linkName"
                  placeholder="e.g., Client Review Link"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel" className="text-zinc-300">Access Level</Label>
                <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="view" className="text-white">View Only</SelectItem>
                    <SelectItem value="comment" className="text-white">Can Comment</SelectItem>
                    <SelectItem value="edit" className="text-white">Can Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCreateLink}
                disabled={isCreatingLink}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isCreatingLink ? (
                  <>Creating Link...</>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Create Share Link
                  </>
                )}
              </Button>

              {shareUrl && (
                <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-300">Share Link</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(shareUrl)}
                      className={cn(
                        "text-xs",
                        copied ? "text-green-400" : "text-indigo-400 hover:text-indigo-300"
                      )}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/50 rounded border border-zinc-800">
                    <code className="text-xs text-zinc-400 flex-1 truncate">{shareUrl}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Placeholder for existing links */}
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Active Share Links</h4>
              <div className="text-sm text-zinc-500 text-center py-4">
                No active share links
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
