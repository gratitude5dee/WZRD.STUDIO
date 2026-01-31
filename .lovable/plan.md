

# Add Creator Type Selection to Onboarding Flow

## Overview

This plan adds a new **Creator Type** step at the very beginning of the onboarding flow. This step allows users to identify themselves as either a **Human Creator** (golden checkmark badge) or an **AI Agent** (orange lobster emoji). This selection will be persisted and used throughout the app.

## Current Flow
```
Welcome → Tastes (Step 1) → Genres (Step 2) → Connect (Step 3) → Complete
```

## New Flow
```
Welcome → Creator Type (Step 1) → Tastes (Step 2) → Genres (Step 3) → Connect (Step 4) → Complete
```

---

## Changes Required

### 1. Update `src/pages/Onboarding.tsx`

**Add Creator Type State & Step:**
- Add new state: `creatorType` (`'human' | 'agent' | null`)
- Update `steps` array to include `'creator-type'` after welcome
- Update step labels from "Step 1 of 3" → "Step 2 of 4", etc.
- Update progress calculation for 5 steps (0-4)

**Create `CreatorTypeStep` Component:**
- Display two large, attractive selection cards:
  - **Human Creator**: Golden checkmark icon, description about being a human artist
  - **AI Agent**: Orange lobster emoji, description about being an AI creator
- Match the existing visual style with gradient backgrounds and animations
- Require a selection before proceeding

**Update `handleFinish`:**
- Include `creatorType` in the preferences saved to localStorage
- Store as `eartone_creator_type` for easy access throughout the app

### 2. Update Step Navigation

| Original Step | New Step | Label |
|---------------|----------|-------|
| Welcome (0) | Welcome (0) | - |
| - | Creator Type (1) | Step 1 of 4 |
| Tastes (1) | Tastes (2) | Step 2 of 4 |
| Genres (2) | Genres (3) | Step 3 of 4 |
| Connect (3) | Connect (4) | Step 4 of 4 |
| Complete (4) | Complete (5) | - |

---

## Technical Details

### New CreatorTypeStep Component

```typescript
function CreatorTypeStep({
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  selected: 'human' | 'agent' | null;
  onSelect: (type: 'human' | 'agent') => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const options = [
    {
      id: 'human',
      label: 'Human Creator',
      description: 'I am a human artist, musician, filmmaker, or creative',
      badge: <BadgeCheck className="w-8 h-8 text-yellow-400 fill-yellow-400/20" />,
      gradient: 'from-yellow-500 via-amber-500 to-orange-400',
    },
    {
      id: 'agent',
      label: 'AI Agent',
      description: 'I am an AI creating or curating content autonomously',
      badge: <span className="text-3xl">🦞</span>,
      gradient: 'from-orange-500 via-red-500 to-pink-400',
    },
  ];
  // ... render selection cards
}
```

### Updated State & Steps

```typescript
const [creatorType, setCreatorType] = useState<'human' | 'agent' | null>(null);
const steps = ['welcome', 'creator-type', 'tastes', 'genres', 'connect', 'complete'];
```

### Updated handleFinish

```typescript
const handleFinish = () => {
  // Save creator type separately for easy access
  if (creatorType) {
    localStorage.setItem('eartone_creator_type', creatorType);
  }
  
  const preferences = {
    creatorType,
    tastes: selectedTastes,
    genres: selectedGenres,
    connectedServices: services.filter((s) => s.connected).map((s) => s.id),
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem('eartone_preferences', JSON.stringify(preferences));
  localStorage.setItem('eartone_onboarding_complete', 'true');
  navigate('/home');
};
```

---

## Integration with MogUpload

After onboarding, the creator type can be pre-filled in MogUpload:

```typescript
// In MogUpload.tsx - auto-set creator type from onboarding
const savedCreatorType = localStorage.getItem('eartone_creator_type') as CreatorType | null;
const [creatorType, setCreatorType] = useState<CreatorType>(savedCreatorType || 'human');
```

---

## Visual Design

The Creator Type step will feature:
- Two large cards (full width on mobile, side-by-side on desktop)
- Golden checkmark badge for Human Creator using `BadgeCheck` icon
- Orange lobster emoji (🦞) for AI Agent
- Gradient backgrounds matching existing taste cards
- Check indicator on selected card
- Matching animation transitions

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Onboarding.tsx` | Modify | Add CreatorTypeStep, update flow logic, persist creator type |
| `src/pages/MogUpload.tsx` | Modify | Pre-fill creator type from saved onboarding preference |

