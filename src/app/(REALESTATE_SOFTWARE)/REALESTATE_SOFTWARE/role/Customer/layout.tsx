import CustomerLayout from '../_shared/layouts/CustomerLayout';

export default function CustomerRootLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
