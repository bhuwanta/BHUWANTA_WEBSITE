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

  return supabaseResponse
}
