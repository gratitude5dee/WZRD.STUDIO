// ============================================================================
// TYPE DEFINITIONS: Real-Time Collaboration
// PURPOSE: Complete type system for multiplayer collaboration features
// ============================================================================

export type CollaborationRole = "owner" | "editor" | "viewer" | "commenter";
export type InvitationStatus = "pending" | "accepted" | "declined" | "revoked";
export type ShareLinkType = "private" | "public";
export type ShareLinkAccess = "view" | "comment" | "edit";

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canShare: boolean;
  canExport: boolean;
  canManageCollaborators: boolean;
  canDeleteProject: boolean;
  canEditSettings: boolean;
  canViewHistory: boolean;
  specificPages?: string[];
}

export interface ProjectCollaborator {
  id: string;
  project_id: string;
  user_id: string | null;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
  invited_by: string | null;
  invited_email: string | null;
  invitation_status: InvitationStatus;
  invitation_token: string | null;
  invitation_expires_at: string | null;
  is_active: boolean;
  last_accessed_at: string | null;
  access_count: number;
  invitation_metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
}

export interface ProjectShareLink {
  id: string;
  project_id: string;
  created_by: string;
  link_type: ShareLinkType;
  access_level: ShareLinkAccess;
  token: string;
  name: string | null;
  description: string | null;
  is_active: boolean;
  requires_password: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  allowed_domains: string[] | null;
  custom_permissions: CollaborationPermissions | null;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CollaborationSession {
  id: string;
  project_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  session_token: string;
  channel_name: string;
  display_name: string;
  avatar_url: string | null;
  cursor_color: string;
  is_active: boolean;
  current_page: string | null;
  last_activity_at: string;
  presence_state: PresenceState;
  created_at: string;
  updated_at: string;
  ended_at: string | null;
}

export interface PresenceState {
  cursorPosition?: { x: number; y: number };
  selectedElements?: string[];
  viewport?: { x: number; y: number; zoom: number };
  isTyping?: boolean;
  focusedField?: string;
  currentPage?: string;
}

export interface CursorPosition {
  sessionId: string;
  userId: string | null;
  anonymousId: string | null;
  displayName: string;
  cursorColor: string;
  x: number;
  y: number;
  page: string;
  timestamp: number;
}

export type ActivityActionType =
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'collaborator_added'
  | 'collaborator_removed'
  | 'role_changed'
  | 'share_link_created'
  | 'share_link_revoked'
  | 'asset_uploaded'
  | 'asset_deleted'
  | 'node_created'
  | 'node_updated'
  | 'node_deleted'
  | 'node_connected'
  | 'clip_added'
  | 'clip_updated'
  | 'clip_deleted'
  | 'canvas_updated'
  | 'comment_added'
  | 'user_joined'
  | 'user_left';

export interface ActivityAction {
  id: string;
  project_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  actor_name: string;
  actor_avatar: string | null;
  action: ActivityActionType;
  action_target: string | null;
  action_target_id: string | null;
  action_metadata: Record<string, any>;
  session_id: string | null;
  page_context: string | null;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string | null;
  anonymous_id: string | null;
  author_name: string;
  author_avatar: string | null;
  content: string;
  content_html: string | null;
  comment_type: string;
  target_type: string | null;
  target_id: string | null;
  target_metadata: Record<string, any> | null;
  parent_comment_id: string | null;
  thread_depth: number;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  reactions: Record<string, string[]>;
  mentioned_user_ids: string[] | null;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AnonymousUser {
  id: string;
  display_name: string;
  avatar_seed: string;
  cursor_color: string;
  first_seen_at: string;
  last_seen_at: string;
  session_count: number;
  first_share_link_id: string | null;
  user_agent: string | null;
  ip_address: string | null;
}

// Realtime broadcast events
export interface BroadcastCursorEvent {
  type: "cursor";
  payload: CursorPosition;
}

export interface BroadcastSelectionEvent {
  type: "selection";
  payload: {
    sessionId: string;
    selectedElements: string[];
  };
}

export interface BroadcastTypingEvent {
  type: "typing";
  payload: {
    sessionId: string;
    isTyping: boolean;
    fieldId: string;
  };
}

export interface BroadcastViewportEvent {
  type: "viewport";
  payload: {
    sessionId: string;
    viewport: { x: number; y: number; zoom: number };
  };
}

export type BroadcastEvent =
  | BroadcastCursorEvent
  | BroadcastSelectionEvent
  | BroadcastTypingEvent
  | BroadcastViewportEvent;

// Request/Response types for API calls
export interface InviteCollaboratorRequest {
  projectId: string;
  email: string;
  role: CollaborationRole;
  message?: string;
  customPermissions?: Partial<CollaborationPermissions>;
}

export interface InviteCollaboratorResponse {
  success: boolean;
  invitation: {
    id: string;
    email: string;
    role: CollaborationRole;
    expiresAt: string;
  };
  inviteUrl: string;
}

export interface AcceptInvitationRequest {
  token: string;
}

export interface AcceptInvitationResponse {
  success: boolean;
  project: any;
  role: CollaborationRole;
  permissions: CollaborationPermissions;
}

export interface CreateShareLinkRequest {
  projectId: string;
  linkType: ShareLinkType;
  accessLevel: ShareLinkAccess;
  name?: string;
  description?: string;
  password?: string;
  expiresInDays?: number;
  maxUses?: number;
  allowedDomains?: string[];
  customPermissions?: Partial<CollaborationPermissions>;
}

export interface CreateShareLinkResponse {
  success: boolean;
  shareLink: {
    id: string;
    token: string;
    linkType: ShareLinkType;
    accessLevel: ShareLinkAccess;
    name: string | null;
    description: string | null;
    requiresPassword: boolean;
    expiresAt: string | null;
    maxUses: number | null;
    currentUses: number;
    createdAt: string;
  };
  shareUrl: string;
}

export interface AccessShareLinkRequest {
  token: string;
  password?: string;
  displayName?: string;
}

export interface AccessShareLinkResponse {
  success: boolean;
  session: {
    id: string;
    sessionToken: string;
    channelName: string;
    displayName: string;
    cursorColor: string;
  };
  project: any;
  accessLevel: ShareLinkAccess;
  permissions: CollaborationPermissions | null;
  anonymousId: string | null;
  isAnonymous: boolean;
}

// Zustand store state types
export interface CollaborationState {
  // Current session
  currentSession: CollaborationSession | null;
  isConnected: boolean;

