'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Coins,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  items: string;
  totalNGN: number;
  totalCrypto: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  storefront: { id: string; storeName: string | null };
  merchant: { id: string; name: string; image: string | null };
  payments: { id: string; method: string; amount: number; status: string; reference: string }[];
}

const statusConfig: Record<string, { color: string; icon: typeof Package }> = {
  placed: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  processing: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Package },
  shipped: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck },
  delivered: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const paymentStatusConfig: Record<string, { color: string }> = {
  pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  failed: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  refunded: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

export default function PurchasesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const successParam = searchParams.get('success');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Purchases</h1>
        <Badge variant="secondary" className="text-sm">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {successParam && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
          <p className="text-sm text-green-600 dark:text-green-400">Payment confirmed successfully!</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const orderItems = JSON.parse(order.items || '[]') as { name: string; price: number; quantity: number }[];
            const status = statusConfig[order.orderStatus] || statusConfig.placed;
            const payStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <status.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </p>
                      <Badge variant="secondary" className={`text-[10px] h-5 ${status.color}`}>
                        {order.orderStatus}
                      </Badge>
                      <Badge variant="secondary" className={`text-[10px] h-5 ${payStatus.color}`}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {order.storefront.storeName || 'Store'} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="font-semibold text-sm text-gray-900 dark:text-white shrink-0">
                    ₦{order.totalNGN.toLocaleString()}
                  </p>

                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Items
                      </h4>
                      <div className="space-y-2">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.name} × {item.quantity}
                            </span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              ₦{(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Payment
                      </h4>
                      <div className="flex items-center gap-2 text-sm">
                        {order.paymentMethod === 'paystack' ? (
                          <CreditCard className="h-4 w-4 text-blue-500" />
                        ) : (
                          <Coins className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-gray-700 dark:text-gray-300 capitalize">
                          {order.paymentMethod}
                        </span>
                        {order.payments.length > 0 && (
                          <span className="text-xs text-gray-400">
                            Ref: {order.payments[0].reference.slice(0, 16)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Merchant Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Merchant
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {order.merchant.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
