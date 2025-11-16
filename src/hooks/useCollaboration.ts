// ============================================================================
// HOOKS: Supabase Realtime Collaboration (Broadcast + Presence)
// PURPOSE: Real-time multiplayer features with cursors and presence
// ============================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type {
  CursorPosition,
  PresenceState,
  BroadcastEvent,
  CollaborationSession,
  ActivityAction,
  ProjectComment,
} from "@/types/collaboration";
import { collaborationService } from "@/services/collaborationService";

interface UseRealtimeCollaborationOptions {
  projectId: string;
  currentPage: string;
  enabled?: boolean;
  onUserJoined?: (session: CollaborationSession) => void;
  onUserLeft?: (sessionId: string) => void;
  onCursorMove?: (cursor: CursorPosition) => void;
}

export function useRealtimeCollaboration({
  projectId,
  currentPage,
  enabled = true,
  onUserJoined,
  onUserLeft,
  onCursorMove,
}: UseRealtimeCollaborationOptions) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceState>>({});
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({});
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sessionRef = useRef<CollaborationSession | null>(null);
  const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);
  const cursorTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Initialize session and channel
  useEffect(() => {
    if (!enabled || !projectId) return;

    let isMounted = true;
    let channelInstance: RealtimeChannel | null = null;

    const initialize = async () => {
      try {
        // Create session
        const newSession = await collaborationService.createSession(
          projectId,
          currentPage
        );

        if (!isMounted) return;

        setSession(newSession);
        sessionRef.current = newSession;

        // Join realtime channel
        const channelName = `project:${projectId}`;
        channelInstance = supabase.channel(channelName, {
          config: {
            broadcast: { self: true },
            presence: { key: newSession.id },
          },
        });

        // Track presence
        channelInstance
          .on("presence", { event: "sync" }, () => {
            const state = channelInstance!.presenceState();
            const users: Record<string, PresenceState> = {};

            Object.keys(state).forEach((key) => {
              const presences = state[key] as any[];
              if (presences.length > 0) {
                users[key] = presences[0];
              }
            });

            if (isMounted) {
              setOnlineUsers(users);
            }
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            console.log("User joined:", key, newPresences);
            if (onUserJoined && newPresences[0]) {
              onUserJoined(newPresences[0] as any);
            }
          })
          .on("presence", { event: "leave" }, ({ key }) => {
            console.log("User left:", key);
            if (onUserLeft) {
              onUserLeft(key);
            }
          });

        // Listen for cursor broadcasts
        channelInstance.on(
          "broadcast",
          { event: "cursor" },
          ({ payload }: { payload: CursorPosition }) => {
            if (isMounted && payload.sessionId !== newSession.id) {
              setCursors((prev) => ({
                ...prev,
                [payload.sessionId]: payload,
              }));

              if (onCursorMove) {
                onCursorMove(payload);
              }

              // Clear existing timeout for this cursor
              const existingTimeout = cursorTimeouts.current.get(payload.sessionId);
              if (existingTimeout) {
                clearTimeout(existingTimeout);
              }

              // Remove stale cursors after 3 seconds
              const timeout = setTimeout(() => {
                setCursors((prev) => {
                  const { [payload.sessionId]: _, ...rest } = prev;
                  return rest;
                });
                cursorTimeouts.current.delete(payload.sessionId);
              }, 3000);

              cursorTimeouts.current.set(payload.sessionId, timeout);
            }
          }
        );

        // Listen for selection broadcasts
        channelInstance.on(
          "broadcast",
          { event: "selection" },
          ({ payload }) => {
            console.log("Selection updated:", payload);
          }
        );

        // Listen for typing broadcasts
        channelInstance.on(
          "broadcast",
          { event: "typing" },
          ({ payload }) => {
            console.log("Typing state:", payload);
          }
        );

        // Subscribe
        await channelInstance.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            // Send initial presence
            await channelInstance!.track({
              sessionId: newSession.id,
              displayName: newSession.display_name,
              cursorColor: newSession.cursor_color,
              currentPage,
              timestamp: Date.now(),
            });

            if (isMounted) {
              setIsConnected(true);
            }

            console.log("✅ Realtime collaboration connected");
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Realtime channel error");
            if (isMounted) {
              setIsConnected(false);
            }
          }
        });

        if (isMounted) {
          setChannel(channelInstance);
        }

        // Heartbeat to keep session active
        heartbeatInterval.current = setInterval(() => {
          if (sessionRef.current) {
            collaborationService.updateSessionActivity(sessionRef.current.id);
          }
        }, 30000); // Every 30 seconds

      } catch (error) {
        console.error("Failed to initialize realtime collaboration:", error);
      }
    };

    initialize();

    return () => {
      isMounted = false;

      // Clear all cursor timeouts
      cursorTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      cursorTimeouts.current.clear();

      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }

      if (channelInstance) {
        channelInstance.unsubscribe();
      }

      if (sessionRef.current) {
        collaborationService.endSession(sessionRef.current.id).catch(console.error);
      }

      setIsConnected(false);
    };
  }, [projectId, currentPage, enabled]);

  // Update current page when it changes
  useEffect(() => {
    if (session && channel && isConnected) {
      collaborationService.updateSessionPage(session.id, currentPage);
      channel.track({
        sessionId: session.id,
        displayName: session.display_name,
        cursorColor: session.cursor_color,
        currentPage,
        timestamp: Date.now(),
      });
    }
  }, [currentPage, session, channel, isConnected]);

  // Broadcast cursor position (throttled)
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      if (!channel || !session || !isConnected) return;

      const cursorData: CursorPosition = {
        sessionId: session.id,
        userId: session.user_id,
        anonymousId: session.anonymous_id,
        displayName: session.display_name,
        cursorColor: session.cursor_color,
        x,
        y,
        page: currentPage,
        timestamp: Date.now(),
      };

      channel.send({
        type: "broadcast",
        event: "cursor",
        payload: cursorData,
      });
    },
    [channel, session, currentPage, isConnected]
  );

  // Broadcast selection
  const broadcastSelection = useCallback(
    (selectedElements: string[]) => {
      if (!channel || !session || !isConnected) return;

      channel.send({
        type: "broadcast",
        event: "selection",
        payload: {
          sessionId: session.id,
          selectedElements,
        },
      });
    },
    [channel, session, isConnected]
  );

  // Broadcast typing indicator
  const broadcastTyping = useCallback(
    (isTyping: boolean, fieldId: string) => {
      if (!channel || !session || !isConnected) return;

      channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          sessionId: session.id,
          isTyping,
          fieldId,
        },
      });
    },
    [channel, session, isConnected]
  );

  // Update presence state
  const updatePresence = useCallback(
    async (state: Partial<PresenceState>) => {
      if (!channel || !session || !isConnected) return;

      await channel.track({
        sessionId: session.id,
        displayName: session.display_name,
        cursorColor: session.cursor_color,
        currentPage,
        ...state,
        timestamp: Date.now(),
      });
    },
    [channel, session, currentPage, isConnected]
  );

  return {
    channel,
    session,
    onlineUsers,
    cursors,
    isConnected,
    broadcastCursor,
    broadcastSelection,
    broadcastTyping,
    updatePresence,
  };
}

