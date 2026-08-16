'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(identifier: string, password: string) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createServiceClient()
    
    const isEmail = identifier.includes('@')
    let loginEmail = identifier

    if (!isEmail) {
      // Find user by Bhuwanta ID or phone in public.S_realestate_users
      const { data: userData, error: findError } = await supabaseAdmin
        .from('s_realestate_users')
        .select('phone, role, is_active')
        .or(`bhuwanta_id.eq.${identifier.toUpperCase()},phone.eq.${identifier}`)
        .single()

      if (findError || !userData) {
        return { success: false, error: 'User not found. Please check your ID or phone number.' }
      }

      if (!userData.is_active) {
        return { success: false, error: 'Your account has been deactivated. Please contact support.' }
      }

      // Reconstruct the dummy email we used to bypass E.164 requirements
      loginEmail = `${userData.phone.replace(/[^a-zA-Z0-9]/g, '')}@bhuwanta.erp`
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (signInError || !signInData.user) {
      return { success: false, error: 'Invalid login credentials. Please try again.' }
    }

    // Now determine the redirect path
    let redirectPath = '/REALESTATE_SOFTWARE/login'

    if (isEmail) {
      // Direct email login (e.g., admin email)
      redirectPath = '/REALESTATE_SOFTWARE/role/it'
    } else {
      // Role-based login
      const { data: userData } = await supabaseAdmin
        .from('s_realestate_users')
        .select('role')
        .eq('id', signInData.user.id)
        .single()
        
      if (userData) {
        switch(userData.role) {
          case 'it': redirectPath = '/REALESTATE_SOFTWARE/role/it'; break;
          case 'partner': redirectPath = '/REALESTATE_SOFTWARE/role/Partner'; break;
          case 'wing_leader': redirectPath = '/REALESTATE_SOFTWARE/role/Wing_Leader'; break;
          case 'agent': redirectPath = '/REALESTATE_SOFTWARE/role/Agent'; break;
          case 'customer': redirectPath = '/REALESTATE_SOFTWARE/role/Customer'; break;
          default: redirectPath = '/REALESTATE_SOFTWARE/role/it';
        }
      } else {
        // Fallback for some reason
        redirectPath = '/REALESTATE_SOFTWARE/role/it'
      }
    }

    return { success: true, redirectPath }
  } catch (error: any) {
    console.error('Login action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
