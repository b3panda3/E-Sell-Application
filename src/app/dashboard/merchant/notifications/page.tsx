'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
          {t('dashboard.merchant.notifications')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Stay updated with orders, messages, and account activity
        </p>
      </div>

      {/* Coming Soon Card */}
      <Card className="dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#006633] to-[#00875A] flex items-center justify-center">
            <Bell className="h-10 w-10 text-white" />
          </div>
          <Badge className="bg-[#006633]/10 text-[#006633] dark:bg-emerald-400/10 dark:text-emerald-400 mb-4">
            Coming Soon
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Notifications Center
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Get real-time alerts for new orders, customer messages, payment confirmations, 
            trust badge updates, and more. Never miss an important event on your store.
          </p>
        </CardContent>
      </Card>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Order Alerts
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Instant notifications for new orders and payments
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              Performance Updates
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Weekly stats on store visits, sales, and trends
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#006633]/10 dark:bg-emerald-400/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
              System Alerts
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Important updates about your account and security
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
