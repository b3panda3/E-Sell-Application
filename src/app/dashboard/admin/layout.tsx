import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Sell Admin Dashboard',
  description: 'Manage education content and platform settings',
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {children}
    </div>
  );
}
