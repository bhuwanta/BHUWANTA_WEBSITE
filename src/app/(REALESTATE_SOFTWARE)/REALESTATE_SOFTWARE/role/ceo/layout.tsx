import AdminLayout from '../_shared/layouts/AdminLayout';

export default function CEOLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout basePath="/REALESTATE_SOFTWARE/role/ceo" roleLabel="CEO" showModules={false} showWallet>
      {children}
    </AdminLayout>
  );
}
