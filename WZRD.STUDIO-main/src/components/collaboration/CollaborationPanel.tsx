// ============================================================================
// COMPONENT: Collaboration Panel
// PURPOSE: Main UI for managing collaborators, share links, and activity
// ============================================================================

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collaborationService } from "@/services/collaborationService";
import { useActivityFeed, useActiveSessions } from "@/hooks/useCollaboration";
import type { CollaborationRole, ShareLinkType, ShareLinkAccess } from "@/types/collaboration";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Link2,
  Activity,
  Mail,
  Copy,
  Trash2,
  Eye,
  Edit,
  MessageSquare,
  Clock,
  Check,
  X,
} from "lucide-react";

interface CollaborationPanelProps {
  projectId: string;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
}) => {
  const [activeTab, setActiveTab] = useState<"collaborators" | "links" | "activity">("collaborators");
  const queryClient = useQueryClient();

  // Fetch collaborators
  const { data: collaborators = [], isLoading: loadingCollaborators } = useQuery({
    queryKey: ["collaborators", projectId],
    queryFn: () => collaborationService.listCollaborators(projectId),
    enabled: !!projectId,
  });

  // Fetch share links
  const { data: shareLinks = [], isLoading: loadingLinks } = useQuery({
    queryKey: ["shareLinks", projectId],
    queryFn: () => collaborationService.listShareLinks(projectId),
    enabled: !!projectId,
  });

  // Activity feed
  const { activities } = useActivityFeed(projectId);

  // Active sessions
  const activeSessions = useActiveSessions(projectId);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("collaborators")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "collaborators"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Users className="w-4 h-4" />
            <span>Collaborators</span>
            <Badge variant="secondary" className="ml-1">
              {collaborators.length}
            </Badge>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "links"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Link2 className="w-4 h-4" />
            <span>Share Links</span>
            <Badge variant="secondary" className="ml-1">
              {shareLinks.length}
            </Badge>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "activity"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Activity className="w-4 h-4" />
            <span>Activity</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {activeTab === "collaborators" && (
          <CollaboratorsTab projectId={projectId} collaborators={collaborators} />
        )}
        {activeTab === "links" && (
          <ShareLinksTab projectId={projectId} shareLinks={shareLinks} />
        )}
        {activeTab === "activity" && (
          <ActivityTab activities={activities} activeSessions={activeSessions} />
        )}
      </ScrollArea>
    </div>
  );
};

// Collaborators Tab
const CollaboratorsTab: React.FC<{
  projectId: string;
  collaborators: any[];
}> = ({ projectId, collaborators }) => {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CollaborationRole>("viewer");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: () =>
      collaborationService.inviteCollaborator(projectId, email, role, message),
    onSuccess: (data) => {
      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
      setInviteDialogOpen(false);
      setEmail("");
      setMessage("");
      setRole("viewer");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (collaboratorId: string) =>
      collaborationService.removeCollaborator(collaboratorId),
    onSuccess: () => {
      toast.success("Collaborator removed");
      queryClient.invalidateQueries({ queryKey: ["collaborators", projectId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove collaborator");
    },
  });

  return (
    <div className="p-4 space-y-4">
      {/* Invite button */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Collaborator
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Send an email invitation to collaborate on this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as CollaborationRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor - Can edit project</SelectItem>
                  <SelectItem value="viewer">Viewer - Can view only</SelectItem>
                  <SelectItem value="commenter">Commenter - Can comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Personal message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Join me on this project..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!email || inviteMutation.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Collaborators list */}
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card"
          >
            <div className="flex-1">
              <div className="font-medium">
                {collaborator.invited_email}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {collaborator.role}
                </Badge>
                {collaborator.invitation_status === "pending" && (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                )}
                {collaborator.invitation_status === "accepted" && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMutation.mutate(collaborator.id)}
              disabled={removeMutation.isPending}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        {collaborators.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No collaborators yet. Invite someone to get started!
          </div>
        )}
      </div>
    </div>
  );
};

// Share Links Tab
const ShareLinksTab: React.FC<{
  projectId: string;
  shareLinks: any[];
}> = ({ projectId, shareLinks }) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [linkType, setLinkType] = useState<ShareLinkType>("public");
  const [accessLevel, setAccessLevel] = useState<ShareLinkAccess>("view");
  const [linkName, setLinkName] = useState("");
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      collaborationService.createShareLink({
        projectId,
        linkType,
        accessLevel,
        name: linkName,
      }),
    onSuccess: (data) => {
      toast.success("Share link created");
      queryClient.invalidateQueries({ queryKey: ["shareLinks", projectId] });
      setCreateDialogOpen(false);
      setLinkName("");

      // Copy to clipboard
      navigator.clipboard.writeText(data.shareUrl);
      toast.info("Link copied to clipboard!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create share link");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (linkId: string) =>
      collaborationService.revokeShareLink(linkId),
    onSuccess: () => {
      toast.success("Share link revoked");
      queryClient.invalidateQueries({ queryKey: ["shareLinks", projectId] });
    },
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="p-4 space-y-4">
      {/* Create link button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Link2 className="w-4 h-4 mr-2" />
            Create Share Link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Share Link</DialogTitle>
            <DialogDescription>
              Generate a shareable link for this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkName">Name (optional)</Label>
              <Input
                id="linkName"
                placeholder="Client Review Link"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="linkType">Link Type</Label>
              <Select value={linkType} onValueChange={(v) => setLinkType(v as ShareLinkType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Anyone with link</SelectItem>
                  <SelectItem value="private">Private - Restricted access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="accessLevel">Access Level</Label>
              <Select value={accessLevel} onValueChange={(v) => setAccessLevel(v as ShareLinkAccess)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">View & Comment</SelectItem>
                  <SelectItem value="edit">View & Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share links list */}
      <div className="space-y-2">
        {shareLinks.map((link) => (
          <div
            key={link.id}
            className="p-3 rounded-lg border bg-card space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {link.name || "Untitled Link"}
                <Badge variant="secondary" className="text-xs">
                  {link.link_type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {link.access_level === "view" && <Eye className="w-3 h-3 mr-1" />}
                  {link.access_level === "comment" && <MessageSquare className="w-3 h-3 mr-1" />}
                  {link.access_level === "edit" && <Edit className="w-3 h-3 mr-1" />}
                  {link.access_level}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyLink(link.token)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => revokeMutation.mutate(link.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Used {link.current_uses} times
              {link.max_uses && ` • Max ${link.max_uses} uses`}
            </div>
          </div>
        ))}
        {shareLinks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No share links yet. Create one to share your project!
          </div>
        )}
      </div>
    </div>
  );
};

// Activity Tab
const ActivityTab: React.FC<{
  activities: any[];
  activeSessions: any[];
}> = ({ activities, activeSessions }) => {
  return (
    <div className="p-4 space-y-4">
      {/* Active users */}
      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Currently Active</h3>
          <div className="space-y-2">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-2 p-2 rounded bg-muted/50"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: session.cursor_color }}
                />
                <span className="text-sm">{session.display_name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {session.current_page || "Unknown page"}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
        </div>
      )}

      {/* Activity feed */}
      <div>
        <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
        <div className="space-y-2">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
            >
              <Activity className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1 text-sm">
                <span className="font-medium">{activity.actor_name}</span>
                <span className="text-muted-foreground"> {activity.action.replace(/_/g, " ")}</span>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
