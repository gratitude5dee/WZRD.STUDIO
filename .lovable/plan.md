
# Add Tabbed UI to Watch Page & Improve Upload Animation

## Overview

This plan adds a Netflix/Spotify/Articles tabbed navigation to the Watch page (similar to the Listen page's existing implementation) and improves the Create Mog/Upload UI with smooth slide-up sheet-style animations.

## Current State Analysis

1. **Watch Page** (`/watch` → `WatchHome.tsx`):
   - Currently has category filters ("All", "Music Videos", "Documentaries", etc.)
   - No Read/Listen/Watch tab switcher like the Listen page has
   - The user's screenshot shows a "Watch Videos" empty state without the tabbed navigation

2. **Listen Page** (`/home?tab=listen` → `Listen.tsx`):
   - Has a proper tabbed UI with Read/Listen/Watch buttons in the header
   - Uses state to switch between "listen" and "watch" tabs
   - Read button navigates to `/read`

3. **Upload Page** (`/mog/upload` → `MogUpload.tsx`):
   - Currently a full-page component with no entrance/exit animations
   - Navigates directly to the page rather than sliding up as a sheet

---

## Implementation Plan

### 1. Add Tabbed Navigation to Watch Page

Update `WatchHome.tsx` to include the same Read/Listen/Watch tab switcher that exists in `Listen.tsx`:

**Changes:**
- Import `BookOpen` and `Headphones` icons
- Add the three-button tab switcher in the header (centered)
- "Watch" tab will be visually active
- "Listen" navigates to `/home` 
- "Read" navigates to `/read`

**Visual Structure:**
```
┌──────────────────────────────────────────────────┐
│ eartone    [Read] [Listen] [Watch*]    🔔 🌓 💰  │
│                                                  │
│ [All] [Music Videos] [Documentaries] [Live]...  │
│                                                  │
│ ─────────── Hero Section ───────────           │
│                                                  │
│ ─────────── Content Rows ───────────           │
└──────────────────────────────────────────────────┘
```

### 2. Add Slide-Up Animation to MogUpload

Convert the upload page to use a sheet-style animation with smooth entrance and exit:

**Approach A - Framer Motion Animation:**
- Wrap the page content in a `motion.div` with slide-up animation
- Add a semi-transparent backdrop overlay
- Handle back navigation with exit animation before navigating

**Animation Details:**
- Initial: `{ y: "100%", opacity: 0 }`
- Animate: `{ y: 0, opacity: 1 }`
- Exit: `{ y: "100%", opacity: 0 }`
- Transition: `{ type: "spring", damping: 25, stiffness: 300 }`

**Changes to `MogUpload.tsx`:**
```tsx
import { motion, AnimatePresence } from "framer-motion";

// Add backdrop overlay
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="fixed inset-0 bg-black/50 z-40"
  onClick={handleClose}
/>

// Wrap content in animated container
<motion.div
  initial={{ y: "100%" }}
  animate={{ y: 0 }}
  exit={{ y: "100%" }}
  transition={{ type: "spring", damping: 25, stiffness: 300 }}
  className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl"
>
  {/* Upload form content */}
</motion.div>
```

### 3. Add New Animation Keyframes

Update `tailwind.config.ts` with additional keyframes for sheet animations:

```typescript
keyframes: {
  // ... existing keyframes
  "slide-up-full": {
    from: { transform: "translateY(100%)" },
    to: { transform: "translateY(0)" },
  },
  "slide-down-full": {
    from: { transform: "translateY(0)" },
    to: { transform: "translateY(100%)" },
  },
}
```

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/WatchHome.tsx` | Modify | Add Read/Listen/Watch tabbed navigation in header, update logo to "eartone" |
| `src/pages/MogUpload.tsx` | Modify | Add framer-motion slide-up animation with backdrop overlay, handle animated close |
| `tailwind.config.ts` | Modify | Add slide-up-full and slide-down-full keyframes |

---

## Technical Details

### WatchHome.tsx Header Changes

```tsx
// Add to imports
import { BookOpen, Headphones } from "lucide-react";

// Replace header content with tabbed UI
<header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
  <div className="flex items-center justify-between px-4 py-3 safe-top">
    {/* Logo */}
    <span className="text-xl font-bold gradient-text">eartone</span>

    {/* Center - Tab Switch */}
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
      <button onClick={() => navigate("/read")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
        <BookOpen className="h-4 w-4" />
        Read
      </button>
      <button onClick={() => navigate("/home")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground">
        <Headphones className="h-4 w-4" />
        Listen
      </button>
      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium border border-primary text-foreground">
        <Video className="h-4 w-4" />
        Watch
      </button>
    </div>

    {/* Right - Actions */}
    <div className="flex items-center gap-2">
      <NotificationsDropdown />
      <ThemeToggle />
      <WalletButton />
    </div>
  </div>
</header>
```

### MogUpload.tsx Animation Implementation

```tsx
import { motion } from "framer-motion";

const handleClose = () => {
  navigate('/home');
};

return (
  <>
    {/* Backdrop */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-40"
      onClick={handleClose}
    />
    
    {/* Sheet */}
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl overflow-hidden"
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
      
      {/* Content - scrollable */}
      <div className="h-full overflow-y-auto pb-safe-bottom">
        {/* Existing form content */}
      </div>
    </motion.div>
  </>
);
```
