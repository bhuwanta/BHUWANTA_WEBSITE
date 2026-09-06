import AdminLayout from '../_shared/layouts/AdminLayout';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout basePath="/REALESTATE_SOFTWARE/role/company" roleLabel="Company" showModules={false} showWallet>
      {children}
    </AdminLayout>
  );
}
