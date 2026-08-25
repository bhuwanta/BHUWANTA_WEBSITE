import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // A Server Action POSTs to the exact same URL as the page it's called
  // from, carrying this header (next/dist/esm/client/components/
  // app-router-headers.js's ACTION_HEADER). If any of the redirect
  // branches below fire for one of these requests, the browser's
  // fetchServerAction gets back an HTML redirect instead of the
  // RSC-encoded action result it expects and throws "An unexpected
  // response was received from the server" — not a code bug in the
  // action itself, just this proxy stepping on the action protocol.
  // Safe to skip: every mutating action in this codebase already calls
  // verifyCaller() (and the RBAC blocks below are explicitly documented
  // as a second, independent layer on top of that per-page/per-action
  // check, not the only one), so unauthenticated/wrong-role callers
  // still get rejected — as a normal JSON {success:false} response
  // instead of a redirect that breaks the client action fetcher.
  if (request.headers.get('next-action')) {
    return supabaseResponse
  }

  // If no user and trying to access admin dashboard, redirect to login
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/crm') &&
    request.nextUrl.pathname !== '/crm/login'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/crm/login'
    return NextResponse.redirect(url)
  }

  // If user is trying to access login or signup but already logged in, redirect to admin
  // Unless they are disabled, in which case we sign them out and redirect to login
  if (user && user.user_metadata?.is_disabled) {
    if (request.nextUrl.pathname.startsWith('/crm')) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/crm/login'
      return NextResponse.redirect(url)
    }
  } else if (
    user &&
    (request.nextUrl.pathname === '/crm/login' || request.nextUrl.pathname === '/signup')
  ) {
    const userRole = user.user_metadata?.role || 'Admin'
    const url = request.nextUrl.clone()
    url.pathname = userRole === 'Telecaller' ? '/crm/leads' : '/crm'
    return NextResponse.redirect(url)
  }

  // RBAC for Telecallers: Restrict to /crm/leads
  if (
    user &&
    user.user_metadata?.role === 'Telecaller' &&
    request.nextUrl.pathname.startsWith('/crm') &&
    !request.nextUrl.pathname.startsWith('/crm/leads') &&
    request.nextUrl.pathname !== '/crm/login'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/crm/leads'
    return NextResponse.redirect(url)
  }

  // REALESTATE_SOFTWARE RBAC — defense-in-depth alongside each page's own
  // requireRole() call (role/_shared/auth.ts). That per-page check is the
  // primary guard; this is a second, independent layer at the edge so a
  // page that ever forgot to call it wouldn't be silently unprotected.
  // Uses the anon-key client (already built above with the visitor's own
  // cookies) against S_realestate_users' "Users can view own profile" RLS
  // policy (auth.uid() = id) — deliberately NOT the service-role client,
  // since that requires a Node `require()` that Edge middleware can't run.
  if (request.nextUrl.pathname.startsWith('/REALESTATE_SOFTWARE/role/')) {
    const segment = request.nextUrl.pathname.split('/')[3]
    // Falls back to the raw segment itself for any role not in the
    // static map — every sales-tier role's URL segment already equals
    // its role code by convention (director, rm, sr_core, ...), which
    // is exactly how a role created via the Commission Rates page
    // (migration 008 / S_role_definitions) is routed too. Only the
    // PascalCase admin-peer/standalone exceptions (GoverningCouncil,
    // OperationManager, Customer) need the static map at all.
    const expectedRole = REALESTATE_ROLE_BY_PATH_SEGMENT[segment] || segment

    if (expectedRole) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/REALESTATE_SOFTWARE/login'

      if (!user) {
        return NextResponse.redirect(loginUrl)
      }

      const { data: profile } = await supabase
        .from('s_realestate_users')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (!profile || profile.role !== expectedRole || !profile.is_active) {
        return NextResponse.redirect(loginUrl)
      }
    }
  }

  return supabaseResponse
}

const REALESTATE_ROLE_BY_PATH_SEGMENT: Record<string, string> = {
  it: 'it',
  ceo: 'ceo',
  GoverningCouncil: 'governing_council',
  OperationManager: 'operation_manager',
  Customer: 'customer',
  director: 'director',
  sr_core: 'sr_core',
  core: 'core',
  gm: 'gm',
  agm: 'agm',
  rm: 'rm',
  lio: 'lio',
  lia: 'lia',
}
