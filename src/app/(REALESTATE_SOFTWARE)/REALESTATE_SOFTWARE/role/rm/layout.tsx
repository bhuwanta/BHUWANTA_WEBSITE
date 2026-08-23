import SalesLayout from '../_shared/layouts/SalesLayout';

export default function RMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/rm" roleLabel="RM" showUserManagement>
      {children}
    </SalesLayout>
  );
}
