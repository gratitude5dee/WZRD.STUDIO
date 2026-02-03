
# Fix Landing & Home Pages - Remove Mog Branding

## Problem Identified

The current `src/pages/Landing.tsx` file contains the **entire Mog streaming platform** landing page:
- "Mog" logo and wordmark throughout
- Streaming revenue, creator economy messaging
- "Mog the internet. Own the culture." tagline
- Monad blockchain, pay-per-stream features
- Creator testimonials about "Mog" earnings

Meanwhile, proper WZRD.STUDIO landing components already exist in `src/components/landing/`:
- `HeroSection.tsx` - Studio-focused hero with "Start Creating Free"
- `Features.tsx` - AI Workflow Builder features (bento grid)
- `PricingSection.tsx` - Pricing cards
- `TestimonialsSection.tsx` - Creator testimonials
- `FAQSection.tsx` - FAQ accordion
- `StickyFooter.tsx` - Footer navigation

## Solution

### 1. Replace `src/pages/Landing.tsx`

Completely rewrite the landing page to use WZRD.STUDIO branding and the existing studio-focused components:

**New Structure:**
```text
Landing.tsx
├── Navigation bar with WZRD.STUDIO logo
├── HeroSection (existing component)
│   ├── Headline: "Create Stunning AI Content"
│   ├── Subheadline: "Visual workflow editor for AI"
│   └── CTAs: "Start Creating Free" / "Watch Demo"
├── Features (existing bento grid)
│   ├── AI Workflow Builder (large card)
│   ├── Lightning Fast generation
│   ├── Multiple AI Models
│   ├── Secure & Private
│   ├── Team Collaboration
│   └── Export Anywhere
├── Tech Partners / Powered By section
├── PricingSection (existing)
├── TestimonialsSection (existing)
├── FAQSection (existing)
└── StickyFooter (existing)
```

**Branding Changes:**
- Logo: WZRD.STUDIO (use existing logo component)
- Colors: Purple gradient theme (#8b5cf6)
- Background: Dark (#0a0a0a) with gradient overlays
- Messaging: AI creative platform, workflow builder, content generation

### 2. Update Route in `src/App.tsx`

Keep the redirect but ensure `/home` → `/landing` shows the correct page:
- `/` → Intro animation → `/landing`
- `/home` → Redirect to `/landing`
- `/landing` → New WZRD.STUDIO landing page

### 3. Update `index.html` Metadata (if needed)

Verify the metadata reflects WZRD.STUDIO:
- Title: "WZRD.STUDIO - AI Creative Platform"
- Description: Focus on AI workflow, content generation

### 4. Files to Modify

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | **Replace entirely** - Remove Mog, use WZRD.STUDIO components |
| `src/App.tsx` | Verify routes (likely no change needed) |

### 5. Components to Use (Already Exist)

- `@/components/landing/HeroSection`
- `@/components/landing/Features`
- `@/components/landing/PricingSection`
- `@/components/landing/TestimonialsSection`
- `@/components/landing/FAQSection`
- `@/components/landing/StickyFooter`
- `@/components/ui/logo` (WZRD logo)

## Expected Result

After this change:
- `/landing` and `/home` show the **WZRD.STUDIO AI Creative Platform** landing page
- All Mog references (streaming, creator economy, blockchain payments) are removed
- The landing page showcases the AI Workflow Builder as the core product
- Dark theme with purple accents consistent with the Studio page
