import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useWallet } from "./WalletContext";
import { formatFiveDee, PayoutActionType } from "@/lib/fiveDeeToken";

export interface PayoutNotification {
  id: string;
  type: "payout";
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
  view: "view",
  like: "like",
  comment: "comment",
  share: "share",
  bookmark: "bookmark",
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [notifications, setNotifications] = useState<PayoutNotification[]>([]);

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

  // Subscribe to real-time engagement_payouts inserts
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
          filter: `creator_wallet=eq.${address}`,
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
          };

          // Only notify for confirmed payouts
          if (payout.status !== "confirmed") return;

          const newNotification: PayoutNotification = {
            id: payout.id,
            type: "payout",
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
          toast.success(
            `${emoji} +${formatFiveDee(payout.amount)} earned!`,
            {
              description: `Someone ${label}d your ${payout.content_type}`,
              duration: 4000,
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [address]);

  // Calculate derived values
  const unreadCount = notifications.filter((n) => !n.read).length;

  const totalEarnings = notifications.reduce((sum, n) => sum + n.amount, 0);

  const earningsByType = notifications.reduce(
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
