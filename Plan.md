# Plan

## Prioritized Fixes
1. **Harden Streaming UX (High Impact, Medium Effort)**
   - Surface phase-aware progress, cancellation, and telemetry badges for `/gen/shots` so QA can validate latency budgets per scene.
   - Persist the latest run metadata for comparison and expose hooks for retry/queue orchestration.
2. **Virtualize Storyboard Timelines (High Impact, High Effort)**
   - Swap the current map-based rendering for windowed lists (e.g., `@tanstack/react-virtual`) that cooperate with DnD and focus management.
   - Move DOM measurement for connection lines off the critical path with ResizeObservers and requestIdle callbacks.
3. **Prefetch & Cache Coordination (Medium Impact, Medium Effort)**
   - Prewarm scene + shot metadata via React Query when a project loads and cache SSE payloads for offline review.
   - Emit `stale-while-revalidate` hints and ETags for HTML to keep SSR snappy behind the CDN.
4. **Bundle Budget Guardrails (Medium Impact, Low Effort)**
   - Introduce a bundle analyzer script and split project setup wizard tabs into nested Suspense islands.
   - Gate optional tooling (Luma/GenAI SDKs) behind dynamic imports so non-generative routes stay light.
5. **Observability Pipeline (Medium Impact, Medium Effort)**
   - Send `web-vitals` samples + streaming phase timings to Supabase via `navigator.sendBeacon` with project/scene tags.
   - Dashboard critical percentiles (P75 FCP/LCP/INP, streaming latency) for regression detection.

## Rollback Plan
- Feature-gate streaming telemetry with `VITE_ENABLE_STREAM_TELEMETRY`. Toggle off to hide progressive progress UI while leaving the legacy Supabase flow untouched.
- Keep `VITE_ENABLE_SHOT_STREAM` as the master kill switch to drop back to manual shot creation.
- `<PerfShell/>` remains optional through `VITE_USE_PERF_SHELL`; disable to restore the classic client-only bootstrap if regressions surface.
