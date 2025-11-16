# 🚀 Real-Time Multiplayer Collaboration System - Deployment Guide

## Overview

This guide covers the complete deployment and configuration of the enterprise-grade real-time collaboration system for WZRDFLOW.

## 📋 Prerequisites

- Supabase project with database access
- Supabase CLI installed (`npm install -g supabase`)
- Node.js 18+ and npm/bun
- Access to Supabase Dashboard

---

## 🗄️ Database Deployment

### Step 1: Run Migrations

```bash
# Navigate to project directory
cd /home/user/WZRD.STUDIO

# Link to your Supabase project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

Or manually run migrations in Supabase Dashboard:
1. Go to SQL Editor
2. Execute `supabase/migrations/20251116220000_add_collaboration_system.sql`
3. Execute `supabase/migrations/20251116220001_add_collaboration_rls_policies.sql`

### Step 2: Verify Tables Created

Check that all 6 tables were created successfully:
- ✅ `project_collaborators`
- ✅ `project_share_links`
- ✅ `collaboration_sessions`
- ✅ `project_activity`
- ✅ `anonymous_users`
- ✅ `project_comments`

### Step 3: Verify Realtime Enabled

In Supabase Dashboard → Database → Replication:
- ✅ Enable realtime for `collaboration_sessions`
- ✅ Enable realtime for `project_activity`
- ✅ Enable realtime for `project_comments`

---

## ⚡ Edge Functions Deployment

### Step 1: Deploy Functions

```bash
# Deploy all collaboration functions
supabase functions deploy invite-collaborator
supabase functions deploy accept-invitation
supabase functions deploy create-share-link
supabase functions deploy access-share-link
```

### Step 2: Set Environment Variables

In Supabase Dashboard → Edge Functions → Settings:

```env
APP_URL=https://your-app-domain.com
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

### Step 3: Test Functions

```bash
# Test invite-collaborator
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/invite-collaborator' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "projectId": "test-project-id",
    "email": "test@example.com",
    "role": "viewer"
  }'
```

---

## 🎨 Frontend Integration

### Step 1: Install Dependencies (if needed)

```bash
# All required dependencies should already be installed
bun install
```

### Step 2: Import and Use Components

#### Example: Add Collaboration to a Page

```tsx
// In your page component (e.g., StudioPage.tsx)
import { useRealtimeCollaboration } from "@/hooks/useCollaboration";
import { RemoteCursors } from "@/components/collaboration/RemoteCursor";
import { CollaborationPanel } from "@/components/collaboration/CollaborationPanel";
import { useState } from "react";

export const StudioPage = () => {
  const projectId = "your-project-id";
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Initialize collaboration
  const {
    cursors,
    isConnected,
    broadcastCursor,
    session,
  } = useRealtimeCollaboration({
    projectId,
    currentPage: "studio",
    enabled: true,
    onUserJoined: (user) => {
      console.log("User joined:", user.display_name);
    },
  });

  // Track cursor movement
  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    setCursorPosition({ x, y });
    broadcastCursor(x, y);
  };

  return (
    <div onMouseMove={handleMouseMove} className="relative h-screen">
      {/* Your page content */}
      <main>
        {/* ... */}
      </main>

      {/* Remote cursors */}
      <RemoteCursors cursors={cursors} currentPage="studio" />

      {/* Collaboration panel */}
      <div className="fixed right-0 top-0 h-screen w-80 bg-background border-l">
        <CollaborationPanel projectId={projectId} />
      </div>

      {/* Connection indicator */}
      {isConnected && (
        <div className="fixed bottom-4 left-4 px-3 py-1 bg-green-500 text-white text-sm rounded-full">
          ✓ Connected ({Object.keys(cursors).length + 1} online)
        </div>
      )}
    </div>
  );
};
```

### Step 3: Add Collaboration to Routes

```tsx
// In your router configuration
import { Route } from "react-router-dom";

// Accept invitation route
<Route path="/invite/:token" element={<AcceptInvitationPage />} />

// Share link access route
<Route path="/share/:token" element={<ShareLinkAccessPage />} />
```

---

