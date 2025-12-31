import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Edit,
  Eye,
  Facebook,
  Globe,
  Link2,
  Linkedin,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  QrCode,
  Twitter,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useProjectShare } from '@/hooks/useProjectShare';
import type { Project } from './ProjectCard';

interface ShareProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

type AccessLevel = 'view' | 'comment' | 'edit';

const ACCESS_LEVELS = [
  { value: 'view', label: 'View Only', icon: Eye, description: 'Can view but not edit' },
  { value: 'comment', label: 'Comment', icon: MessageSquare, description: 'Can view and add comments' },
  { value: 'edit', label: 'Edit', icon: Edit, description: 'Full editing access' },
];

export const ShareProjectDialog = ({ open, onOpenChange, project }: ShareProjectDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('view');
  const [expiresIn, setExpiresIn] = useState('never');
  const [emailInput, setEmailInput] = useState('');

  const {
    shareLink,
    isGenerating,
    generateShareLink,
    updateProjectVisibility,
  } = useProjectShare(project.id);

  useEffect(() => {
    if (open && !shareLink) {
      generateShareLink(accessLevel, expiresIn);
    }
  }, [open, shareLink, accessLevel, expiresIn, generateShareLink]);

  const handleCopyLink = async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleRegenerateLink = () => {
    generateShareLink(accessLevel, expiresIn);
  };

  const handleSocialShare = (platform: string) => {
    if (!shareLink) return;

    const text = `Check out my project "${project.title}" on WZRD Studio`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const handleEmailInvite = async () => {
    if (!emailInput.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast.error('Please enter a valid email address');
      return;
    }

    toast.success(`Invitation sent to ${emailInput}`);
    setEmailInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl">Share "{project.title}"</DialogTitle>
          <DialogDescription>
            Invite others to view or collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start px-6 bg-transparent border-b rounded-none h-auto pb-0">
            <TabsTrigger
              value="link"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-purple pb-3"
            >
              <Link2 className="w-4 h-4 mr-2" />
              Share Link
            </TabsTrigger>
            <TabsTrigger
              value="invite"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent-purple pb-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Invite People
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="p-6 pt-4 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Access Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {ACCESS_LEVELS.map((level) => {
                  const Icon = level.icon;
                  const isActive = accessLevel === level.value;

                  return (
                    <button
                      key={level.value}
                      onClick={() => setAccessLevel(level.value as AccessLevel)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        isActive
                          ? 'border-accent-purple bg-[hsl(var(--interactive-selected))]'
                          : 'border-border-default hover:border-border-strong'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5',
                          isActive ? 'text-accent-purple' : 'text-text-secondary'
                        )}
                      />
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isActive ? 'text-accent-purple' : 'text-text-secondary'
                        )}
                      >
                        {level.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Link Expires</Label>
              <Select value={expiresIn} onValueChange={setExpiresIn}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Share Link</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={shareLink || 'Generating...'}
                    readOnly
                    className="pr-10 bg-surface-2 font-mono text-sm"
                  />
                  {isGenerating && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-text-tertiary" />
                  )}
                </div>
                <Button
                  onClick={handleCopyLink}
                  disabled={!shareLink || isGenerating}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <button
                onClick={handleRegenerateLink}
                disabled={isGenerating}
                className="text-xs text-text-tertiary hover:text-accent-purple transition-colors"
              >
                Regenerate link
              </button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium text-text-tertiary">Share via</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('twitter')}
                  className="rounded-xl"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('linkedin')}
                  className="rounded-xl"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSocialShare('facebook')}
                  className="rounded-xl"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    toast.info('QR code sharing coming soon');
                  }}
                  className="rounded-xl"
                >
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invite" className="p-6 pt-4 space-y-6 mt-0">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleEmailInvite()}
                />
                <Button onClick={handleEmailInvite}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-text-tertiary">Pending Invites</Label>
              <div className="text-sm text-text-tertiary text-center py-8">
                No pending invitations
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="px-6 py-4 bg-surface-2 border-t border-border-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            {project.is_private ? (
              <Lock className="w-4 h-4 text-text-tertiary" />
            ) : (
              <Globe className="w-4 h-4 text-emerald-500" />
            )}
            <div>
              <p className="text-sm font-medium">
                {project.is_private ? 'Private Project' : 'Public Project'}
              </p>
              <p className="text-xs text-text-tertiary">
                {project.is_private
                  ? 'Only people with the link can access'
                  : 'Anyone can discover this project'}
              </p>
            </div>
          </div>
          <Switch
            checked={!project.is_private}
            onCheckedChange={(checked) => updateProjectVisibility(!checked)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
