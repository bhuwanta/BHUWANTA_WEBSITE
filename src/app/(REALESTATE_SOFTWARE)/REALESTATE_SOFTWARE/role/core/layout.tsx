import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function CoreLayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'core');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/core" roleLabel={roleLabel} showUserManagement>
      {children}
    </SalesLayout>
  );
}
