# Findings

## Rendering & Hydration Bottlenecks
- The application is currently client-side only (Vite SPA) with synchronous rendering of the entire router tree. All route components are eagerly imported inside `App.tsx`, inflating the initial bundle and delaying first paint for the project setup flow.
- Project setup tabs import heavy child components (Framer Motion, rich forms) immediately, blocking interaction because no Suspense boundaries or skeletons exist around async work.
- Storyboard shot cards fetch Supabase data sequentially and do not expose any optimistic placeholders; large lists render only after data is fully available, hurting FCP and LCP.

## Network & Data Fetching
- Supabase requests fire after the router mounts. There is no streaming or incremental delivery path for generated shots—users wait for the full payload before seeing anything.
- No HTTP hints (preconnect/preload) exist for Supabase or static assets, and there is no cache policy metadata for HTML or assets.

## Bundling & Code Splitting
- The router eagerly imports 10+ heavy pages (Storyboard, Editors, Landing, etc.). This prevents route-level code splitting and forces unnecessary JS to download for the project setup route.
- Project setup tabs bundle Framer Motion variants per tab despite only one tab being visible.

## Instrumentation & Observability
- There is no web-vitals capture, Server-Timing headers, or development logging around critical performance metrics, making it difficult to verify FCP/LCP/INP regressions.

## UX / Async States
- Loading states rely on full-screen spinners or nothing at all. Skeletons for the project wizard header, nav, and shot cards are missing, so the UI remains blank until data arrives.
- Shot card creation is manual (`Add Shot` button) with no generative/streaming UX; users must wait for Supabase writes to finish before they can interact.
