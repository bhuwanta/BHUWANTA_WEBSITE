'use server'

import { createClient } from '@supabase/supabase-js'
import { sendUserCredentials } from '@/lib/resend'

export async function addAdminUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string || 'Admin'
  const name = formData.get('name') as string || ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  // Use the service role key to bypass RLS and create users without signing in
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. First create the user with a role allowed by the profiles table check constraint
  // The profiles table only allows: 'Admin', 'Sales Manager', 'Sales Executive'
  // If we pass 'Telecaller' during creation, the database trigger might fail on the check constraint
  const tempRole = role === 'Telecaller' ? 'Sales Executive' : role;
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: tempRole, full_name: name }
  })

  if (error) {
    return { error: error.message }
  }

  // 2. Now update the user metadata to the actual role (e.g. Telecaller) in auth.users
  if (data?.user && role !== tempRole) {
    await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      user_metadata: { role: role, full_name: name }
    })
  }

  // 3. Update the profiles table separately (this might fail if the check constraint doesn't allow Telecaller, but we catch it)
  if (data?.user) {
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: role, name: name })
      .eq('id', data.user.id)
      
    if (updateError) {
      console.error("Failed to update profiles table (likely due to check constraint):", updateError.message)
      // We don't return an error here because the user was created successfully in auth.users
    }

    // Send credentials email
    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://bhuwanta.com'}/crm/login`
    await sendUserCredentials(email, name, role, password, loginUrl)
  }

  return { success: true, user: data.user }
}

export async function listAdminUsers() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { data, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    return { error: error.message }
  }

  return { 
    success: true, 
    users: data.users.map(u => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      is_disabled: u.user_metadata?.is_disabled || false,
      role: u.user_metadata?.role || 'admin',
      name: u.user_metadata?.full_name || ''
    })) 
  }
}

export async function deleteAdminUser(id: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function changeAdminPassword(formData: FormData) {
  const id = formData.get('id') as string
  const password = formData.get('password') as string
  if (!id || !password) return { error: 'ID and new password are required' }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleAdminStatus(id: string, disable: boolean) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    user_metadata: { is_disabled: disable }
  })
  if (error) return { error: error.message }
  return { success: true }
}
