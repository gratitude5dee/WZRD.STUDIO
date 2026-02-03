
# WZRD.STUDIO - Visceral Physics Canvas Transformation

## Overview

Transform the existing React Flow-based node editor (`/studio` page) into a futuristic HUD-like creative instrument with fluid physics-based interactions, gesture detection, glassmorphism aesthetics, and real-time data flow visualization.

---

## Current Architecture Analysis

**Existing Components:**
- `StudioCanvas.tsx` - Main canvas wrapper using React Flow
- `BaseNode.tsx` - Node container with handles and hover menus
- `ImprovedEdge.tsx` - Current edge with data-type coloring
- `BezierConnection.tsx` - Connection rendering with particles
- `CustomConnectionLine.tsx` - Active connection line during drag
- `useConnectionDrawing.ts` - Connection creation logic
- `useNodePositionSync.ts` - Node position persistence

**Design System:**
- `src/lib/studio/theme.ts` - Studio theme tokens
- `src/lib/designSystem.ts` - Unified design system
- Tailwind config with custom animations and glass utilities

---

## Implementation Phases

### Phase 1: Canvas Environment (Foundation)

#### 1.1 Create `PhysicsCanvas.tsx` - Enhanced Canvas Wrapper

```text
Location: src/components/studio/canvas/PhysicsCanvas.tsx

Features:
├── Custom dot-grid SVG pattern (1.5px dots, 24px spacing)
├── Anti-zoom scaling for grid dots
├── Radial gradient depth overlay (center lighter → edges darker)
└── Ambient floating particles (20-30 particles, slow drift)
```

**Technical Implementation:**
- Replace React Flow `<Background>` with custom SVG pattern
- Use `viewport` from React Flow to calculate anti-zoom scaling
- Add `AmbientParticles` component with Framer Motion for slow drift
- CSS containment for performance: `contain: layout style paint`

#### 1.2 Create `AmbientParticleSystem.tsx`

```text
Location: src/components/studio/effects/AmbientParticleSystem.tsx

Particle Config:
├── Count: 25 particles
├── Size: 1-3px
├── Opacity: 0.1-0.3
├── Velocity: Very slow drift (0.5-2px/s)
└── Pointer events: none
```

---

### Phase 2: Physics Connection System

#### 2.1 Create `useSpringPhysics.ts` Hook

```text
Location: src/hooks/studio/useSpringPhysics.ts

Spring Configuration:
├── stiffness: 120
├── damping: 14
├── mass: 1
└── velocity: 0 (initial)

Provides:
├── Spring position interpolation
├── Velocity tracking
└── Damped oscillation settling
```

#### 2.2 Create `PhysicsConnectionLine.tsx`

```text
Location: src/components/studio/connections/PhysicsConnectionLine.tsx

Visual Elements:
├── Leading Head Glow
│   ├── Color: Electric cyan #00D4FF
│   ├── Size: 8px diameter
│   └── Glow: 12px blur, 50% opacity
├── Elastic Trail
│   ├── Gradient: #00D4FF → transparent (200px)
│   └── Spring-delayed follow behavior
└── Crosshair Snap Indicator (at grid intersections)
```

**Path Calculation:**
```typescript
const calculateSpringPath = (start, end, springState) => {
  const controlOffset = springState.velocity * 0.3;
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2 + controlOffset;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
};
```

#### 2.3 Grid Snapping System

```text
Location: src/hooks/studio/useGridSnapping.ts

Configuration:
├── SNAP_THRESHOLD: 12px
├── Grid size: 24px
└── Visual feedback: Crosshair indicator at snap point
```

---

### Phase 3: Gesture Velocity System (Slicing)

#### 3.1 Create `useGestureVelocity.ts` Hook

```text
Location: src/hooks/studio/useGestureVelocity.ts

Tracking:
├── Position sampling at 60fps
├── Velocity calculation (px/s)
├── Direction vector
├── Trail buffer (last 10 positions)
└── High velocity detection (> 800px/s)

Exports:
├── velocity: number
├── direction: { x, y }
├── isHighVelocity: boolean
├── trail: Point[]
└── trailDecay: 0.15 per frame
```

#### 3.2 Create `SliceTrail.tsx` Component

```text
Location: src/components/studio/effects/SliceTrail.tsx

Visual Elements:
├── Fading trail segments
│   ├── Opacity decay: (1 - i/length) * 0.8
│   └── Width decay: (1 - i/length) * 3 + 1
├── Leading red glow
│   ├── Color: #FF4444
│   ├── Blur: 8px
│   └── Size: 6px
└── Particle dispersion on slice
```

