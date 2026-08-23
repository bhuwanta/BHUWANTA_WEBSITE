import SalesLayout from '../_shared/layouts/SalesLayout';

export default function GMLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/gm" roleLabel="GM" showUserManagement>
      {children}
    </SalesLayout>
  );
}
