// ============================================================================
// SERVICE: Collaboration Management
// PURPOSE: API client for collaboration features
// ============================================================================

import { supabase } from "@/integrations/supabase/client";
import type {
  ProjectCollaborator,
  ProjectShareLink,
  CollaborationSession,
  ActivityAction,
  ProjectComment,
  CollaborationRole,
  ShareLinkType,
  ShareLinkAccess,
  InviteCollaboratorRequest,
  InviteCollaboratorResponse,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  CreateShareLinkRequest,
  CreateShareLinkResponse,
  AccessShareLinkRequest,
  AccessShareLinkResponse,
} from "@/types/collaboration";

export const collaborationService = {
  // ========== COLLABORATORS ==========

  async inviteCollaborator(
    projectId: string,
    email: string,
    role: CollaborationRole,
    message?: string
  ): Promise<InviteCollaboratorResponse> {
    const { data, error } = await supabase.functions.invoke("invite-collaborator", {
      body: { projectId, email, role, message } as InviteCollaboratorRequest,
    });

    if (error) throw new Error(error.message || "Failed to invite collaborator");
    return data as InviteCollaboratorResponse;
  },

  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const { data, error } = await supabase.functions.invoke("accept-invitation", {
      body: { token } as AcceptInvitationRequest,
    });

    if (error) throw new Error(error.message || "Failed to accept invitation");
    return data as AcceptInvitationResponse;
  },

  async listCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    const { data, error } = await supabase
      .from("project_collaborators")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message || "Failed to list collaborators");
    return data || [];
  },

  async updateCollaboratorRole(
    collaboratorId: string,
    role: CollaborationRole,
    permissions?: any
  ): Promise<ProjectCollaborator> {
    const { data, error } = await supabase
      .from("project_collaborators")
      .update({ role, permissions })
      .eq("id", collaboratorId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to update collaborator role");
    return data;
  },

  async removeCollaborator(collaboratorId: string): Promise<void> {
    const { error } = await supabase
      .from("project_collaborators")
      .update({ is_active: false, invitation_status: "revoked" })
      .eq("id", collaboratorId);

    if (error) throw new Error(error.message || "Failed to remove collaborator");
  },

  async getCollaboratorByEmail(
    projectId: string,
    email: string
  ): Promise<ProjectCollaborator | null> {
    const { data, error } = await supabase
      .from("project_collaborators")
      .select("*")
      .eq("project_id", projectId)
      .eq("invited_email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(error.message || "Failed to get collaborator");
    }
    return data;
  },

  // ========== SHARE LINKS ==========

  async createShareLink(config: CreateShareLinkRequest): Promise<CreateShareLinkResponse> {
    const { data, error } = await supabase.functions.invoke("create-share-link", {
      body: config,
    });

    if (error) throw new Error(error.message || "Failed to create share link");
    return data as CreateShareLinkResponse;
  },

  async accessShareLink(
    token: string,
    password?: string,
    displayName?: string
  ): Promise<AccessShareLinkResponse> {
    const { data, error } = await supabase.functions.invoke("access-share-link", {
      body: { token, password, displayName } as AccessShareLinkRequest,
    });

    if (error) throw new Error(error.message || "Failed to access share link");
    return data as AccessShareLinkResponse;
  },

  async listShareLinks(projectId: string): Promise<ProjectShareLink[]> {
    const { data, error } = await supabase
      .from("project_share_links")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message || "Failed to list share links");
    return data || [];
  },

  async revokeShareLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from("project_share_links")
      .update({ is_active: false })
      .eq("id", linkId);

    if (error) throw new Error(error.message || "Failed to revoke share link");
  },

  async getShareLinkByToken(token: string): Promise<ProjectShareLink | null> {
    const { data, error } = await supabase
      .from("project_share_links")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(error.message || "Failed to get share link");
    }
    return data;
  },

  // ========== SESSIONS ==========

  async createSession(
    projectId: string,
    page: string
  ): Promise<CollaborationSession> {
    const { data: user } = await supabase.auth.getUser();

    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E2",
    ];
    const cursorColor = colors[Math.floor(Math.random() * colors.length)];

    const { data, error } = await supabase
      .from("collaboration_sessions")
      .insert({
        project_id: projectId,
        user_id: user.user?.id,
        session_token: crypto.randomUUID(),
        channel_name: `project:${projectId}`,
        display_name: user.user?.email?.split("@")[0] || "Anonymous",
        cursor_color: cursorColor,
        current_page: page,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to create session");
    return data;
  },

  async updateSessionActivity(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("collaboration_sessions")
      .update({ last_activity_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) console.error("Failed to update session activity:", error);
  },

  async updateSessionPage(sessionId: string, page: string): Promise<void> {
    const { error } = await supabase
      .from("collaboration_sessions")
      .update({ current_page: page })
      .eq("id", sessionId);

    if (error) console.error("Failed to update session page:", error);
  },

  async endSession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from("collaboration_sessions")
      .update({
        is_active: false,
        ended_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) throw new Error(error.message || "Failed to end session");
  },

  async listActiveSessions(projectId: string): Promise<CollaborationSession[]> {
    const { data, error } = await supabase
      .from("collaboration_sessions")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .gt("last_activity_at", new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Active in last 5 min

    if (error) throw new Error(error.message || "Failed to list active sessions");
    return data || [];
  },

  // ========== ACTIVITY FEED ==========

  async logActivity(
    projectId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from("project_activity").insert({
      project_id: projectId,
      user_id: user.user?.id,
      actor_name: user.user?.email?.split("@")[0] || "Anonymous",
      action,
      action_metadata: metadata || {},
    });

    if (error) console.error("Failed to log activity:", error);
  },

  async getActivity(projectId: string, limit = 50): Promise<ActivityAction[]> {
    const { data, error } = await supabase
      .from("project_activity")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message || "Failed to get activity");
    return data || [];
  },

  // ========== COMMENTS ==========

  async addComment(
    projectId: string,
    content: string,
    targetType?: string,
    targetId?: string,
    parentCommentId?: string
  ): Promise<ProjectComment> {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("project_comments")
      .insert({
        project_id: projectId,
        user_id: user.user?.id,
        author_name: user.user?.email?.split("@")[0] || "Anonymous",
        content,
        target_type: targetType,
        target_id: targetId,
        parent_comment_id: parentCommentId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to add comment");
    return data;
  },

  async listComments(
    projectId: string,
    targetType?: string,
    targetId?: string
  ): Promise<ProjectComment[]> {
    let query = supabase
      .from("project_comments")
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null);

    if (targetType) query = query.eq("target_type", targetType);
    if (targetId) query = query.eq("target_id", targetId);

    const { data, error } = await query.order("created_at", { ascending: true });

    if (error) throw new Error(error.message || "Failed to list comments");
    return data || [];
  },

  async updateComment(commentId: string, content: string): Promise<ProjectComment> {
    const { data, error } = await supabase
      .from("project_comments")
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to update comment");
    return data;
  },

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from("project_comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) throw new Error(error.message || "Failed to delete comment");
  },

  async resolveComment(commentId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("project_comments")
      .update({
        is_resolved: true,
        resolved_by: user.user?.id,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    if (error) throw new Error(error.message || "Failed to resolve comment");
  },

  async unresolveComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from("project_comments")
      .update({
        is_resolved: false,
        resolved_by: null,
        resolved_at: null,
      })
      .eq("id", commentId);

    if (error) throw new Error(error.message || "Failed to unresolve comment");
  },

  async addReaction(commentId: string, emoji: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Get current reactions
    const { data: comment } = await supabase
      .from("project_comments")
      .select("reactions")
      .eq("id", commentId)
      .single();

    if (!comment) return;

    const reactions = comment.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (!reactions[emoji].includes(user.user.id)) {
      reactions[emoji].push(user.user.id);
    }

    const { error } = await supabase
      .from("project_comments")
      .update({ reactions })
      .eq("id", commentId);

    if (error) console.error("Failed to add reaction:", error);
  },

  async removeReaction(commentId: string, emoji: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    // Get current reactions
    const { data: comment } = await supabase
      .from("project_comments")
      .select("reactions")
      .eq("id", commentId)
      .single();

    if (!comment) return;

    const reactions = comment.reactions || {};
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== user.user!.id);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }

    const { error } = await supabase
      .from("project_comments")
      .update({ reactions })
      .eq("id", commentId);

    if (error) console.error("Failed to remove reaction:", error);
  },

  // ========== PERMISSIONS ==========

  async getUserPermissions(projectId: string): Promise<any> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    // Check if owner
    const { data: project } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (project?.user_id === user.user.id) {
      return {
        canEdit: true,
        canComment: true,
        canShare: true,
        canExport: true,
        canManageCollaborators: true,
        canDeleteProject: true,
        canEditSettings: true,
        canViewHistory: true,
      };
    }

    // Check collaborator permissions
    const { data: collaborator } = await supabase
      .from("project_collaborators")
      .select("permissions")
      .eq("project_id", projectId)
      .eq("user_id", user.user.id)
      .eq("is_active", true)
      .eq("invitation_status", "accepted")
      .single();

    return collaborator?.permissions || null;
  },
};
