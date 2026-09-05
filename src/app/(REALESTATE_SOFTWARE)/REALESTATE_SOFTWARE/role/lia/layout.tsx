import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function LIALayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'lia');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/lia" roleLabel={roleLabel} showUserManagement={false}>
      {children}
    </SalesLayout>
  );
}
