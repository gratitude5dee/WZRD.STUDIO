
# EARTONE to Mog Complete Rebrand Plan

## Overview

Transform the platform identity from "EARTONE" to "Mog" with a distinct lobster (🦞) visual language and new infrastructure partner branding (Espresso Systems & ApeChain alongside existing Thirdweb).

---

## Phase 1: Global Text Replacement

### Files to Update

| File | Current | New |
|------|---------|-----|
| `index.html` | `EARTONE - A Signal in the Noise` | `Mog - The Content Economy` |
| `index.html` | All EARTONE references in meta tags | Mog references |
| `src/pages/Landing.tsx` | `EARTON<span>E</span>` wordmark | `Mog` |
| `src/pages/Landing.tsx` | Hero headline | `Mog the internet. Own the culture.` |
| `src/pages/Landing.tsx` | Testimonial EARTONE references | Mog |
| `src/pages/Landing.tsx` | "EARTONE is different" | "Mog is different" |
| `src/pages/Auth.tsx` | `EARTONE` heading | `Mog` |
| `src/pages/Auth.tsx` | `eartone_onboarding_complete` localStorage key | `mog_onboarding_complete` |
| `src/components/PageHeader.tsx` | `eartone` logo text | `Mog` |

---

## Phase 2: Intro Animation Rename

### Rename Component File

| Action | Details |
|--------|---------|
| Rename file | `src/components/EartoneIntro.tsx` → `src/components/MogIntro.tsx` |
| Update letters array | `['E', 'A', 'R', 'T', 'O', 'N', 'E']` → `['M', 'O', 'G']` |
| Remove the scaleX(-1) transform | No longer needed for "Mog" |
| Update footer text | `eartone powered by` → `mog powered by` |

### Update Import Reference

| File | Change |
|------|--------|
| `src/pages/Intro.tsx` | `import { EartoneIntro }` → `import { MogIntro }` |

---

## Phase 3: Lobster Like Button Refactor

### Target File: `src/components/engagement/LikeButton.tsx`

**Current Implementation:**
- Uses `Heart` icon from lucide-react
- Red fill when liked
- Standard heart icon animation

**New Implementation:**

```typescript
// Replace Heart with Lobster emoji
<motion.div
  key={isLiked ? "liked" : "unliked"}
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  exit={{ scale: 0.8 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
  className={cn(
    "text-xl leading-none transition-all duration-300",
    isLiked 
      ? "grayscale-0 scale-110 drop-shadow-lg" 
      : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
  )}
>
  🦞
</motion.div>
```

**Key Changes:**
- Remove `Heart` import from lucide-react
- Replace icon with `🦞` emoji wrapped in motion.div
- Use grayscale filter for unliked state
- Add `scale-110` and `drop-shadow-lg` for liked state pop effect
- Update count text color logic (remove red, use foreground colors)

### Propagate to Other Components

These files have inline Heart icons that need updating:

| File | Lines | Change |
|------|-------|--------|
| `src/components/mog/MogPostCard.tsx` | Lines 224-229 | Replace Heart with 🦞, use grayscale logic |
| `src/components/NetflixVideoCard.tsx` | Lines 97, 126 | Replace Heart with 🦞 |
| `src/components/TrackCard.tsx` | Lines 109, 142 | Replace Heart with 🦞 |

---

## Phase 4: Partner Logo Integration

### Target Footer Sections

Replace generic "Powered by X" text with a styled partner row:

```tsx
<div className="flex items-center justify-center gap-6 opacity-80">
  <span className="font-mono tracking-tighter text-xs">Espresso</span>
  <span className="font-bold text-blue-500 text-xs">ApeChain ⛓️</span>
  {/* Existing Thirdweb logo/text */}
  <span className="text-xs">thirdweb</span>
</div>
```

### Files to Update

| File | Current Footer | New Footer |
|------|---------------|------------|
| `src/pages/Landing.tsx` (line 407-408) | `Powered by Thirdweb` | Partner row with Espresso, ApeChain, thirdweb |
| `src/pages/Auth.tsx` (lines 97-103) | `Powered by Monad • x402 Protocol` + `Powered by thirdweb` | Partner row |
| `src/components/BuyWidget.tsx` (lines 165-168) | `Secured by Thirdweb & Monad` | Partner row |
| `src/components/MogIntro.tsx` (footer) | `eartone powered by` + thirdweb logo | `mog powered by` + partner logos |

---

## Phase 5: Landing Page Hero Update

### Current Hero (lines 129-132):

```tsx
<h2 className="text-2xl md:text-4xl font-playfair text-landing-charcoal mb-4 max-w-3xl mx-auto">
  Every stream pays creators <span className="text-landing-copper italic">instantly</span>
</h2>
```

### New Hero:

```tsx
<h2 className="text-2xl md:text-4xl font-playfair text-landing-charcoal mb-4 max-w-3xl mx-auto">
  Mog the internet. <span className="text-landing-copper italic">Own the culture.</span>
</h2>
```

---

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `src/components/MogIntro.tsx` | Renamed from EartoneIntro.tsx |

### Deleted Files

| File | Reason |
|------|--------|
| `src/components/EartoneIntro.tsx` | Renamed to MogIntro.tsx |

### Modified Files

| File | Changes |
|------|---------|
| `index.html` | Title, meta tags → Mog branding |
| `src/pages/Landing.tsx` | All EARTONE → Mog, hero headline, footer partners |
| `src/pages/Auth.tsx` | EARTONE → Mog, localStorage key, footer partners |
| `src/pages/Intro.tsx` | Import MogIntro instead of EartoneIntro |
| `src/components/PageHeader.tsx` | Logo text → Mog |
| `src/components/engagement/LikeButton.tsx` | Heart → 🦞 with grayscale logic |
| `src/components/mog/MogPostCard.tsx` | Heart → 🦞 |
| `src/components/NetflixVideoCard.tsx` | Heart → 🦞 |
| `src/components/TrackCard.tsx` | Heart → 🦞 |
| `src/components/BuyWidget.tsx` | Footer partner row |

---

## Visual Reference: Lobster Button States

**Unliked State:**
```
🦞 (grayscale, 50% opacity)
```

**Hovered State:**
```
🦞 (full color, 100% opacity)
```

**Liked State:**
```
🦞 (full color, 110% scale, drop-shadow glow)
```

---

## Partner Row Visual Layout

```text
┌─────────────────────────────────────────────────┐
│    Espresso    ApeChain ⛓️    thirdweb          │
│   (font-mono)   (blue-500)    (existing)        │
└─────────────────────────────────────────────────┘
```

---

## Implementation Notes

1. **MogIntro Animation**: The letters array change from 7 to 3 characters will naturally adjust the animation timing and spacing
2. **Grayscale Filter**: Uses CSS `grayscale` class from Tailwind - works on emoji natively
3. **Drop Shadow**: The `drop-shadow-lg` class creates the "pop" effect for the liked lobster
4. **Backward Compatibility**: Update localStorage key check to handle both old and new keys during transition
