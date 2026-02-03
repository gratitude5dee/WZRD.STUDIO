import { useState } from 'react';
import { Users, UserPlus, X, Crown, Eye, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { PresenceUser } from '@/hooks/usePresence';

interface CollaboratorsPanelProps {
  projectId: string;
  onlineUsers: Record<string, PresenceUser>;
}

export function CollaboratorsPanel({ projectId, onlineUsers }: CollaboratorsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      toast.loading('Sending invitation...', { id: 'invite' });
      
      // Here you would call your API to invite a collaborator
      // For now, we'll just show a success message
      
      toast.success('Invitation sent!', { id: 'invite' });
      setInviteEmail('');
    } catch (error) {
      toast.error('Failed to send invitation', { id: 'invite' });
    }
  };

  const onlineCount = Object.keys(onlineUsers).length;

  return (
    <div className="absolute top-4 right-4 z-50">
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Users className="w-4 h-4" />
        <span>{onlineCount}</span>
      </Button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-background border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Collaborators</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Invite Input */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <Button size="sm" onClick={handleInvite}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Online Users */}
          <div className="space-y-2">
            <h4 className="text-sm text-muted-foreground mb-2">
              Online ({onlineCount})
            </h4>
            {Object.values(onlineUsers).map((user) => (
              <div
                key={user.userId}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                </div>

                <Select defaultValue="editor">
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">
                      <div className="flex items-center gap-2">
                        <Crown className="w-3 h-3" />
                        Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex items-center gap-2">
                        <Edit className="w-3 h-3" />
                        Editor
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        Viewer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
