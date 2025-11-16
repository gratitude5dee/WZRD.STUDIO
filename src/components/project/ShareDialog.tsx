import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Copy, Mail, Link2, Users, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
}

interface Collaborator {
  id: string;
  invited_email: string;
  role: string;
  invitation_status: string;
  created_at: string;
}

interface ShareLink {
  id: string;
  token: string;
  link_type: 'private' | 'public';
  access_level: 'view' | 'comment' | 'edit';
  name: string;
  expires_at: string | null;
  current_uses: number;
  max_uses: number | null;
  created_at: string;
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
  const [linkType, setLinkType] = useState<'private' | 'public'>('private');
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'edit'>('view');
  const [linkName, setLinkName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>();
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Lists
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && projectId) {
      loadCollaborators();
      loadShareLinks();
    }
  }, [open, projectId]);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error: any) {
      console.error('Error loading collaborators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadShareLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('project_share_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error: any) {
      console.error('Error loading share links:', error);
    }
  };

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
      const { data, error } = await supabase.functions.invoke('invite-collaborator', {
        body: {
          projectId,
          email,
          role,
          message: inviteMessage || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      setInviteMessage('');
      loadCollaborators();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!projectId) return;

    setIsCreatingLink(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-share-link', {
        body: {
          projectId,
          linkType,
          accessLevel,
          name: linkName || `${linkType} ${accessLevel} link`,
          expiresInDays,
        },
      });

      if (error) throw error;

      setShareUrl(data.shareUrl);
      toast.success('Share link created successfully');
      setLinkName('');
      setExpiresInDays(undefined);
      loadShareLinks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create share link');
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      toast.success('Collaborator removed');
      loadCollaborators();
    } catch (error: any) {
      toast.error('Failed to remove collaborator');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-cyber-surface border-cyber-grid">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-cyber-primary">
            Share "{projectTitle}"
          </DialogTitle>
          <DialogDescription className="font-body text-cyber-secondary">
            Collaborate with others or create shareable links
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-cyber-surface-elevated">
            <TabsTrigger value="invite" className="font-tech data-[state=active]:bg-cyber-neon-cyan/20 data-[state=active]:text-cyber-neon-cyan">
              <Mail className="w-4 h-4 mr-2" />
              Invite People
            </TabsTrigger>
            <TabsTrigger value="links" className="font-tech data-[state=active]:bg-cyber-neon-magenta/20 data-[state=active]:text-cyber-neon-magenta">
              <Link2 className="w-4 h-4 mr-2" />
              Share Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="space-y-6 mt-6">
            {/* Invite Form */}
            <div className="space-y-4 p-6 rounded-lg border border-cyber-grid bg-cyber-surface-elevated/50">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-tech text-cyber-primary">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-cyber-surface border-cyber-grid text-white font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="font-tech text-cyber-primary">
                  Role
                </Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="bg-cyber-surface border-cyber-grid text-white font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-surface border-cyber-grid">
                    <SelectItem value="editor">Editor - Can edit everything</SelectItem>
                    <SelectItem value="viewer">Viewer - Can only view</SelectItem>
                    <SelectItem value="commenter">Commenter - Can comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="font-tech text-cyber-primary">
                  Personal Message (Optional)
                </Label>
                <Input
                  id="message"
                  placeholder="Add a note..."
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  className="bg-cyber-surface border-cyber-grid text-white font-body"
                />
              </div>

              <Button
                onClick={handleInvite}
                disabled={!email || isInviting}
                className="w-full bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-magenta hover:opacity-90 text-black font-display font-bold"
              >
                {isInviting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>

            {/* Collaborators List */}
            {collaborators.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-tech text-cyber-secondary">
                  <Users className="w-4 h-4" />
                  Current Collaborators ({collaborators.length})
                </div>
                <div className="space-y-2">
                  {collaborators.map((collab) => (
                    <motion.div
                      key={collab.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface-elevated border border-cyber-grid"
                    >
                      <div>
                        <div className="font-body text-white">{collab.invited_email}</div>
                        <div className="text-xs font-tech text-cyber-secondary">
                          {collab.role} • {collab.invitation_status}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collab.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="space-y-6 mt-6">
            {/* Create Link Form */}
            <div className="space-y-4 p-6 rounded-lg border border-cyber-grid bg-cyber-surface-elevated/50">
              <div className="space-y-2">
                <Label htmlFor="linkType" className="font-tech text-cyber-primary">
                  Link Type
                </Label>
                <Select value={linkType} onValueChange={(v: any) => setLinkType(v)}>
                  <SelectTrigger className="bg-cyber-surface border-cyber-grid text-white font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-surface border-cyber-grid">
                    <SelectItem value="private">Private - Requires password</SelectItem>
                    <SelectItem value="public">Public - Anyone with link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessLevel" className="font-tech text-cyber-primary">
                  Access Level
                </Label>
                <Select value={accessLevel} onValueChange={(v: any) => setAccessLevel(v)}>
                  <SelectTrigger className="bg-cyber-surface border-cyber-grid text-white font-body">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cyber-surface border-cyber-grid">
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="comment">Can Comment</SelectItem>
                    <SelectItem value="edit">Can Edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkName" className="font-tech text-cyber-primary">
                  Link Name (Optional)
                </Label>
                <Input
                  id="linkName"
                  placeholder="e.g., Client Review Link"
                  value={linkName}
                  onChange={(e) => setLinkName(e.target.value)}
                  className="bg-cyber-surface border-cyber-grid text-white font-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires" className="font-tech text-cyber-primary">
                  Expires In (Days, Optional)
                </Label>
                <Input
                  id="expires"
                  type="number"
                  placeholder="7"
                  value={expiresInDays || ''}
                  onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="bg-cyber-surface border-cyber-grid text-white font-body"
                />
              </div>

              <Button
                onClick={handleCreateShareLink}
                disabled={isCreatingLink}
                className="w-full bg-gradient-to-r from-cyber-neon-magenta to-cyber-neon-purple hover:opacity-90 text-black font-display font-bold"
              >
                {isCreatingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Create Share Link
                  </>
                )}
              </Button>
            </div>

            {/* Generated Link */}
            <AnimatePresence>
              {shareUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-lg bg-cyber-neon-cyan/10 border border-cyber-neon-cyan/50"
                >
                  <Label className="font-tech text-cyber-neon-cyan mb-2 block">
                    Share this link:
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="bg-cyber-surface border-cyber-grid text-white font-body"
                    />
                    <Button
                      onClick={() => handleCopyLink(shareUrl)}
                      className="bg-cyber-neon-cyan text-black hover:bg-cyber-neon-cyan/90"
                    >
                      {copied ? '✓' : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Share Links List */}
            {shareLinks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-tech text-cyber-secondary">
                  <Link2 className="w-4 h-4" />
                  Active Share Links ({shareLinks.length})
                </div>
                <div className="space-y-2">
                  {shareLinks.map((link) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-cyber-surface-elevated border border-cyber-grid group"
                    >
                      <div className="flex-1">
                        <div className="font-body text-white">{link.name}</div>
                        <div className="text-xs font-tech text-cyber-secondary">
                          {link.link_type} • {link.access_level} • {link.current_uses} uses
                          {link.expires_at && ` • Expires ${new Date(link.expires_at).toLocaleDateString()}`}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(`${window.location.origin}/share/${link.token}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