#### 3.3 Edge Intersection Detection

```text
Location: src/lib/studio/edge-intersection.ts

Algorithm:
├── Line-curve intersection for Bezier paths
├── Check last trail segment against all edges
└── Return intersected edge IDs
```

#### 3.4 Create `SliceEffect.tsx` Animation

```text
Location: src/components/studio/effects/SliceEffect.tsx

Animation Sequence:
├── Split edge visually at intersection point
├── Recoil animation (both halves move apart)
├── Particle dispersion (12 particles)
│   ├── Radial angles
│   ├── Velocity: 100-150px/s
│   └── Life: 0.5-0.8s
└── Flash at cut point
```

---

### Phase 4: Glassmorphic Node Design

#### 4.1 Update `BaseNode.tsx` with Glassmorphism

```text
Enhanced Styles:
├── Background: rgba(20, 20, 20, 0.85)
├── Backdrop filter: blur(20px)
├── Border radius: 12px
├── Border: 1px solid rgba(255, 255, 255, 0.08)
├── Box shadow:
│   ├── 0 4px 24px rgba(0, 0, 0, 0.4)
│   ├── inset 0 1px 0 rgba(255, 255, 255, 0.05)
│   └── inset 0 -1px 0 rgba(0, 0, 0, 0.2)
└── Glass overlay gradient
```

#### 4.2 Node Spawn Animation

```text
Framer Motion Variants:
├── initial: { scale: 0, opacity: 0, y: 20 }
├── animate: { scale: 1, opacity: 1, y: 0 }
│   └── spring: { stiffness: 300, damping: 20, mass: 0.8 }
└── exit: { scale: 0.8, opacity: 0, duration: 0.2 }
```

#### 4.3 Node Hover States

```text
Hover Variants:
├── idle: { scale: 1, boxShadow: default, y: 0 }
├── hover: { scale: 1.02, boxShadow: enhanced, y: -2 }
│   └── spring: { stiffness: 400, damping: 25 }
└── active: { scale: 0.98, boxShadow: reduced, y: 1 }
```

#### 4.4 Selection Ring with Corner Accents

```text
Selection Visual:
├── Animated border glow (cyan #00D4FF)
├── Corner accent dots (4 corners)
│   └── Animated pulse effect
└── Shadow: 0 0 24px glow color
```

---

### Phase 5: Data Flow Visualization

#### 5.1 Update `ImprovedEdge.tsx` with Status System

```text
Status Colors:
├── idle: rgba(255, 255, 255, 0.3)
├── queued: rgba(251, 191, 36, 0.8) - Amber
├── running: #00D4FF - Cyan
├── success: rgba(34, 197, 94, 0.8) - Green
└── error: rgba(239, 68, 68, 0.8) - Red

Visual States:
├── Marching ants (queued) - dashed animation
├── Traveling pulse (running) - orb along path
└── Flash effect (success/error) - on completion
```

#### 5.2 Create `TravelingPulse.tsx`

```text
Location: src/components/studio/edges/TravelingPulse.tsx

Features:
├── Get point along SVG path at progress %
├── Glowing orb (8px, cyan)
├── Trail behind orb (gradient fade)
└── SVG glow filter
```

#### 5.3 Add CSS Keyframes to Tailwind

```text
New Animations:
├── marching-ants: stroke-dashoffset 0 → 12 (0.5s)
├── pulse-glow: opacity/scale pulse (2s)
└── slice-trail: fade-out (0.3s)
```

---

### Phase 6: Enhanced Connection Handles

#### 6.1 Create `PhysicsHandle.tsx`

```text
Location: src/components/studio/nodes/PhysicsHandle.tsx

Design:
├── Outer ring (12px, 2px border)
├── Inner dot (4px fill)
├── Data-type coloring
│   ├── image: #E879F9 (Pink)
│   ├── video: #F472B6 (Rose)
│   ├── text: #60A5FA (Blue)
│   ├── audio: #34D399 (Emerald)
│   └── data: #A78BFA (Purple)
├── Hover: scale 1.3, glow 12px
└── Connecting: scale 1.5, glow 16px, pulse
```

---

### Phase 7: Image Preview Node Enhancement

#### 7.1 Update Image Node with Generation Overlay

```text
Location: src/components/studio/nodes/ReactFlowImageNode.tsx

Features:
├── Rounded corners (16px)
├── Skeleton shimmer during load
├── Generation overlay:
│   ├── Scanning line effect (horizontal sweep)
│   ├── Progress ring (SVG circle)
│   └── Percentage text
└── Success: scale-in animation
```

---

### Phase 8: Performance Optimizations

#### 8.1 React.memo with Custom Comparison

