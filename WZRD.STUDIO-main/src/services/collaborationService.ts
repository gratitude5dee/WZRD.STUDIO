// ============================================================================
// SERVICE: Collaboration Management (Stubbed)
// PURPOSE: Stubbed version until database tables are created
// ============================================================================

import type {
  ProjectCollaborator,
  ProjectShareLink,
  CollaborationSession,
  ActivityAction,
  ProjectComment,
  CollaborationRole,
  InviteCollaboratorResponse,
  AcceptInvitationResponse,
  CreateShareLinkResponse,
  AccessShareLinkResponse,
} from "@/types/collaboration";

export const collaborationService = {
  // Collaborators
  async inviteCollaborator(...args: any[]): Promise<InviteCollaboratorResponse> {
    console.warn('Collaboration service not yet implemented');
    throw new Error('Not implemented');
  },

  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    console.warn('Collaboration service not yet implemented');
    throw new Error('Not implemented');
  },

  async listCollaborators(projectId: string): Promise<ProjectCollaborator[]> {
    return [];
  },

  async removeCollaborator(...args: any[]): Promise<void> {},

  async updateCollaboratorRole(
    projectId: string,
    collaboratorId: string,
    role: CollaborationRole
  ): Promise<ProjectCollaborator> {
    throw new Error('Not implemented');
  },

  // Share Links
  async createShareLink(...args: any[]): Promise<CreateShareLinkResponse> {
    console.warn('Collaboration service not yet implemented');
    throw new Error('Not implemented');
  },

  async getShareLinks(projectId: string): Promise<ProjectShareLink[]> {
    return [];
  },

  async listShareLinks(projectId: string): Promise<ProjectShareLink[]> {
    return [];
  },

  async revokeShareLink(linkId: string): Promise<void> {},

  async accessShareLink(token: string): Promise<AccessShareLinkResponse> {
    console.warn('Collaboration service not yet implemented');
    throw new Error('Not implemented');
  },

  // Sessions
  async startSession(projectId: string): Promise<CollaborationSession> {
    return {
      id: '',
      project_id: projectId,
      user_id: '',
      display_name: '',
      cursor_color: '#000000',
      current_page: '',
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as CollaborationSession;
  },

  async createSession(...args: any[]): Promise<CollaborationSession> {
    return {
      id: '',
      project_id: args[0] || '',
      user_id: '',
      display_name: '',
      cursor_color: '#000000',
      current_page: '',
      last_activity_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as CollaborationSession;
  },

  async endSession(sessionId: string): Promise<void> {},

  async updateSessionActivity(sessionId: string): Promise<void> {},

  async updateSessionPage(sessionId: string, page: string): Promise<void> {},

  async leaveSession(sessionId: string): Promise<void> {},

  async getActiveSessions(projectId: string): Promise<CollaborationSession[]> {
    return [];
  },

  async listActiveSessions(projectId: string): Promise<CollaborationSession[]> {
    return [];
  },

  // Activity
  async getActivityLog(
    projectId: string,
    limit?: number,
    offset?: number
  ): Promise<ActivityAction[]> {
    return [];
  },

  async getActivity(...args: any[]): Promise<ActivityAction[]> {
    return [];
  },

  // Comments
  async addComment(...args: any[]): Promise<ProjectComment> {
    throw new Error('Not implemented');
  },

  async getComments(projectId: string, targetId?: string): Promise<ProjectComment[]> {
    return [];
  },

  async listComments(...args: any[]): Promise<ProjectComment[]> {
    return [];
  },

  async deleteComment(commentId: string): Promise<void> {},

  async resolveComment(commentId: string): Promise<void> {},
};
