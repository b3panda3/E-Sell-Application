'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Coins,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaystackCheckout from '@/components/PaystackCheckout';
import CryptoCheckout from '@/components/CryptoCheckout';

interface CartItemData {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    priceNGN: number;
    images: string | null;
    storefront: { id: string; storeName: string | null; userId: string };
  };
}

interface CartData {
  id: string;
  items: CartItemData[];
}

interface OrderResult {
  id: string;
  totalNGN: number;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'bnb' | 'usdt' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [cryptoData, setCryptoData] = useState<Record<string, unknown> | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCart(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Group items by storefront
  const storefrontGroups = cart?.items.reduce(
    (acc, item) => {
      const sid = item.product.storefront.id;
      if (!acc[sid]) {
        acc[sid] = {
          storefront: item.product.storefront,
          items: [],
          total: 0,
        };
      }
      acc[sid].items.push(item);
      acc[sid].total += item.product.priceNGN * item.quantity;
      return acc;
    },
    {} as Record<
      string,
      {
        storefront: CartItemData['product']['storefront'];
        items: CartItemData[];
        total: number;
      }
    >
  );

  const grandTotal = Object.values(storefrontGroups || {}).reduce(
    (sum, g) => sum + g.total,
    0
  );

  const removeFromCart = async (cartItemId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });
      if (res.ok) {
        fetchCart();
      }
    } catch {
      // silently fail
    }
  };

  const handleCheckout = async () => {
    if (!paymentMethod || !storefrontGroups) return;
    setProcessing(true);
    setError('');

    try {
      // Create one order per storefront group
      const entries = Object.entries(storefrontGroups);
      for (const [storefrontId, group] of entries) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storefrontId,
            paymentMethod,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to create order');
          return;
        }

        // Handle crypto payment
        if (paymentMethod === 'bnb' || paymentMethod === 'usdt') {
          const cryptoRes = await fetch('/api/payments/crypto/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.id,
              currency: paymentMethod.toUpperCase(),
            }),
          });

          const cryptoResData = await cryptoRes.json();
          if (cryptoRes.ok) {
            setCryptoData(cryptoResData);
            setOrderResult({ id: data.id, totalNGN: data.totalNGN });
          } else {
            setError(cryptoResData.error || 'Failed to create crypto payment');
            return;
          }
        } else {
          // Paystack: redirect
          setOrderResult({ id: data.id, totalNGN: data.totalNGN });
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaystackSuccess = async (reference: string) => {
    try {
      await fetch('/api/payments/paystack/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
    } catch {
      // Continue anyway
    }
    router.push('/dashboard/customer/purchases?success=true');
  };

  const handleCryptoConfirm = () => {
    router.push('/dashboard/customer/purchases?success=true');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Crypto checkout view
  if (cryptoData && orderResult) {
    return (
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            setCryptoData(null);
            setOrderResult(null);
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Complete Your Crypto Payment
          </h2>
          <CryptoCheckout
            walletAddress={cryptoData.walletAddress as string}
            amount={cryptoData.amount as number}
            currency={cryptoData.currency as string}
            qrData={cryptoData.qrData as string}
            expiresAt={cryptoData.expiresAt as string}
            paymentId={cryptoData.paymentId as string}
            onConfirm={handleCryptoConfirm}
            onCancel={() => {
              setCryptoData(null);
              setOrderResult(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Paystack checkout view
  if (paymentMethod === 'paystack' && orderResult) {
    return (
      <div className="max-w-lg mx-auto">
        <Button
          variant="ghost"
          onClick={() => {
            setOrderResult(null);
            setPaymentMethod(null);
          }}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Complete Your Payment
          </h2>
          <PaystackCheckout
            orderId={orderResult.id}
            amount={orderResult.totalNGN}
            email={session?.user?.email || ''}
            onSuccess={handlePaystackSuccess}
            onClose={() => {
              setOrderResult(null);
              setPaymentMethod(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Browse stores to add items to your cart
        </p>
        <Button onClick={() => router.push('/dashboard/customer/browse')}>
          Browse Stores
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        <Badge variant="secondary" className="text-sm">
          {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-4">
        {Object.entries(storefrontGroups || {}).map(([storefrontId, group]) => (
          <div
            key={storefrontId}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
          >
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {group.storefront.storeName || 'Store'}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {group.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                    {item.product.images ? (
                      <img
                        src={JSON.parse(item.product.images)[0] || ''}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Qty: {item.quantity} × ₦{item.product.priceNGN.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    ₦{(item.product.priceNGN * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                Subtotal: ₦{group.total.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Payment Method
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setPaymentMethod('paystack')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'paystack'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Paystack</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Card, Bank, USSD</p>
          </button>

          <button
            onClick={() => setPaymentMethod('bnb')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'bnb'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Coins className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white text-sm">BNB</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Binance Smart Chain</p>
          </button>

          <button
            onClick={() => setPaymentMethod('usdt')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              paymentMethod === 'usdt'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Coins className="h-6 w-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="font-semibold text-gray-900 dark:text-white text-sm">USDT</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tether on BSC</p>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Order Summary
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Items ({cart.items.length})</span>
            <span className="text-gray-900 dark:text-white">₦{grandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Service fee</span>
            <span className="text-gray-900 dark:text-white">₦0</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          disabled={!paymentMethod || processing}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-12"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Place Order — ₦{grandTotal.toLocaleString()}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
