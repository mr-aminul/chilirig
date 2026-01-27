import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - ChiliRig",
  description: "Manage your ecommerce website",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {children}
    </div>
  );
}
