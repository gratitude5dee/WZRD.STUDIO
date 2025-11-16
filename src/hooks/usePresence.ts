import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceUser {
  userId: string;
  username: string;
  avatarUrl?: string;
  cursor?: { x: number; y: number };
  lastActive: string;
}

export function usePresence(projectId: string | null) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!projectId || !user) return;

    const presenceChannel = supabase.channel(`presence:${projectId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: Record<string, PresenceUser> = {};
        
        Object.entries(state).forEach(([userId, presences]) => {
          const presence = (presences as any[])[0];
          users[userId] = {
            userId,
            username: presence.username || 'Anonymous',
            avatarUrl: presence.avatarUrl,
            cursor: presence.cursor,
            lastActive: presence.lastActive,
          };
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await presenceChannel.track({
            userId: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            avatarUrl: user.user_metadata?.avatar_url,
            lastActive: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [projectId, user]);

  const updateCursor = async (x: number, y: number) => {
    if (channel && user) {
      await channel.track({
        userId: user.id,
        username: user.email?.split('@')[0] || 'Anonymous',
        cursor: { x, y },
        lastActive: new Date().toISOString(),
      });
    }
  };

  return {
    onlineUsers,
    updateCursor,
  };
}
