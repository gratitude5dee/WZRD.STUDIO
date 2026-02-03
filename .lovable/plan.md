
# Fix Missing /login Route - Causing 404 Error

## Problem

You're seeing a 404 error because:
- The "Start Creating Free" button in the HeroSection links to `/login?mode=signup`
- However, there's NO `/login` route defined in `App.tsx`
- The authentication page is actually at `/auth`

This is a routing mismatch affecting 12+ files across the codebase.

---

## Files Requiring Updates

### 1. Add `/login` Route Redirect in `App.tsx`

Add a redirect from `/login` to `/auth` to handle both old links and maintain URL compatibility:

```text
Location: src/App.tsx
Change: Add route that redirects /login to /auth (preserving query params)
```

### 2. Fix HeroSection.tsx (Landing Component)

```text
Location: src/components/landing/HeroSection.tsx
Line 74: Change "/login?mode=signup" to "/auth?mode=signup"
```

### 3. Fix PricingSection.tsx

```text
Location: src/components/landing/PricingSection.tsx
Line 24: Change "/login?mode=signup" to "/auth?mode=signup"
Line 41: Change "/login?mode=signup" to "/auth?mode=signup"
```

### 4. Fix FeatureGrid.tsx

```text
Location: src/components/landing/FeatureGrid.tsx
Line 172: Change "/login?mode=signup" to "/auth?mode=signup"
```

### 5. Fix AuthProvider.tsx

```text
Location: src/providers/AuthProvider.tsx
Line 163: Change pathname check from '/login' to '/auth'
Line 185: Change pathname check from '/login' to '/auth'
Line 164: Change redirect destination from '/home' to '/studio' (direct to workspace)
Line 186: Change redirect destination from '/home' to '/studio'
```

### 6. Fix ProtectedRoute.tsx

```text
Location: src/components/ProtectedRoute.tsx
Line 17: Change redirect from '/login' to '/auth'
```

### 7. Fix Credits.tsx

```text
Location: src/pages/Credits.tsx
Line 23: Change navigate('/login') to navigate('/auth')
```

### 8. Fix DemoBanner.tsx

```text
Location: src/components/demo/DemoBanner.tsx
Line 11: Change '/login?mode=signup' to '/auth?mode=signup'
```

### 9. Fix Home HeroSection.tsx

```text
Location: src/components/home/HeroSection.tsx
Line 94: Change '/login?mode=signup' to '/auth?mode=signup'
```

---

## Summary of Changes

| File | Lines to Update | Change |
|------|-----------------|--------|
| `App.tsx` | Add new route | Redirect `/login` → `/auth` |
| `HeroSection.tsx` (landing) | Line 74 | `/login` → `/auth` |
| `PricingSection.tsx` | Lines 24, 41 | `/login` → `/auth` |
| `FeatureGrid.tsx` | Line 172 | `/login` → `/auth` |
| `AuthProvider.tsx` | Lines 163-164, 185-186 | Check `/auth`, redirect to `/studio` |
| `ProtectedRoute.tsx` | Line 17 | `/login` → `/auth` |
| `Credits.tsx` | Line 23 | `/login` → `/auth` |
| `DemoBanner.tsx` | Line 11 | `/login` → `/auth` |
| `HeroSection.tsx` (home) | Line 94 | `/login` → `/auth` |

---

## Additional Improvement

After successful login, users will be redirected to `/studio` instead of `/home` (which just redirects to `/landing` anyway). This provides a better user experience by taking authenticated users directly to the creative workspace.

---

## Expected Result

After these changes:
- Clicking "Start Creating Free" will go to `/auth?mode=signup` (working page)
- The `/login` route will redirect to `/auth` for backwards compatibility
- Protected routes will redirect to `/auth` when not logged in
- Successful login will redirect users to `/studio` (the actual product)
