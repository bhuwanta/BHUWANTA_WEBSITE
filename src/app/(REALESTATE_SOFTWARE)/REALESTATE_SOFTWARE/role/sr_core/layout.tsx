import SalesLayout from '../_shared/layouts/SalesLayout';

export default function SrCoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/sr_core" roleLabel="Sr. Core" showUserManagement>
      {children}
    </SalesLayout>
  );
}