// Hook for activity feed subscription
export function useActivityFeed(projectId: string) {
  const [activities, setActivities] = useState<ActivityAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    // Initial load
    collaborationService
      .getActivity(projectId)
      .then((data) => {
        if (isMounted) {
          setActivities(data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load activity:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Subscribe to new activities
    const channel = supabase
      .channel(`activity:${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "project_activity",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (isMounted) {
            setActivities((prev) => [payload.new as ActivityAction, ...prev].slice(0, 50));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [projectId]);

  return { activities, isLoading };
}

// Hook for comments subscription
export function useComments(projectId: string, targetType?: string, targetId?: string) {
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    // Initial load
    collaborationService
      .listComments(projectId, targetType, targetId)
      .then((data) => {
        if (isMounted) {
          setComments(data);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Failed to load comments:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Subscribe to comment changes
    const channel = supabase
      .channel(`comments:${projectId}${targetType ? `:${targetType}` : ""}${targetId ? `:${targetId}` : ""}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_comments",
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === "INSERT") {
            const newComment = payload.new as ProjectComment;
            // Filter by target if specified
            if (targetType && newComment.target_type !== targetType) return;
            if (targetId && newComment.target_id !== targetId) return;
            setComments((prev) => [...prev, newComment]);
          } else if (payload.eventType === "UPDATE") {
            setComments((prev) =>
              prev.map((c) =>
                c.id === (payload.new as ProjectComment).id
                  ? (payload.new as ProjectComment)
                  : c
              )
            );
          } else if (payload.eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [projectId, targetType, targetId]);

  const unresolvedCount = comments.filter(
    (c) => !c.is_resolved && !c.deleted_at
  ).length;

  return { comments, unresolvedCount, isLoading };
}

// Hook for active sessions
export function useActiveSessions(projectId: string) {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);

  useEffect(() => {
    if (!projectId) return;

    let isMounted = true;

    const loadSessions = async () => {
      try {
        const data = await collaborationService.listActiveSessions(projectId);
        if (isMounted) {
          setSessions(data);
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadSessions();

    // Refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [projectId]);

  return sessions;
}
