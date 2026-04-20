<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# BHUWANTA — Agent Guidelines

## Architecture Decisions

### Media Pipeline
- **Sanity is the single source of truth** for all images and videos
- No Supabase Storage for media — fully migrated to Sanity CDN
- Dashboard uploads go through `/api/media/upload` → Sanity Mutation API
- YouTube videos stored as string URLs in Sanity schemas (no file upload needed)

### Authentication
- Supabase handles auth via `@supabase/ssr` with cookie-based sessions
- Middleware (`src/lib/supabase/middleware.ts`) protects all `/dashboard/*` routes
- **Single admin lock:** Only `NEXT_PUBLIC_ADMIN_EMAIL` can access the dashboard
- Any other authenticated user is force-signed-out and redirected

### Content Architecture
- **Public pages:** Server Components that query Sanity (GROQ)
- **Dashboard pages:** Client Components that query Supabase (PostgREST)
- **Sanity Studio:** Embedded at `/studio` for content editors

## Design System Rules

### Colors (MUST follow)
| Token | Value | Usage |
|-------|-------|-------|
| Navy (dark) | `#0f1d33` | Headings, primary text |
| Navy (primary) | `#1e3a5f` | Active states, links, icons |
| Gold | `#c4a55a` | CTAs, badges, logo accent |
| White | `#ffffff` | Backgrounds, cards |
| Soft gray | `#f7f8fa` | Page backgrounds (dashboard) |
| Input bg | `#f3f5f8` | Form field backgrounds |
| Border | `#e8ecf2` | Card/input borders |
| Muted text | `#5a6a82` | Secondary text, labels |

### Component Patterns
- **Inputs:** `bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-3 py-2.5 text-[#0f1d33] text-sm`
- **Cards:** `bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-5`
- **Gold buttons:** `gradient-gold text-white font-semibold rounded-lg shadow-lg shadow-[#c4a55a]/20`
- **Tab active:** `bg-[#1e3a5f]/10 text-[#1e3a5f] border-b-2 border-[#1e3a5f]`
- **Tab inactive:** `text-[#5a6a82] hover:bg-[#f3f5f8]`
- **Status active:** `bg-emerald-50 text-emerald-600`
- **Status inactive:** `bg-red-50 text-red-600`

### DO NOT
- Use dark-mode utilities (`bg-white/5`, `border-white/10`, `bg-black/40`)
- Use `glass-card` or `gradient-dark` CSS classes
- Use generic color tokens like `text-foreground` — use explicit hex values
- Add new color tokens without updating this document

## File Change Checklist
When modifying dashboard pages:
1. ✅ Use explicit light-mode colors (no CSS variable tokens)
2. ✅ Inputs use `bg-[#f3f5f8]` background
3. ✅ Cards use `bg-white` with `border-[#e8ecf2]` and `shadow-sm`
4. ✅ Text uses `text-[#0f1d33]` for headings, `text-[#5a6a82]` for muted
5. ✅ Gold buttons use `gradient-gold text-white`
6. ✅ Status badges use light backgrounds (`bg-emerald-50`, `bg-red-50`)

When modifying public pages:
1. ✅ Navbar is white with navy text and gold CTA
2. ✅ Footer is white with navy headings and gold icon accents
3. ✅ Hero sections use navy gradient or soft gray
4. ✅ Content sections alternate white and `bg-[#f7f8fa]`

## Environment Setup
All sensitive keys are in `.env.local` (git-ignored). The app will crash on boot if:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` is missing or contains invalid characters
- Supabase URL/keys are missing (auth middleware will error)

## Changelog (Session: 2026-04-20)
1. Migrated media pipeline from Supabase Storage to Sanity-native
2. Built `/api/media/upload` Sanity Mutation API endpoint
3. Created `/dashboard/media` Media Manager page
4. Overhauled ALL public pages to White + Navy + Gold theme
5. Overhauled ALL dashboard pages (layout, login, 9 sub-pages) to light theme
6. Restricted dashboard access to single admin (`bhuwanta9@gmail.com`)
7. Created admin user in Supabase via service role API
8. Added password visibility toggle to login page
9. Added "Scroll" label to homepage hero scroll indicator
10. Fixed GalleryGrid import error
11. Resolved Sanity `projectId` validation error
