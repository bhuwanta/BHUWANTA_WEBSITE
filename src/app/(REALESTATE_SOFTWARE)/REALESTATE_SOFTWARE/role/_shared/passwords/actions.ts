'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function checkPasswordsModuleStatusAction(role: string) {
  try {
    const supabaseAdmin = createServiceClient();
    const { data, error } = await supabaseAdmin
      .from('s_modules')
      .select('enabled_roles')
      .eq('module_key', 'passwords')
      .maybeSingle();

    if (error) throw error;

    const isEnabled = data && data.enabled_roles && Array.isArray(data.enabled_roles)
      ? data.enabled_roles.includes(role)
      : false;

    return { success: true, isEnabled };
  } catch (error: any) {
    console.error('Error checking module status:', error);
    return { success: false, isEnabled: false };
  }
}

export async function updatePasswordAction(newPassword: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error updating password:', error);
    return { success: false, error: error.message };
  }
}
