# Plan

## Prioritized Fixes
1. **Render Shell + Suspense (High Impact, Medium Effort)**
   - Introduce `<PerfShell/>` that SSRs/streams header, navigation, and key containers with skeletons.
   - Wrap router and Project Setup wizard in Suspense boundaries to surface the shell within 200ms while lazy-loading heavy modules.
2. **Route-Level Code Splitting (High Impact, Low Effort)**
   - Replace eager imports in `App.tsx` with `React.lazy` and `Suspense` fallbacks to cut initial JS for non-critical routes.
3. **Async Skeletons for Project Setup (Medium Impact, Medium Effort)**
   - Provide skeleton components for the wizard header/nav/tab content and use `startTransition` to keep INP under 200ms during tab changes.
4. **Generative Shot Streaming (High Impact, High Effort)**
   - Add `/gen/shots` SSE edge function to emit incremental shot states.
   - Implement `useShotStream()` hook and integrate with `ShotsRow` to render placeholders immediately and progressively hydrate shot cards.
5. **Instrumentation (Medium Impact, Low Effort)**
   - Capture Web Vitals in the client, emit `Server-Timing` on `/gen/shots`, and log milestones (FCP/LCP proxies) during development.
6. **Preload & Caching Hints (Medium Impact, Low Effort)**
   - Preconnect to Supabase, preload app styles, and document cache headers for deployment configuration.
7. **E2E Performance Tests (Medium Impact, Medium Effort)**
   - Add Playwright tests with throttled network/CPU assertions for skeleton timing, streaming latency, and INP interactions.

## Rollback Plan
- Feature-gate the shot streaming experience behind `VITE_ENABLE_SHOT_STREAM`. Toggle off to revert to existing Supabase-only flow without redeploying backend.
- `<PerfShell/>` is additive; removing the Suspense wrapper or feature flag `VITE_USE_PERF_SHELL` (default on) will fall back to the previous rendering path.
- `/gen/shots` edge function is isolated—remove the route or disable proxy to rollback streaming without touching the UI.