```typescript
const OptimizedNode = React.memo(NodeComponent, (prev, next) => {
  return (
    prev.data.status === next.data.status &&
    prev.data.preview === next.data.preview &&
    prev.selected === next.selected &&
    prev.dragging === next.dragging
  );
});
```

#### 8.2 CSS Containment

```css
.node-container {
  contain: layout style paint;
  will-change: transform;
}

.background-element {
  pointer-events: none;
}
```

#### 8.3 RAF-based Physics Loop

```text
Location: src/hooks/studio/usePhysicsLoop.ts

Features:
├── requestAnimationFrame loop
├── Delta-time calculation
├── Batched state updates
└── Cleanup on unmount
```

---

## File Structure Summary

```text
src/
├── components/studio/
│   ├── canvas/
│   │   ├── PhysicsCanvas.tsx          [NEW]
│   │   ├── CanvasToolbar.tsx          [EXISTS]
│   │   └── ConnectionModeIndicator.tsx [EXISTS]
│   ├── connections/
│   │   ├── PhysicsConnectionLine.tsx  [NEW]
│   │   └── BezierConnection.tsx       [UPDATE]
│   ├── edges/
│   │   ├── ImprovedEdge.tsx           [UPDATE]
│   │   ├── TravelingPulse.tsx         [NEW]
│   │   └── MarchingAntsEdge.tsx       [NEW]
│   ├── effects/
│   │   ├── AmbientParticleSystem.tsx  [NEW]
│   │   ├── SliceTrail.tsx             [NEW]
│   │   ├── SliceEffect.tsx            [NEW]
│   │   └── GridSnapIndicator.tsx      [NEW]
│   ├── nodes/
│   │   ├── BaseNode.tsx               [UPDATE]
│   │   ├── PhysicsHandle.tsx          [NEW]
│   │   └── ReactFlowImageNode.tsx     [UPDATE]
│   └── StudioCanvas.tsx               [UPDATE]
├── hooks/studio/
│   ├── useSpringPhysics.ts            [NEW]
│   ├── useGestureVelocity.ts          [NEW]
│   ├── useGridSnapping.ts             [NEW]
│   ├── usePhysicsLoop.ts              [NEW]
│   └── useSliceDetection.ts           [NEW]
├── lib/studio/
│   └── edge-intersection.ts           [NEW]
└── tailwind.config.ts                 [UPDATE]
```

---

## Implementation Order

1. **Foundation** (Phase 1)
   - PhysicsCanvas with dot grid
   - Ambient particles
   - Depth gradient overlay

2. **Node Aesthetics** (Phase 4)
   - Glassmorphism BaseNode update
   - Spawn/hover animations
   - Selection ring

3. **Connection Physics** (Phase 2)
   - Spring physics hook
   - PhysicsConnectionLine
   - Grid snapping

4. **Data Flow** (Phase 5)
   - Edge status system
   - Traveling pulse
   - Marching ants

5. **Gesture System** (Phase 3)
   - Velocity tracking
   - Slice trail
   - Edge intersection detection

6. **Handles & Polish** (Phases 6-8)
   - PhysicsHandle component
   - Image preview enhancement
   - Performance optimizations

---

## Design Tokens Update (Tailwind Config)

```javascript
// New colors
canvas: {
  bg: '#0A0A0A',
  surface: 'rgba(20, 20, 20, 0.85)',
  elevated: 'rgba(30, 30, 30, 0.9)',
},
accent: {
  cyan: '#00D4FF',
  purple: '#A78BFA',
  pink: '#E879F9',
  emerald: '#34D399',
},
border: {
  subtle: 'rgba(255, 255, 255, 0.08)',
  medium: 'rgba(255, 255, 255, 0.15)',
},

// New animations
animation: {
  'marching-ants': 'marching-ants 0.5s linear infinite',
  'spring-bounce': 'spring-bounce 0.3s ease-out',
  'slice-trail': 'slice-trail 0.3s ease-out',
},
```

---

## Technical Considerations

1. **60fps Target**: All animations use transform/opacity only
2. **Canvas Performance**: SVG elements use CSS containment
3. **Memory**: Particle systems capped at 30 particles
4. **Bundle Size**: Lazy load slice effects (rarely used)
5. **Mobile**: Touch velocity tracking for slice gestures

---

## Expected Outcome

The transformed studio canvas will:
- Feel **tactile** with spring-physics connections
- Look **futuristic** with glassmorphism and glowing edges
- Be **responsive** with 60fps animations throughout
- Enable **gestural** slice interactions for quick edge deletion
- Visualize **data flow** in real-time during graph execution
