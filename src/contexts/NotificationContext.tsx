import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWallet } from "./WalletContext";
import { formatFiveDee, PayoutActionType } from "@/lib/fiveDeeToken";

export interface PayoutNotification {
  id: string;
  type: "payout";
  isCreator: boolean; // true = earned (creator), false = spent (payer)
  actionType: PayoutActionType;
  contentType: string;
  contentId: string;
  amount: number;
  txHash: string | null;
  createdAt: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: PayoutNotification[];
  unreadCount: number;
  totalEarnings: number;
  earningsByType: Record<PayoutActionType, number>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = "payout_notifications";
const MAX_NOTIFICATIONS = 50;

const actionEmojis: Record<PayoutActionType, string> = {
  view: "👁️",
  like: "❤️",
  comment: "💬",
  share: "🔗",
  bookmark: "🔖",
};

const actionLabels: Record<PayoutActionType, string> = {
  view: "viewed",
  like: "liked",
  comment: "commented on",
  share: "shared",
  bookmark: "bookmarked",
};

// Helper to merge and dedupe notifications
function mergeAndDedupe(
  existing: PayoutNotification[],
  newItems: PayoutNotification[]
): PayoutNotification[] {
  const map = new Map<string, PayoutNotification>();
  
  // Add existing first (so new items can override read status)
  for (const n of existing) {
    map.set(n.id, n);
  }
  
  // Add new items, preserving read status if already exists
  for (const n of newItems) {
    const existingItem = map.get(n.id);
    if (existingItem) {
      // Keep the read status from existing
      map.set(n.id, { ...n, read: existingItem.read });
    } else {
      map.set(n.id, n);
    }
  }
  
  // Sort by date descending and limit
  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_NOTIFICATIONS);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [notifications, setNotifications] = useState<PayoutNotification[]>([]);
  const initialFetchDone = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      } catch (e) {
        console.error("Failed to parse stored notifications:", e);
      }
    }
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  // Fetch initial payouts from database on mount
  useEffect(() => {
    if (!address || initialFetchDone.current) return;

    const fetchInitialPayouts = async () => {
      try {
        const { data, error } = await supabase
          .from("engagement_payouts")
          .select("*")
          .or(`creator_wallet.eq.${address},payer_wallet.eq.${address}`)
          .order("created_at", { ascending: false })
          .limit(MAX_NOTIFICATIONS);

        if (error) {
          console.error("Error fetching initial payouts:", error);
          return;
        }

        if (data && data.length > 0) {
          const mapped: PayoutNotification[] = data.map((payout: any) => ({
            id: payout.id,
            type: "payout" as const,
            isCreator: payout.creator_wallet.toLowerCase() === address.toLowerCase(),
            actionType: payout.action_type as PayoutActionType,
            contentType: payout.content_type,
            contentId: payout.content_id,
            amount: payout.amount,
            txHash: payout.tx_hash,
            createdAt: payout.created_at,
            read: true, // Mark initial fetch as read to avoid overwhelming user
          }));

          setNotifications((prev) => mergeAndDedupe(prev, mapped));
        }
        
        initialFetchDone.current = true;
      } catch (error) {
        console.error("Error in fetchInitialPayouts:", error);
      }
    };

    fetchInitialPayouts();
  }, [address]);

  // Subscribe to real-time engagement_payouts inserts (no filter - filter client-side)
  useEffect(() => {
    if (!address) return;

    const channel = supabase
      .channel("payout-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "engagement_payouts",
        },
        (payload) => {
          const payout = payload.new as {
            id: string;
            action_type: PayoutActionType;
            content_type: string;
            content_id: string;
            amount: number;
            tx_hash: string | null;
            created_at: string;
            status: string;
            creator_wallet: string;
            payer_wallet: string;
          };

          // Only notify for confirmed payouts
          if (payout.status !== "confirmed") return;

          // Check if this payout is relevant to current user
          const isCreator = payout.creator_wallet.toLowerCase() === address.toLowerCase();
          const isPayer = payout.payer_wallet.toLowerCase() === address.toLowerCase();

          if (!isCreator && !isPayer) return; // Not relevant

          const newNotification: PayoutNotification = {
            id: payout.id,
            type: "payout",
            isCreator,
            actionType: payout.action_type,
            contentType: payout.content_type,
            contentId: payout.content_id,
            amount: payout.amount,
            txHash: payout.tx_hash,
            createdAt: payout.created_at,
            read: false,
          };

          // Add to notifications, limit to max
          setNotifications((prev) => {
            const updated = [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS);
            return updated;
          });

          // Show toast notification
          const emoji = actionEmojis[payout.action_type];
          const label = actionLabels[payout.action_type];

          if (isCreator) {
            // You earned money!
            toast.success(
              `${emoji} +${formatFiveDee(payout.amount)} earned!`,
              {
                description: `Someone ${label} your ${payout.content_type}`,
                duration: 4000,
              }
            );
          } else {
            // You engaged with content (payer)
            toast.success(
              `${emoji} ${label.charAt(0).toUpperCase() + label.slice(1)}!`,
              {
                description: `Creator earned ${formatFiveDee(payout.amount)}`,
                duration: 3000,
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  // Calculate derived values - only count creator earnings
  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalEarnings = notifications
    .filter((n) => n.isCreator)
    .reduce((sum, n) => sum + n.amount, 0);

  const earningsByType = notifications
    .filter((n) => n.isCreator)
    .reduce(
      (acc, n) => {
        acc[n.actionType] = (acc[n.actionType] || 0) + n.amount;
        return acc;
      },
      { view: 0, like: 0, comment: 0, share: 0, bookmark: 0 } as Record<PayoutActionType, number>
    );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        totalEarnings,
        earningsByType,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
