import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function SrCoreLayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'sr_core');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/sr_core" roleLabel={roleLabel} showUserManagement>
      {children}
    </SalesLayout>
  );
}
