import SalesLayout from '../_shared/layouts/SalesLayout';

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/core" roleLabel="Core" showUserManagement>
      {children}
    </SalesLayout>
  );
}
