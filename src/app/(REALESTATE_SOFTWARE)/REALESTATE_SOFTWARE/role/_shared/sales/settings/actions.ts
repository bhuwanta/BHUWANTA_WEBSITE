'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../../auth'
import { validatePassword } from '../../password-policy'

/** Self-service password change — every sales tier and Customer gets
 * this (§8/§9's "Settings" page, same pattern everywhere). Not the
 * admin-side force-reset-anyone tool (that's admin/settings/actions.ts,
 * IT/CEO/GC only) — this only ever touches the verified caller's own
 * account. */
export async function changeOwnPasswordAction(newPassword: string) {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, error: 'Not authenticated.' }

    const passwordError = validatePassword(newPassword)
    if (passwordError) return { success: false, error: passwordError }

    const supabaseAdmin = createServiceClient()
    const { error } = await supabaseAdmin.auth.admin.updateUserById(caller.id, { password: newPassword })
    if (error) throw error

    return { success: true, message: 'Password updated successfully.' }
  } catch (error: any) {
    console.error('Error changing own password:', error)
    return { success: false, error: error.message || 'Failed to update password.' }
  }
}
