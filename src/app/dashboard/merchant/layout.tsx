'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Store,
  Package,
  Coins,
  Wallet,
  MessageSquare,
  Bell,
  Users,
  Settings,
  Trash2,
  Menu,
  LogOut,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

const NAV_ITEMS = [
  { href: '/dashboard/merchant', icon: LayoutDashboard, labelKey: 'dashboard.merchant.title', exact: true },
  { href: '/dashboard/merchant/storefront', icon: Store, labelKey: 'dashboard.merchant.myStorefront' },
  { href: '/dashboard/merchant/products', icon: Package, labelKey: 'dashboard.merchant.productsServices' },
  { href: '/dashboard/merchant/contracts', icon: Coins, labelKey: 'dashboard.merchant.contractDeployment' },
  { href: '/dashboard/merchant/wallets', icon: Wallet, labelKey: 'dashboard.merchant.walletAddresses' },
  { href: '/dashboard/merchant/messages', icon: MessageSquare, labelKey: 'dashboard.merchant.messages' },
  { href: '/dashboard/merchant/notifications', icon: Bell, labelKey: 'dashboard.merchant.notifications' },
  { href: '/dashboard/merchant/staff', icon: Users, labelKey: 'dashboard.merchant.staff' },
  { href: '/dashboard/merchant/settings', icon: Settings, labelKey: 'dashboard.merchant.settings' },
  { href: '/dashboard/merchant/delete', icon: Trash2, labelKey: 'dashboard.merchant.deleteAccount' },
];

function SidebarContent({
  pathname,
  onNavClick,
  t,
}: {
  pathname: string;
  onNavClick?: () => void;
  t: (key: string) => string;
}) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href) && href !== '/dashboard/merchant';
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="E-Sell" width={28} height={28} className="rounded-lg" />
          <span className="font-bold text-[#006633]">Merchant</span>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                active
                  ? 'bg-[#006633]/10 text-[#006633]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-[#006633]' : ''}`} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-red-600 hover:bg-red-50 w-full"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
}

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block overflow-hidden">
        <SidebarContent pathname={pathname} t={t} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex items-center justify-end p-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <SidebarContent
            pathname={pathname}
            t={t}
            onNavClick={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold text-[#006633]">Merchant Dashboard</h2>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
