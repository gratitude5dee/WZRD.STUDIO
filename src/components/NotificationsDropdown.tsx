import { Bell, Music, Upload, CreditCard, Play, Disc, Clock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: "upload" | "transaction" | "play" | "system";
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

// Mock notifications data - in production this would come from Supabase
const notifications: Notification[] = [
  {
    id: "1",
    type: "upload",
    title: "New Track Available",
    description: "CryptoBeats just uploaded 'Neon Dreams'",
    time: "2 min ago",
    unread: true,
  },
  {
    id: "2",
    type: "transaction",
    title: "Payment Received",
    description: "You earned 0.005 MONAD from streams",
    time: "15 min ago",
    unread: true,
  },
  {
    id: "3",
    type: "play",
    title: "Song Played",
    description: "Someone played your track 'Diamond Hands'",
    time: "1 hour ago",
    unread: false,
  },
  {
    id: "4",
    type: "upload",
    title: "Album Released",
    description: "New album 'Web3 Vibes' is now live",
    time: "3 hours ago",
    unread: false,
  },
  {
    id: "5",
    type: "transaction",
    title: "Stream Purchased",
    description: "You paid 0.002 MONAD for 'Crypto Love'",
    time: "5 hours ago",
    unread: false,
  },
  {
    id: "6",
    type: "system",
    title: "Welcome to EARTONE",
    description: "Start exploring music on the blockchain",
    time: "1 day ago",
    unread: false,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "upload":
      return <Upload className="h-4 w-4" />;
    case "transaction":
      return <CreditCard className="h-4 w-4" />;
    case "play":
      return <Play className="h-4 w-4" />;
    case "system":
      return <Disc className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: Notification["type"]) => {
  switch (type) {
    case "upload":
      return "bg-primary/20 text-primary";
    case "transaction":
      return "bg-success/20 text-success";
    case "play":
      return "bg-accent/20 text-accent-foreground";
    case "system":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function NotificationsDropdown() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount}
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
          <span className="text-base font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex items-start gap-3 p-3 cursor-pointer focus:bg-secondary/50"
              >
                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${notification.unread ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {notification.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center py-3 text-sm font-medium text-primary hover:text-primary cursor-pointer">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
