'use client';

import { useSession } from 'next-auth/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, ShoppingBag, MessageSquare, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  const userName = session?.user?.name || 'Customer';

  const stats = [
    {
      title: t('dashboard.customer.storesVisited'),
      value: '0',
      icon: Store,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      title: t('dashboard.customer.purchases'),
      value: '0',
      icon: ShoppingBag,
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: t('dashboard.customer.messages'),
      value: '0',
      icon: MessageSquare,
      color: 'from-purple-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('dashboard.welcome')}, {userName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {t('dashboard.customer.title')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust Badge */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <p className="text-white/80 text-sm font-medium">Trust Badge</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-red-500 text-white border-0">RED</Badge>
                <p className="text-white/60 text-sm">Start trading to earn a trust badge</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0">Customer</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            className="h-auto py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-3 justify-start"
            render={<Link href="/dashboard/customer/browse" />}
            nativeButton={false}
          >
            <Store className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.customer.browseStores')}</div>
              <div className="text-xs text-white/70">Discover merchants</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>

          <Button
            className="h-auto py-4 px-6 border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-3 justify-start"
            variant="outline"
            render={<Link href="/dashboard/customer/purchases" />}
            nativeButton={false}
          >
            <ShoppingBag className="h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">{t('dashboard.customer.myPurchases')}</div>
              <div className="text-xs text-gray-500">View purchase history</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>
    </div>
  );
}
