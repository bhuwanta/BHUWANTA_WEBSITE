import AdminLayout from '../_shared/layouts/AdminLayout';

export default function GoverningCouncilLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout basePath="/REALESTATE_SOFTWARE/role/GoverningCouncil" roleLabel="Governing Council" showModules={false} showWallet>
      {children}
    </AdminLayout>
  );
}
