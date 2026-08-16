import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Estate Software | BHUWANTA",
  description: "Real Estate Software section of the Bhuwanta platform",
};

export default function RealEstateSoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Software specific navbar/header can go here */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
