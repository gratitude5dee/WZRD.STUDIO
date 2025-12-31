# 🔌 Collaboration System - Integration Examples

## Quick Start Integration

This guide shows how to integrate the collaboration system into your existing pages.

---

## 📄 Studio Page Integration

```tsx
// src/pages/StudioPage.tsx
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useRealtimeCollaboration } from "@/hooks/useCollaboration";
import { RemoteCursors } from "@/components/collaboration/RemoteCursor";
import { CollaborationPanel } from "@/components/collaboration/CollaborationPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export const StudioPage = () => {
  const { projectId } = useParams();
  const [showCollabPanel, setShowCollabPanel] = useState(false);

  // Initialize collaboration
  const {
    cursors,
    isConnected,
    broadcastCursor,
    onlineUsers,
  } = useRealtimeCollaboration({
    projectId: projectId!,
    currentPage: "studio",
    enabled: !!projectId,
    onUserJoined: (session) => {
      console.log(`${session.display_name} joined the project`);
    },
    onUserLeft: (sessionId) => {
      console.log("User left");
    },
  });

  // Throttled cursor tracking
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isConnected) return;
      broadcastCursor(e.clientX, e.clientY);
    },
    [broadcastCursor, isConnected]
  );

  const onlineCount = Object.keys(onlineUsers).length + 1; // +1 for current user

  return (
    <div onMouseMove={handleMouseMove} className="relative h-screen">
      {/* Your existing Studio content */}
      <main className="flex-1">
        {/* ... existing content ... */}
      </main>

      {/* Remote Cursors Overlay */}
      <RemoteCursors cursors={cursors} currentPage="studio" />

      {/* Collaboration Button */}
      <Sheet open={showCollabPanel} onOpenChange={setShowCollabPanel}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="fixed top-4 right-4 z-50"
          >
            <Users className="w-4 h-4 mr-2" />
            {onlineCount} Online
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-96 p-0">
          <CollaborationPanel projectId={projectId!} />
        </SheetContent>
      </Sheet>

      {/* Connection Status */}
      {isConnected && (
        <div className="fixed bottom-4 left-4 px-3 py-1 bg-green-500/90 text-white text-xs rounded-full backdrop-blur">
          ✓ Live Collaboration Active
        </div>
      )}
    </div>
  );
};
```

---

## 🎨 Editor Page Integration

```tsx
// src/pages/EditorPage.tsx
import { useRealtimeCollaboration } from "@/hooks/useCollaboration";
import { RemoteCursors } from "@/components/collaboration/RemoteCursor";
import { useComments } from "@/hooks/useCollaboration";
import { Badge } from "@/components/ui/badge";

export const EditorPage = () => {
  const { projectId } = useParams();

  // Collaboration
  const { cursors, broadcastCursor, broadcastSelection } = useRealtimeCollaboration({
    projectId: projectId!,
    currentPage: "editor",
  });

  // Comments on specific clips
  const { comments, unresolvedCount } = useComments(projectId!, "clip");

  // Broadcast when user selects clips
  const handleClipSelect = (clipIds: string[]) => {
    broadcastSelection(clipIds);
    // ... your existing selection logic
  };

  return (
    <div onMouseMove={(e) => broadcastCursor(e.clientX, e.clientY)}>
      {/* Timeline with comments indicator */}
      <div className="timeline-header">
        <h2>Timeline</h2>
        {unresolvedCount > 0 && (
          <Badge variant="destructive">{unresolvedCount} unresolved</Badge>
        )}
      </div>

      {/* Your existing editor content */}
      <div className="editor-content">
        {/* ... */}
      </div>

      {/* Remote cursors */}
      <RemoteCursors cursors={cursors} currentPage="editor" />
    </div>
  );
};
```

---

## 🖼️ Kanvas Page Integration

```tsx
// src/pages/KanvasPage.tsx
import { useRealtimeCollaboration } from "@/hooks/useCollaboration";
import { RemoteCursors } from "@/components/collaboration/RemoteCursor";
import { collaborationService } from "@/services/collaborationService";

export const KanvasPage = () => {
  const { projectId } = useParams();

  const {
    cursors,
    broadcastCursor,
    updatePresence,
  } = useRealtimeCollaboration({
    projectId: projectId!,
    currentPage: "kanvas",
  });

  // Update presence when viewport changes
  const handleViewportChange = (viewport: { x: number; y: number; zoom: number }) => {
    updatePresence({ viewport });
  };

  // Log activity when objects are created
  const handleObjectCreated = async (objectType: string, objectId: string) => {
    await collaborationService.logActivity(
      projectId!,
      "canvas_updated",
      { action: "object_created", objectType, objectId }
    );
  };

  return (
    <div onMouseMove={(e) => broadcastCursor(e.clientX, e.clientY)}>
      <canvas
        // ... your canvas setup
        onWheel={(e) => {
          // Update viewport presence
          handleViewportChange({
            x: canvasState.x,
            y: canvasState.y,
            zoom: canvasState.zoom,
          });
        }}
      />

      <RemoteCursors cursors={cursors} currentPage="kanvas" />
    </div>
  );
};
```

---

## 💬 Comments Component Integration

