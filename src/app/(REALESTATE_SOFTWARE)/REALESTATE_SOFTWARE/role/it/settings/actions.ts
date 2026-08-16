'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function createServiceClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function resetPasswordByBhuwantaIdAction(bhuwantaId: string, newPassword: string) {
  try {
    const supabaseAdmin = createServiceClient()

    // 1. Find the user by bhuwanta_id
    const { data: userData, error: findError } = await supabaseAdmin
      .from('s_realestate_users')
      .select('id, full_name, role')
      .eq('bhuwanta_id', bhuwantaId.toUpperCase())
      .single()

    if (findError || !userData) {
      console.error('User not found:', findError)
      return { success: false, error: 'User with this Bhuwanta ID not found. Please check and try again.' }
    }

    // 2. Reset the password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.id, {
      password: newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return { success: false, error: updateError.message }
    }

    return { 
      success: true, 
      message: `Successfully reset password for ${userData.full_name} (${userData.role.replace('_', ' ')})` 
    }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
