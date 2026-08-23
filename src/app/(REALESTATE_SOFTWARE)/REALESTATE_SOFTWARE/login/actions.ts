'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

// 10 attempts per 15 minutes per email — generous for a real typo, tight
// enough to make password-guessing impractical. Keyed by email (not IP):
// this app's roles hold real payout authority, so the thing worth
// protecting is a specific account being brute-forced, not a shared
// office IP being penalized for one person's mistakes. Falls back to no
// limiting if Upstash isn't configured (redis is null), same as the
// existing contactRateLimiter in lib/redis.ts.
const loginRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      analytics: true,
      prefix: 'ratelimit:realestate-login',
    })
  : null

export async function loginAction(email: string, password: string) {
  try {
    const normalizedEmail = email.trim().toLowerCase()

    if (loginRateLimiter) {
      const { success } = await loginRateLimiter.limit(normalizedEmail)
      if (!success) {
        return { success: false, error: 'Too many login attempts. Please wait a few minutes and try again.' }
      }
    }

    const supabase = await createClient()
    const supabaseAdmin = createServiceClient()

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !signInData.user) {
      return { success: false, error: 'Invalid login credentials. Please try again.' }
    }

    // Now determine the redirect path
    let redirectPath = '/REALESTATE_SOFTWARE/login'

    // Role-based login
    const { data: userData } = await supabaseAdmin
      .from('s_realestate_users')
      .select('role')
      .eq('id', signInData.user.id)
      .single()
      
    const SALES_TIER_ROLES = ['director', 'sr_core', 'core', 'gm', 'agm', 'rm', 'lio', 'lia']

    if (userData) {
      switch(userData.role) {
        case 'it': redirectPath = '/REALESTATE_SOFTWARE/role/it'; break;
        case 'ceo': redirectPath = '/REALESTATE_SOFTWARE/role/ceo'; break;
        case 'governing_council': redirectPath = '/REALESTATE_SOFTWARE/role/GoverningCouncil'; break;
        case 'operation_manager': redirectPath = '/REALESTATE_SOFTWARE/role/OperationManager'; break;
        case 'customer': redirectPath = '/REALESTATE_SOFTWARE/role/Customer'; break;
        default:
          // director/sr_core/core/gm/agm/rm/lio/lia all share one
          // route pattern — the role string IS the URL segment
          // (HIERARCHY.md §8, §10 item 6).
          redirectPath = SALES_TIER_ROLES.includes(userData.role)
            ? `/REALESTATE_SOFTWARE/role/${userData.role}`
            : '/REALESTATE_SOFTWARE/role/it';
      }
    } else {
      // Fallback for some reason, maybe they are just an auth user with no profile yet
      redirectPath = '/REALESTATE_SOFTWARE/role/it'
    }

    return { success: true, redirectPath }
  } catch (error: any) {
    console.error('Login action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
