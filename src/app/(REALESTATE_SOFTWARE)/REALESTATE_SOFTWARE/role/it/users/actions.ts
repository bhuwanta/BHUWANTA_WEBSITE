'use server'

import { createServiceClient } from '@/lib/supabase/server'

export async function createExecutiveAction(data: {
  fullName: string
  phone: string
  role: 'partner' | 'wing_leader' | 'agent' | 'it'
  password?: string
  equitySplit?: number
}) {
  try {
    const supabaseAdmin = createServiceClient()

    // 1. Create the user in Supabase Auth using the Admin API
    const fakeEmail = `${data.phone.replace(/[^a-zA-Z0-9]/g, '')}@bhuwanta.erp`;
    console.log('Attempting to create Auth user with dummy email:', fakeEmail);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      email_confirm: true, // Auto-confirm the email
      password: data.password || undefined,
      user_metadata: {
        full_name: data.fullName,
        raw_phone: data.phone // store original here just in case
      },
    })

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { success: false, error: `Auth Error: ${authError.message}` }
    }

    console.log('Auth user created successfully with ID:', authData.user.id);
    const userId = authData.user.id

    // 2. Insert into public.S_realestate_users profile table
    console.log('Attempting to insert into s_realestate_users...');
    const { data: insertedUser, error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .insert({
        id: userId,
        phone: data.phone,
        full_name: data.fullName,
        role: data.role,
        is_active: true,
      })
      .select('bhuwanta_id')
      .single()

    if (profileError) {
      console.error('Error creating user profile (trigger may have failed):', profileError);
      // Cleanup the auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return { success: false, error: `Profile Error: ${profileError.message}` }
    }
    console.log('Profile created successfully with bhuwanta_id:', insertedUser?.bhuwanta_id);

    // 3. If Partner, insert master equity split into system_settings
    if (data.role === 'partner' && data.equitySplit !== undefined) {
      // NOTE: This logic assumes one global master split setting, 
      // or that equity splits are tracked differently. 
      // For now, we will log it. In a robust system, this might 
      // go into a partner_equity table or system_settings.
      // We will skip inserting into system_settings directly unless it's a global setting.
      console.log(`Created Partner with ${data.equitySplit}% equity`)
    }

    return { 
      success: true, 
      message: `Successfully created ${data.role.replace('_', ' ')}. ID: ${insertedUser?.bhuwanta_id}` 
    }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function getExecutivesAction(
  page: number = 1,
  limit: number = 50,
  searchQuery: string = '',
  roleFilter: 'all' | 'partner' | 'wing_leader' | 'agent' | 'it' = 'all',
  sortCol: string = 'created_at',
  sortDir: 'asc' | 'desc' = 'desc'
) {
  try {
    const supabaseAdmin = createServiceClient()
    
    let query = supabaseAdmin
      .from('s_realestate_users')
      .select('id, bhuwanta_id, full_name, role, phone, is_active, created_at', { count: 'exact' })
      
    if (roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,bhuwanta_id.ilike.%${searchQuery}%`)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(sortCol, { ascending: sortDir === 'asc' })
      .range(from, to)

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, data: [], count: 0 }
    }

    return { success: true, data: data || [], count: count || 0 }
  } catch (error) {
    console.error('Server action error:', error)
    return { success: false, data: [], count: 0 }
  }
}

export async function updateExecutiveAction(
  id: string,
  data: {
    fullName: string
    phone: string
    role: 'partner' | 'wing_leader' | 'agent' | 'it'
    password?: string
  }
) {
  try {
    const supabaseAdmin = createServiceClient()

    // 1. Update Auth User if password or phone changed
    const updateData: any = {}
    if (data.password) updateData.password = data.password
    if (data.phone) {
      const fakeEmail = `${data.phone.replace(/[^a-zA-Z0-9]/g, '')}@bhuwanta.erp`;
      updateData.email = fakeEmail;
      updateData.email_confirm = true;
    }
    updateData.user_metadata = { full_name: data.fullName, raw_phone: data.phone }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    if (authError) {
      console.error('Error updating auth user:', authError)
      return { success: false, error: `Auth Update Error: ${authError.message}` }
    }

    // 2. Update Profile Table
    const { error: profileError } = await supabaseAdmin
      .from('s_realestate_users')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        role: data.role,
      })
      .eq('id', id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return { success: false, error: `Profile Update Error: ${profileError.message}` }
    }

    return { success: true, message: `Successfully updated ${data.role.replace('_', ' ')}` }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}

export async function toggleExecutiveStatusAction(id: string, currentStatus: boolean) {
  try {
    const supabaseAdmin = createServiceClient()

    const { error } = await supabaseAdmin
      .from('s_realestate_users')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error toggling status:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: `Successfully ${!currentStatus ? 'activated' : 'deactivated'} user` }
  } catch (error: any) {
    console.error('Server action error:', error)
    return { success: false, error: error.message || 'An unexpected error occurred' }
  }
}
