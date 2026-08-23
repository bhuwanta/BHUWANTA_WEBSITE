import SalesLayout from '../_shared/layouts/SalesLayout';

export default function AGMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/agm" roleLabel="AGM" showUserManagement>
      {children}
    </SalesLayout>
  );
}
