@AGENTS.md

# BHUWANTA Real Estate Platform

## Project Overview
Premium real estate website for Bhuwanta, built with Next.js 16, Sanity CMS, Supabase Auth, and Tailwind CSS v4.

## Tech Stack
- **Framework:** Next.js 16.2.4 (App Router, Turbopack)
- **CMS:** Sanity v5 (headless, Studio embedded at `/studio`)
- **Auth:** Supabase (email/password, session-based)
- **Styling:** Tailwind CSS v4 with custom design tokens
- **Email:** Resend
- **Analytics:** PostHog
- **Error Monitoring:** Sentry
- **Rate Limiting:** Upstash Redis
- **Deployment:** Vercel

## Design System — White + Navy Blue + Gold
All pages (public and dashboard) use a unified premium light-mode palette:
- **Background:** `#ffffff` (white), `#f7f8fa` (soft gray for content areas)
- **Navy (primary text/headings):** `#0f1d33` (foreground), `#1e3a5f` (primary)
- **Gold (accents/CTAs):** `#c4a55a` (gradient-gold class)
- **Muted text:** `#5a6a82`
- **Borders:** `#e8ecf2`
- **Input backgrounds:** `#f3f5f8`

### Key CSS Classes
- `gradient-gold` — Gold gradient for buttons and logo accents
- `animated-underline` — Hover underline animation for nav links
- `transition-premium` — Smooth 400ms transition

## Project Structure
```
src/
├── app/
│   ├── (public)/          # Public pages with Navbar + Footer layout
│   │   ├── page.tsx       # Homepage (hero, features, about teaser, CTA)
│   │   ├── about/         # About page
│   │   ├── projects/      # Projects listing
│   │   ├── gallery/       # Gallery with GalleryGrid component
│   │   ├── blog/          # Blog listing
│   │   ├── careers/       # Job listings
│   │   └── contact/       # Contact form (ContactForm component)
│   ├── dashboard/         # Admin dashboard (Supabase auth-protected)
│   │   ├── layout.tsx     # White sidebar + header layout
│   │   ├── login/         # Auth login page
│   │   ├── page.tsx       # Overview with stats + quick actions
│   │   ├── media/         # Media Manager (Sanity CDN upload)
│   │   ├── jobs/          # Job post CRUD
│   │   ├── leads/         # Lead management + CSV export
│   │   ├── seo/           # Global + per-page SEO settings
│   │   ├── aeo-geo/       # FAQ manager + local business schema
│   │   ├── email/         # Email templates + campaigns (Resend)
│   │   ├── analytics/     # PostHog integration placeholder
│   │   └── settings/      # Site config (GA, GTM, FB Pixel, Sentry)
│   ├── studio/            # Sanity Studio (embedded)
│   └── api/               # API routes
│       ├── contact/       # Contact form submission
│       ├── media/upload/  # Sanity mutation API for media uploads
│       └── revalidate/    # On-demand ISR revalidation
├── components/
│   └── layout/
│       ├── Navbar.tsx     # White nav, navy text, gold CTA
│       └── Footer.tsx     # White footer, navy headings, gold icons
├── lib/
│   ├── sanity.ts          # Sanity client + image URL builder
│   └── supabase/          # Supabase client (browser + server + middleware)
└── sanity/
    └── schemas/           # Sanity document schemas
```

## Authentication & Authorization
- **Single admin access:** Only `bhuwanta9@gmail.com` can access `/dashboard`
- Enforced in `src/lib/supabase/middleware.ts`
- Unauthorized users are signed out and redirected with error message
- Admin email configured via `NEXT_PUBLIC_ADMIN_EMAIL` env var

## Environment Variables Required
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID    # Must be valid (a-z, 0-9, dashes only)
NEXT_PUBLIC_SANITY_DATASET       # Usually "production"
SANITY_API_TOKEN                 # Editor permissions from manage.sanity.io

# Services
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
RESEND_API_KEY
RESEND_FROM_EMAIL
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN

# Site
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_ADMIN_EMAIL          # Authorized dashboard user
REVALIDATION_SECRET
```

## Important Conventions
1. **Public pages** fetch data from Sanity and render server-side
2. **Dashboard pages** are client components that fetch from Supabase directly
3. **Media uploads** go through `/api/media/upload` which mutates Sanity via API token
4. **All inputs** in the dashboard use `bg-[#f3f5f8] border border-[#e8ecf2]` styling
5. **All cards** use `bg-white border border-[#e8ecf2] shadow-sm rounded-xl`
6. **Gold buttons** use `gradient-gold text-white` with `shadow-lg shadow-[#c4a55a]/20`
7. **Status badges** use light bg variants (e.g., `bg-emerald-50 text-emerald-600`)

## Common Commands
```bash
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check
```
