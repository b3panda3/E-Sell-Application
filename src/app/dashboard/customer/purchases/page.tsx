'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Package, CreditCard, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PurchasesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          {t('dashboard.customer.myPurchases')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your orders and purchase history
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Purchase History
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            View all your past purchases, track order status, download receipts, 
            and re-order from your favorite stores — all in one place.
          </p>
          <div className="mt-6">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              render={<Link href="/dashboard/customer/browse" />}
              nativeButton={false}
            >
              Browse Stores
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Order Tracking
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Real-time tracking for all your purchases
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Payment Receipts
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Download and review receipts for all transactions
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Order History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Complete timeline of all your past purchases
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
