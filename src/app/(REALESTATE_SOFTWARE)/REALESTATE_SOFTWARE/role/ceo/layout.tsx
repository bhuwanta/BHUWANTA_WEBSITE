import { createServiceClient } from '@/lib/supabase/server';
import AdminLayout from '../_shared/layouts/AdminLayout';
import { getFixedRoleLabel } from '../_shared/permissions';

export default async function CEOLayout({ children }: { children: React.ReactNode }) {
  // Read live rather than hardcoding "CEO": this role is relabelled
  // "Company" (S_role_labels, migration 014), and a future rename on
  // Roles / Commissions should reach the sidebar too — same reason the
  // sales-tier layouts use getSalesRoleLabel instead of a literal.
  const roleLabel = await getFixedRoleLabel(createServiceClient(), 'ceo');

  return (
    <AdminLayout basePath="/REALESTATE_SOFTWARE/role/ceo" roleLabel={roleLabel} showModules={false} showWallet showNewRegistration>
      {children}
    </AdminLayout>
  );
}
