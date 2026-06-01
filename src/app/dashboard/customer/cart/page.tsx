'use client';

import { useTranslation } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { t } = useTranslation();

  // Placeholder — cart will be populated from the database in Phase 2
  const cartItems: unknown[] = [];

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboard.customer.cart')}</h1>
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('dashboard.customer.cartEmpty')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Browse stores and add products to your cart to get started.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              render={<Link href="/dashboard/customer/browse" />}
              nativeButton={false}
            >
              {t('dashboard.customer.browseStores')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboard.customer.cart')}</h1>
      <div className="space-y-4">
        {/* Cart items will be mapped here in Phase 2 */}
      </div>
      <Card className="mt-6 dark:bg-gray-900 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</span>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold">
            {t('dashboard.customer.checkout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