## 🔒 Security Checklist

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- ✅ **project_collaborators**: Only owners can manage, collaborators can view
- ✅ **project_share_links**: Collaborators with permissions can create
- ✅ **collaboration_sessions**: Users manage own sessions
- ✅ **project_activity**: Visible to all collaborators
- ✅ **project_comments**: Collaborators can comment based on permissions
- ✅ **anonymous_users**: Self-managed

### Edge Functions Security

- ✅ All functions use JWT authentication (except public share link access)
- ✅ Input validation on all parameters
- ✅ Email format validation
- ✅ Token expiration checks
- ✅ Password hashing for protected share links

---

## 🧪 Testing

### Unit Tests

```bash
# Run collaboration service tests
bun test src/services/collaborationService.test.ts
```

### Integration Tests

```bash
# Test realtime features
bun test src/hooks/useCollaboration.test.ts
```

### Manual Testing Checklist

- [ ] Invite a collaborator via email
- [ ] Accept invitation using token link
- [ ] Create public share link
- [ ] Access project via share link
- [ ] See remote cursors in real-time
- [ ] View activity feed updates
- [ ] Add and resolve comments
- [ ] Remove collaborator
- [ ] Revoke share link

---

## 📊 Monitoring

### Database Monitoring

Monitor these queries for performance:

```sql
-- Check active sessions
SELECT COUNT(*) FROM collaboration_sessions WHERE is_active = TRUE;

-- Check stale sessions (need cleanup)
SELECT COUNT(*) FROM collaboration_sessions
WHERE is_active = TRUE
AND last_activity_at < now() - INTERVAL '1 hour';

-- Check share link usage
SELECT name, current_uses, max_uses
FROM project_share_links
WHERE is_active = TRUE
ORDER BY current_uses DESC;
```

### Realtime Monitoring

In Supabase Dashboard → Realtime:
- Monitor active connections
- Check message throughput
- Watch for connection errors

---

## 🔧 Maintenance

### Automated Cleanup

Set up a cron job to clean stale sessions:

```sql
-- Create cron job (requires pg_cron extension)
SELECT cron.schedule(
  'cleanup-stale-sessions',
  '*/10 * * * *', -- Every 10 minutes
  'SELECT end_stale_sessions()'
);
```

### Manual Cleanup

```sql
-- End stale sessions manually
SELECT end_stale_sessions();

-- Delete old anonymous users (30+ days inactive)
DELETE FROM anonymous_users
WHERE last_seen_at < now() - INTERVAL '30 days';

-- Archive old activity (optional)
DELETE FROM project_activity
WHERE created_at < now() - INTERVAL '90 days';
```

---

## 🐛 Troubleshooting

### Issue: Realtime not working

**Solution:**
1. Check Supabase Dashboard → Database → Replication
2. Verify tables are enabled for realtime
3. Check browser console for WebSocket errors
4. Verify `REPLICA IDENTITY FULL` is set on tables

### Issue: Invitations not sending

**Solution:**
1. Check Edge Function logs: `supabase functions logs invite-collaborator`
2. Verify SMTP credentials in environment variables
3. Check email service quota/limits
4. Test SMTP connection manually

### Issue: Share links not accessible

**Solution:**
1. Verify RLS policies allow public access to share_links table
2. Check token format (should be 12-64 alphanumeric chars)
3. Verify link is active and not expired
4. Check max_uses limit

### Issue: Cursors not appearing

**Solution:**
1. Check if Realtime channel is connected: `isConnected` state
2. Verify cursor broadcast is being called on mouse move
3. Check browser console for broadcast errors
4. Ensure cursors are filtered by current page

---

## 📈 Performance Optimization

### Realtime Optimization

```tsx
// Throttle cursor broadcasts (already implemented)
import { throttle } from "lodash-es";

const throttledBroadcastCursor = throttle(broadcastCursor, 50); // 20fps max
```

### Database Optimization

```sql
-- Add indexes for frequently queried fields (already in migration)
CREATE INDEX idx_sessions_active ON collaboration_sessions(is_active)
WHERE is_active = TRUE;

CREATE INDEX idx_activity_feed ON project_activity(project_id, created_at DESC);
```

