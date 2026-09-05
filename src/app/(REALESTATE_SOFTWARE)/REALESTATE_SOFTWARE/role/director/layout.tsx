import { createServiceClient } from '@/lib/supabase/server';
import { getSalesRoleLabel } from '../_shared/permissions';
import SalesLayout from '../_shared/layouts/SalesLayout';

export default async function DirectorLayout({ children }: { children: React.ReactNode }) {
  const roleLabel = await getSalesRoleLabel(createServiceClient(), 'director');
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/director" roleLabel={roleLabel} showUserManagement>
      {children}
    </SalesLayout>
  );
}
