'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MessageSquare, Coins, Shield, Plus, ArrowRight, Store } from 'lucide-react';
import Link from 'next/link';

export default function MerchantDashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  const userName = session?.user?.name || 'Merchant';

  const stats = [
    {
      title: t('dashboard.merchant.totalProducts'),
      value: '0',
      icon: Package,
      color: 'from-emerald-500 to-green-600',
    },
    {
      title: t('dashboard.merchant.messages'),
      value: '0',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-600',
    },
    {
      title: t('dashboard.merchant.tokenDeployments'),
      value: '0',
      icon: Coins,
      color: 'from-teal-500 to-emerald-600',
    },
    {
      title: t('dashboard.merchant.trustBadge'),
      value: 'RED',
      icon: Shield,
      color: 'from-red-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome')}, {userName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('dashboard.merchant.title')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* E-Sell Code */}
      {String((session?.user as Record<string, unknown>)?.esellCode) && (
        <Card className="bg-gradient-to-r from-[#006633] to-[#00875A] text-white dark:from-emerald-700 dark:to-emerald-600">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Your E-Sell Code</p>
                <p className="text-3xl font-bold tracking-wider mt-1">
                  {String((session?.user as Record<string, unknown> | undefined)?.esellCode ?? '')}
                </p>
                <p className="text-white/60 text-sm mt-1">Share this code with customers to find your store</p>
              </div>
              <Badge className="bg-white/20 text-white border-0">Merchant</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            className="h-auto py-4 px-6 bg-[#006633] hover:bg-[#1B6B3A] text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/merchant/products" />}
            nativeButton={false}
          >
            <Plus className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.addProduct')}</div>
              <div className="text-xs text-white/70">Add products & services</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            className="h-auto py-4 px-6 bg-[#00875A] hover:bg-[#006633] text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/merchant/contracts" />}
            nativeButton={false}
          >
            <Coins className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.deployToken')}</div>
              <div className="text-xs text-white/70">Create BEP-20 token</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            className="h-auto py-4 px-6 border-[#006633] text-[#006633] hover:bg-[#006633]/5 dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-400/10 flex items-center gap-3 justify-start"
            variant="outline"
            render={<Link href="/dashboard/merchant/storefront" />}
            nativeButton={false}
          >
            <Store className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.merchant.viewStorefront')}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Customize your store</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
}
