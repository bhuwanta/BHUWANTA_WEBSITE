import SalesLayout from '../_shared/layouts/SalesLayout';

export default function LIOLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/lio" roleLabel="LIO" showUserManagement>
      {children}
    </SalesLayout>
  );
}
