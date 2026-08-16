'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getModulesAction() {
  try {
    const supabaseAdmin = createServiceClient();
    const { data, error } = await supabaseAdmin
      .from('s_modules')
      .select('*')
      .order('module_name');
      
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    return { success: false, data: [] };
  }
}

export async function toggleModuleRoleAction(moduleId: string, roles: string[]) {
  try {
    const supabaseAdmin = createServiceClient();
    const { error } = await supabaseAdmin
      .from('s_modules')
      .update({ enabled_roles: roles })
      .eq('id', moduleId);

    if (error) throw error;
    
    revalidatePath('/REALESTATE_SOFTWARE/role/it/modules');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating module roles:', error);
    return { success: false, error: error.message };
  }
}

export async function ensurePasswordsModuleExists() {
  try {
    const supabaseAdmin = createServiceClient();
    
    // Check if it exists
    const { data: existing } = await supabaseAdmin
      .from('s_modules')
      .select('id')
      .eq('module_key', 'passwords')
      .maybeSingle();
      
    if (!existing) {
      await supabaseAdmin.from('s_modules').insert({
        module_key: 'passwords',
        module_name: 'Passwords & Security',
        description: 'Allows selected roles to reset their own passwords from their settings page.',
        enabled_roles: []
      });
    }
  } catch (error) {
    console.error('Error ensuring passwords module:', error);
  }
}