```tsx
// Example: Comments sidebar for any target
import { useState } from "react";
import { useComments } from "@/hooks/useCollaboration";
import { collaborationService } from "@/services/collaborationService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentsProps {
  projectId: string;
  targetType?: string; // 'node' | 'clip' | 'canvas_element'
  targetId?: string;
}

export const Comments: React.FC<CommentsProps> = ({
  projectId,
  targetType,
  targetId,
}) => {
  const { comments, unresolvedCount, isLoading } = useComments(
    projectId,
    targetType,
    targetId
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await collaborationService.addComment(
        projectId,
        newComment,
        targetType,
        targetId
      );
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Comments</h3>
        {unresolvedCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {unresolvedCount} unresolved
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className={`mb-4 p-3 rounded-lg border ${
              comment.is_resolved ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-medium text-sm">{comment.author_name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleString()}
              </div>
            </div>
            <p className="text-sm">{comment.content}</p>
            {!comment.is_resolved && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() =>
                  collaborationService.resolveComment(comment.id)
                }
              >
                Mark Resolved
              </Button>
            )}
          </div>
        ))}
      </ScrollArea>

      <div className="p-4 border-t">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-2"
        />
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
          className="w-full"
        >
          Add Comment
        </Button>
      </div>
    </div>
  );
};
```

---

## 📊 Activity Feed Integration

```tsx
// Example: Activity feed in sidebar
import { useActivityFeed } from "@/hooks/useCollaboration";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "lucide-react";

export const ActivityFeed: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { activities, isLoading } = useActivityFeed(projectId);

  if (isLoading) {
    return <div className="text-center p-4">Loading activity...</div>;
  }

  return (
    <ScrollArea className="h-96">
      <div className="p-4 space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-2 p-2 rounded hover:bg-muted/50"
          >
            <Activity className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">{activity.actor_name}</span>
              <span className="text-muted-foreground">
                {" "}
                {activity.action.replace(/_/g, " ")}
              </span>
              {activity.action_metadata?.nodeName && (
                <span className="font-medium">
                  {" "}
                  "{activity.action_metadata.nodeName}"
                </span>
              )}
              <div className="text-xs text-muted-foreground mt-0.5">
                {new Date(activity.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
```

---

## 🔗 Share Link Access Page

```tsx
// src/pages/ShareLinkAccessPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collaborationService } from "@/services/collaborationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ShareLinkAccessPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAccess = async () => {
    if (!token) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await collaborationService.accessShareLink(
        token,
        password || undefined,
        displayName || undefined
      );

      // Store session info
      sessionStorage.setItem("collaboration_session", JSON.stringify(result.session));
      sessionStorage.setItem("access_level", result.accessLevel);

      // Navigate to project
      navigate(`/studio/${result.project.id}`);
    } catch (err: any) {
      if (err.message.includes("Password required")) {
        setRequiresPassword(true);
      }
      setError(err.message || "Failed to access project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Access Shared Project</h1>
        <p className="text-muted-foreground mb-6">
          You've been invited to collaborate on a project.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Your Name (optional)</Label>
            <Input
              id="displayName"
              placeholder="Anonymous"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {requiresPassword && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleAccess}
            disabled={isLoading || (requiresPassword && !password)}
            className="w-full"
          >
            {isLoading ? "Accessing..." : "Access Project"}
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## 📧 Accept Invitation Page

```tsx
// src/pages/AcceptInvitationPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collaborationService } from "@/services/collaborationService";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export const AcceptInvitationPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) return;

      try {
        const result = await collaborationService.acceptInvitation(token);
        setProjectInfo(result.project);
        setStatus("success");
      } catch (err: any) {
        setError(err.message || "Failed to accept invitation");
        setStatus("error");
      }
    };

    acceptInvitation();
  }, [token]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Accepting invitation...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-card rounded-lg border shadow-lg text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invitation Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg border shadow-lg text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invitation Accepted!</h1>
        <p className="text-muted-foreground mb-6">
          You can now collaborate on{" "}
          <span className="font-semibold">{projectInfo?.title}</span>
        </p>
        <Button onClick={() => navigate(`/studio/${projectInfo?.id}`)}>
          Open Project
        </Button>
      </div>
    </div>
  );
};
```

---

## 🎯 Usage Tips

### 1. **Throttle Cursor Updates**
```tsx
import { throttle } from "lodash-es";

const throttledBroadcast = throttle(broadcastCursor, 50); // 20fps
```

### 2. **Show Typing Indicators**
```tsx
const handleInputChange = (value: string) => {
  broadcastTyping(true, "prompt-input");
  // ... your input logic
};

const handleInputBlur = () => {
  broadcastTyping(false, "prompt-input");
};
```

### 3. **Highlight Selected Elements**
```tsx
const { onlineUsers } = useRealtimeCollaboration({ ... });

// Render selection highlights
{Object.values(onlineUsers).map((user) => (
  user.selectedElements?.map((elementId) => (
    <div
      key={elementId}
      className="absolute border-2 pointer-events-none"
      style={{ borderColor: user.cursorColor }}
    />
  ))
))}
```

### 4. **Log Important Actions**
```tsx
// After successful node creation
await collaborationService.logActivity(
  projectId,
  "node_created",
  {
    nodeName: node.name,
    nodeType: node.type,
    position: node.position,
  }
);
```

---

**✨ You're all set! Start building collaborative features into your app.**
