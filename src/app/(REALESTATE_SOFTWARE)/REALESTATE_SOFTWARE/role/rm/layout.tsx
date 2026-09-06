import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function RMLayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'rm');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/rm" roleLabel={roleLabel} showUserManagement>
      {children}
    </SalesLayout>
  );
}
