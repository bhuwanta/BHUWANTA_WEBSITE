import SalesLayout from '../_shared/layouts/SalesLayout';

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SalesLayout basePath="/REALESTATE_SOFTWARE/role/director" roleLabel="Director" showUserManagement>
      {children}
    </SalesLayout>
  );
}
