'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Loader2,
  Package,
  Store,
} from 'lucide-react';
import Link from 'next/link';

// ── Types ────────────────────────────────────────────────────────────────────

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string | null;
    priceNGN: number;
    priceCrypto: string | null;
    images: string | null;
    category: string | null;
    storefront: { id: string; storeName: string | null; userId: string };
  };
}

interface CartData {
  id: string;
  items: CartItemData[];
}

// ── Currency helpers ─────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  EUR: '€',
  GBP: '£',
  GHS: '₵',
  KES: 'KSh',
  ZAR: 'R',
  BNB: '◆',
  USDT: '₮',
  BTC: '₿',
  ETH: 'Ξ',
};

interface CryptoPriceData {
  amount: number;
  currency: string;
  originalCurrency: string;
  originalAmount: number;
}

function parseCryptoPrice(priceCrypto: string | null): CryptoPriceData | null {
  if (!priceCrypto) return null;
  try {
    const parsed = JSON.parse(priceCrypto);
    if (parsed && typeof parsed.amount === 'number' && parsed.currency) {
      return parsed as CryptoPriceData;
    }
  } catch {
    // Not JSON
  }
  return null;
}

function formatPriceWithCurrency(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  if (['BNB', 'USDT', 'BTC', 'ETH'].includes(currency)) {
    if (amount < 0.01) return `${amount.toExponential(2)} ${currency}`;
    if (amount < 1) return `${amount.toFixed(6)} ${currency}`;
    if (amount < 1000) return `${amount.toFixed(4)} ${currency}`;
    return `${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency}`;
  }
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function getItemTotalPrice(item: CartItemData): number {
  const cryptoData = parseCryptoPrice(item.product.priceCrypto);
  if (cryptoData) {
    return cryptoData.originalAmount * item.quantity;
  }
  return item.product.priceNGN * item.quantity;
}

function getItemUnitPrice(item: CartItemData): number {
  const cryptoData = parseCryptoPrice(item.product.priceCrypto);
  if (cryptoData) {
    return cryptoData.originalAmount;
  }
  return item.product.priceNGN;
}

function getItemCurrency(item: CartItemData): string {
  const cryptoData = parseCryptoPrice(item.product.priceCrypto);
  if (cryptoData) {
    return cryptoData.originalCurrency;
  }
  return 'NGN';
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CartPage() {
  const { t } = useTranslation();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      if (res.ok) {
        const updatedCart = await res.json();
        setCart(updatedCart);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update quantity');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  const removeItem = async (cartItemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });

      if (res.ok) {
        toast.success('Item removed from cart');
        fetchCart();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to remove item');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(cartItemId);
        return next;
      });
    }
  };

  // Group items by storefront
  const storefrontGroups = cart?.items.reduce(
    (acc, item) => {
      const sid = item.product.storefront.id;
      if (!acc[sid]) {
        acc[sid] = {
          storefront: item.product.storefront,
          items: [],
        };
      }
      acc[sid].items.push(item);
      return acc;
    },
    {} as Record<
      string,
      {
        storefront: CartItemData['product']['storefront'];
        items: CartItemData[];
      }
    >
  );

  const grandTotal = cart?.items.reduce((sum, item) => {
    return sum + getItemTotalPrice(item);
  }, 0) || 0;

  const totalCurrency = cart?.items.length ? getItemCurrency(cart.items[0]) : 'NGN';

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('dashboard.customer.cart')}
        </h1>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  // ── Empty Cart ─────────────────────────────────────────────────────────────

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('dashboard.customer.cart')}
        </h1>
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
              className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
              render={<Link href="/dashboard/customer/browse" />}
              nativeButton={false}
            >
              <Store className="h-4 w-4 mr-2" />
              {t('dashboard.customer.browseStores')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Cart with Items ────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.customer.cart')}
        </h1>
        <Badge variant="secondary" className="text-sm">
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Cart Items grouped by Storefront */}
        {Object.entries(storefrontGroups || {}).map(([storefrontId, group]) => (
          <Card key={storefrontId} className="overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            {/* Store Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {group.storefront.storeName || 'Store'}
              </h3>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {group.items.map((item) => {
                const images = item.product.images ? JSON.parse(item.product.images) : [];
                const firstImage = images[0] || null;
                const isUpdating = updatingItems.has(item.id);
                const currency = getItemCurrency(item);
                const unitPrice = getItemUnitPrice(item);
                const totalPrice = getItemTotalPrice(item);

                return (
                  <div
                    key={item.id}
                    className="p-4 flex items-center gap-4 relative"
                  >
                    {/* Product Image */}
                    <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                      {firstImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={firstImage}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {formatPriceWithCurrency(unitPrice, currency)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isUpdating}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Item Total */}
                    <p className="font-semibold text-gray-900 dark:text-white text-sm shrink-0 min-w-[80px] text-right">
                      {formatPriceWithCurrency(totalPrice, currency)}
                    </p>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isUpdating}
                      className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1"
                      title="Remove item"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {/* Cart Summary */}
        <Card className="dark:bg-gray-900 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Items ({cart.items.length})
                </span>
                <span className="text-gray-900 dark:text-white">
                  {formatPriceWithCurrency(grandTotal, totalCurrency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                <span className="text-gray-900 dark:text-white">
                  {formatPriceWithCurrency(0, totalCurrency)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPriceWithCurrency(grandTotal, totalCurrency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                className="w-full bg-[#006633] hover:bg-[#1B6B3A] text-white h-12 text-base font-semibold"
                render={<Link href="/dashboard/customer/checkout" />}
                nativeButton={false}
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                className="w-full h-10"
                render={<Link href="/dashboard/customer/browse" />}
                nativeButton={false}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
