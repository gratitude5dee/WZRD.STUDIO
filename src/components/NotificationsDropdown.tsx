import { Bell, Heart, Eye, MessageCircle, Share2, Bookmark, Clock, CheckCheck, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, PayoutNotification } from "@/contexts/NotificationContext";
import { formatFiveDee, PayoutActionType } from "@/lib/fiveDeeToken";
import { formatDistanceToNow } from "date-fns";

const getNotificationIcon = (actionType: PayoutActionType) => {
  switch (actionType) {
    case "view":
      return <Eye className="h-4 w-4" />;
    case "like":
      return <Heart className="h-4 w-4" />;
    case "comment":
      return <MessageCircle className="h-4 w-4" />;
    case "share":
      return <Share2 className="h-4 w-4" />;
    case "bookmark":
      return <Bookmark className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (actionType: PayoutActionType) => {
  switch (actionType) {
    case "view":
      return "bg-blue-500/20 text-blue-400";
    case "like":
      return "bg-pink-500/20 text-pink-400";
    case "comment":
      return "bg-purple-500/20 text-purple-400";
    case "share":
      return "bg-cyan-500/20 text-cyan-400";
    case "bookmark":
      return "bg-amber-500/20 text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getActionLabel = (actionType: PayoutActionType) => {
  switch (actionType) {
    case "view":
      return "viewed";
    case "like":
      return "liked";
    case "comment":
      return "commented on";
    case "share":
      return "shared";
    case "bookmark":
      return "bookmarked";
    default:
      return "interacted with";
  }
};

export function NotificationsDropdown() {
  const { notifications, unreadCount, totalEarnings, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-card border border-border shadow-xl"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between py-3">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">Earnings</span>
            {totalEarnings > 0 && (
              <span className="text-xs text-primary font-medium">
                Total: {formatFiveDee(totalEarnings)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        
        {/* Action buttons */}
        {notifications.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-2 pb-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    markAllAsRead();
                  }}
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  clearNotifications();
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No earnings yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Engage with content to earn $5DEE
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary/50"
                onClick={() => markAsRead(notification.id)}
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(
                    notification.actionType
                  )}`}
                >
                  {getNotificationIcon(notification.actionType)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${notification.read ? "text-muted-foreground" : "text-foreground"}`}>
                      +{formatFiveDee(notification.amount)}
                    </p>
                    {!notification.read && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    Someone {getActionLabel(notification.actionType)} your {notification.contentType}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3 text-center">
              <p className="text-xs text-muted-foreground">
                Powered by $5DEE on ApeChain
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
