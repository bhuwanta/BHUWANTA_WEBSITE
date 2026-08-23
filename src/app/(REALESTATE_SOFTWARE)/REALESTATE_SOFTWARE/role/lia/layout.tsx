import SalesLayout from '../_shared/layouts/SalesLayout';

export default function LIALayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/lia" roleLabel="LIA" showUserManagement={false}>
      {children}
    </SalesLayout>
  );
}
