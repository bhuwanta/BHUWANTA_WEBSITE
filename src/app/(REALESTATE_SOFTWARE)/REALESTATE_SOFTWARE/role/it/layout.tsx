import AdminLayout from '../_shared/layouts/AdminLayout';

export default function ITLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout basePath="/REALESTATE_SOFTWARE/role/it" roleLabel="IT Admin">
      {children}
    </AdminLayout>
  );
}