### Frontend Optimization

- Use React Query for caching collaborator/link data
- Implement virtual scrolling for large activity feeds
- Debounce typing indicators
- Use presence state batching

---

## 🎯 Feature Roadmap

### Phase 1: Core Collaboration (✅ Completed)
- [x] Database schema with RLS
- [x] Edge Functions for invitations & share links
- [x] Real-time presence & cursors
- [x] Activity feed
- [x] Comments system

### Phase 2: Enhanced Features (🚧 Recommended Next)
- [ ] Email notifications (Resend/SendGrid integration)
- [ ] @mentions in comments
- [ ] Conflict resolution for simultaneous edits
- [ ] Version history with snapshots
- [ ] Permissions for specific pages/sections

### Phase 3: Advanced Features (💡 Future)
- [ ] Video/audio calls (WebRTC)
- [ ] Screen sharing
- [ ] AI-powered collaboration insights
- [ ] Advanced analytics dashboard
- [ ] Role-based workflows

---

## 📚 API Reference

### Collaboration Service

```typescript
import { collaborationService } from "@/services/collaborationService";

// Invite collaborator
await collaborationService.inviteCollaborator(
  projectId,
  "user@example.com",
  "editor",
  "Welcome to the team!"
);

// Create share link
const { shareUrl } = await collaborationService.createShareLink({
  projectId,
  linkType: "public",
  accessLevel: "view",
  expiresInDays: 7,
});

// Log activity
await collaborationService.logActivity(
  projectId,
  "node_created",
  { nodeName: "Image Generator", nodeType: "ai" }
);

// Add comment
await collaborationService.addComment(
  projectId,
  "Great work on this node!",
  "node",
  "node-123"
);
```

### Realtime Hooks

```typescript
import { useRealtimeCollaboration } from "@/hooks/useCollaboration";

const {
  cursors,           // Record<sessionId, CursorPosition>
  onlineUsers,       // Record<sessionId, PresenceState>
  isConnected,       // boolean
  session,           // Current user's session
  broadcastCursor,   // (x, y) => void
  broadcastSelection,// (elements[]) => void
  updatePresence,    // (state) => void
} = useRealtimeCollaboration({
  projectId,
  currentPage: "studio",
  enabled: true,
});
```

---

## 🎓 Best Practices

### 1. Cursor Broadcasting
- Throttle to 50ms (20fps) to reduce network load
- Only broadcast when cursor actually moves
- Filter cursors by current page to avoid clutter

### 2. Presence Updates
- Batch presence updates (debounce 1 second)
- Update only when state actually changes
- Include minimal data (avoid large objects)

### 3. Activity Logging
- Log user-initiated actions only (not automated events)
- Include meaningful metadata for context
- Implement log rotation for large projects

### 4. Comments
- Enable rich text formatting (Markdown/HTML)
- Implement @mentions for notifications
- Allow threaded replies (up to 5 levels deep)
- Support reactions for quick feedback

### 5. Share Links
- Use descriptive names for links
- Set reasonable expiration times
- Monitor usage to detect abuse
- Implement password protection for sensitive projects

---

## 🔐 Environment Variables

Required environment variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Edge Functions
APP_URL=https://your-app-domain.com

# Email (optional but recommended)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@your-domain.com
```

---

## ✅ Deployment Checklist

- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Realtime enabled on tables
- [ ] Edge Functions deployed
- [ ] Environment variables configured
- [ ] SMTP credentials tested
- [ ] Frontend components integrated
- [ ] Routes configured
- [ ] Manual testing completed
- [ ] Monitoring configured
- [ ] Cleanup cron job scheduled
- [ ] Documentation reviewed

---

## 🆘 Support

For issues or questions:
1. Check logs: `supabase functions logs <function-name>`
2. Inspect database: Use Supabase SQL Editor
3. Debug realtime: Check browser DevTools → Network → WS
4. Review RLS policies: Ensure proper permissions

---

**🎉 Congratulations! Your production-ready real-time multiplayer collaboration system is now deployed.**

For best results, thoroughly test all features before releasing to production users.