  // Active users
  activeSessions: CollaborationSession[];
  onlineUsers: Record<string, PresenceState>;
  remoteCursors: Record<string, CursorPosition>;

  // Collaborators & permissions
  collaborators: ProjectCollaborator[];
  shareLinks: ProjectShareLink[];
  currentUserPermissions: CollaborationPermissions | null;

  // Activity feed
  activities: ActivityAction[];

  // Comments
  comments: ProjectComment[];
  unresolvedComments: number;

  // Actions
  setCurrentSession: (session: CollaborationSession | null) => void;
  setConnected: (connected: boolean) => void;
  updateActiveSessions: (sessions: CollaborationSession[]) => void;
  updateOnlineUsers: (users: Record<string, PresenceState>) => void;
  updateRemoteCursor: (cursor: CursorPosition) => void;
  removeRemoteCursor: (sessionId: string) => void;
  setCollaborators: (collaborators: ProjectCollaborator[]) => void;
  setShareLinks: (links: ProjectShareLink[]) => void;
  setCurrentUserPermissions: (permissions: CollaborationPermissions | null) => void;
  addActivity: (activity: ActivityAction) => void;
  setActivities: (activities: ActivityAction[]) => void;
  addComment: (comment: ProjectComment) => void;
  updateComment: (commentId: string, updates: Partial<ProjectComment>) => void;
  removeComment: (commentId: string) => void;
  setComments: (comments: ProjectComment[]) => void;
}
