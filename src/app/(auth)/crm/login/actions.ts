'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.user?.user_metadata?.is_disabled) {
    await supabase.auth.signOut()
    return { error: 'This account has been disabled by the administrator.' }
  }

  if (data?.user?.user_metadata?.role === 'Telecaller') {
    redirect('/crm/leads')
  } else {
    redirect('/crm')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/crm')
}
