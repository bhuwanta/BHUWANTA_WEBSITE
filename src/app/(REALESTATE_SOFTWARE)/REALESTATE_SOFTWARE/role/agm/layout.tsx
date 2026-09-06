import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function AGMLayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'agm');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/agm" roleLabel={roleLabel} showUserManagement>
      {children}
    </SalesLayout>
  );
}
