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

    // Revalidate all three admin shells — any of IT/CEO/GC can toggle this.
    revalidatePath('/REALESTATE_SOFTWARE/role/it/modules');
    revalidatePath('/REALESTATE_SOFTWARE/role/ceo/modules');
    revalidatePath('/REALESTATE_SOFTWARE/role/GoverningCouncil/modules');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating module roles:', error);
    return { success: false, error: error.message };
  }
}

export async function ensurePasswordsModuleExists() {
  try {
    const supabaseAdmin = createServiceClient();

    const { data: existing } = await supabaseAdmin
      .from('s_modules')
      .select('id')
      .eq('module_key', 'passwords')
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from('s_modules').insert({
        module_key: 'passwords',
        module_name: 'Passwords & Security',
        description: 'Allows selected sales-tier roles to reset their own passwords from their settings page.',
        enabled_roles: []
      });
    }
  } catch (error) {
    console.error('Error ensuring passwords module:', error);
  }
}

export async function ensureUserManagementModuleExists() {
  try {
    const supabaseAdmin = createServiceClient();

    const { data: existing } = await supabaseAdmin
      .from('s_modules')
      .select('id')
      .eq('module_key', 'user_management')
      .maybeSingle();

    if (!existing) {
      // Default-on for the whole sales chain (HIERARCHY.md §2 — every
      // tier from Director through LIO has downline creation rights;
      // LIA has no downline so the module has no effect for it either
      // way, harmless to include).
      await supabaseAdmin.from('s_modules').insert({
        module_key: 'user_management',
        module_name: 'User Management',
        description: 'Allows selected sales-tier roles to view, create, and manage their downline.',
        enabled_roles: ['director', 'sr_core', 'core', 'gm', 'agm', 'rm', 'lio']
      });
    }
  } catch (error) {
    console.error('Error ensuring user management module:', error);
  }
}
