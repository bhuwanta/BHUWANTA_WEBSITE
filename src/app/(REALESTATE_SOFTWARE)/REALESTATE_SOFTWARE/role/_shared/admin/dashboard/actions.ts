'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { verifyCaller } from '../../auth'
import { ROLE_LABELS, getSalesRoleOrder } from '../../permissions'

/** CEO/GC earn commission (§3a); IT doesn't, so IT's dashboard skips
 * this call entirely (see AdminDashboard.tsx). Deliberately takes no
 * userId parameter — earnings are always the verified caller's own, so
 * there's no client-suppliable id for one admin peer to pull another's
 * (e.g. IT reading CEO's commission) even via a direct Server Action
 * call bypassing the UI. */
export async function getMyEarningsAction() {
  try {
    const caller = await verifyCaller()
    if (!caller) return { success: false, totalEarned: 0, totalPaid: 0, totalPending: 0 }

    const supabaseAdmin = createServiceClient()
    const { data, error } = await supabaseAdmin
      .from('s_sales_payouts')
      .select('amount, payout_status')
      .eq('payee_id', caller.id)

    if (error) throw error

    const total = (data || []).reduce((sum: number, row: any) => sum + Number(row.amount), 0);
    const paid = (data || []).filter((r: any) => r.payout_status === 'completed').reduce((sum: number, row: any) => sum + Number(row.amount), 0);

    // Computed here so no client component ever subtracts these two
    // figures itself.
    return { success: true, totalEarned: total, totalPaid: paid, totalPending: total - paid };
  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    return { success: false, totalEarned: 0, totalPaid: 0, totalPending: 0 };
  }
}

export async function getAdminDashboardStatsAction() {
  try {
    const caller = await verifyCaller()
    const supabaseAdmin = createServiceClient()

    const [usersRes, areasRes, projectsRes, registrationsRes, rateRes] = await Promise.all([
      supabaseAdmin.from('s_realestate_users').select('role', { count: 'exact', head: false }),
      supabaseAdmin.from('s_areas').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('s_projects').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('s_new_registrations').select('status'),
      // CEO/Governing Council's own tier % (§3a) — IT has no row in
      // S_commission_rates at all (not commission-eligible), so this
      // naturally resolves to null for IT without any special-casing.
      caller ? supabaseAdmin.from('s_commission_rates').select('percentage').eq('role', caller.role).maybeSingle() : Promise.resolve({ data: null }),
    ])

    const commissionPercentage = rateRes.data ? Number((rateRes.data as any).percentage) : null

    const usersByRole: Record<string, number> = {};
    (usersRes.data || []).forEach((u: any) => {
      usersByRole[u.role] = (usersByRole[u.role] || 0) + 1;
    });

    const registrationCounts = { pending_registration: 0, registration_done: 0, cancelled: 0 };
    (registrationsRes.data || []).forEach((r: any) => {
      if (r.status in registrationCounts) {
        registrationCounts[r.status as keyof typeof registrationCounts]++;
      }
    });

    // Present in a stable, meaningful order (admin peers first, then the
    // real sales-tier cascade top-to-bottom — built-in + any
    // admin-created roles, from S_role_definitions) rather than
    // whatever order the DB returns.
    const salesRoleOrder = await getSalesRoleOrder(supabaseAdmin)
    const roleOrder = ['it', 'ceo', 'governing_council', ...salesRoleOrder.map((r) => r.role_code), 'customer'];
    const dynamicLabels = new Map(salesRoleOrder.map((r) => [r.role_code, r.label]));
    // CEO/Governing Council's renamed labels (migration 011) — a direct
    // query rather than going through getFixedRoleLabelsAction, since
    // this is already server-side in the same request.
    const { data: fixedLabelRows } = await supabaseAdmin.from('s_role_labels').select('role_code, label')
    ;(fixedLabelRows || []).forEach((r: any) => dynamicLabels.set(r.role_code, r.label))
    const usersByRoleOrdered = roleOrder
      .filter((r) => usersByRole[r])
      // dynamicLabels checked first — see the identical comment in
      // CommissionRatesPage.tsx's roleLabel(): the 8 built-in sales-tier
      // roles already have a static ROLE_LABELS entry, which would
      // otherwise always shadow a rename.
      .map((r) => ({ role: r, label: dynamicLabels.get(r) || ROLE_LABELS[r as keyof typeof ROLE_LABELS] || r, count: usersByRole[r] }));

    return {
      success: true,
      totalUsers: (usersRes.data || []).length,
      usersByRole: usersByRoleOrdered,
      totalAreas: areasRes.count || 0,
      totalProjects: projectsRes.count || 0,
      registrationCounts,
      commissionPercentage,
    };
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      totalUsers: 0,
      usersByRole: [],
      totalAreas: 0,
      totalProjects: 0,
      registrationCounts: { pending_registration: 0, registration_done: 0, cancelled: 0 },
      commissionPercentage: null as number | null,
    };
  }
}
