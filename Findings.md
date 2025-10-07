# Findings

## Rendering & Hydration Bottlenecks
- Vite SPA still hydrates the entire router in one Suspense boundary. The `<PerfShell/>` shields FCP, but nested routes (Studio/Storyboard editors) continue to load large client bundles before any per-route shell can appear.
- Storyboard timelines render every `ShotCard` simultaneously. DnD and framer-motion animations fire for each item, so large scenes (>25 shots) cause long main-thread tasks and layout thrash during hydration.

## Network & Data Fetching
- Supabase queries remain waterfalling—shots load per scene after mount and there is no cache prewarming. Prefetching scene metadata while streaming generations would hide part of the latency budget.
- The `/gen/shots` edge function stubs deterministic demo data. It does not yet integrate with upstream LLM/media services, issue server-side retries, or expose cache headers for downstream CDNs.

## Bundling & Code Splitting
- Route-level `React.lazy` is in place, but heavy feature areas (editor canvases, timeline smart tools) still live in monolithic chunks. Secondary tabs inside the project wizard should defer lux components (Framer Motion, media previews) behind nested Suspense.
- No bundle analyzer or heuristics exist to keep generative tooling (OpenAI/Supabase clients) out of the critical path.

## Observability & Telemetry
- `reportWebVitals` records metrics locally but never flushes them to Supabase or an observability endpoint; there is no sampling, attribution, or correlation with server timing headers.
- Streaming metadata (request IDs, phase timings) is emitted from the server but not aggregated centrally, so regressions in latency are invisible outside of devtools.

## Generative UX Gaps
- Shot streaming lacks queue coordination: triggering a new run while one is inflight drops the previous timeline without any ability to resume or reconcile duplicates.
- There is no virtualization or incremental focus management for shot placeholders—screen readers must traverse every skeleton, and long timelines cause scroll jumps when new chunks arrive.
- Cancellation, retry, and progress affordances are minimal; users cannot inspect per-phase timing, compare runs, or export telemetry for QA.
