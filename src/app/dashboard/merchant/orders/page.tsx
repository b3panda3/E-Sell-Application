'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Coins,
  Eye,
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
  customer: { id: string; name: string; email: string; image: string | null };
  storefront: { id: string; storeName: string | null };
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

const nextStatusMap: Record<string, string> = {
  placed: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  };

  const updatePaymentStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#006633]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <Badge variant="secondary" className="text-sm">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No orders yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Orders from your storefront will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const orderItems = JSON.parse(order.items || '[]') as { name: string; price: number; quantity: number }[];
            const status = statusConfig[order.orderStatus] || statusConfig.placed;
            const payStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.pending;
            const nextStatus = nextStatusMap[order.orderStatus];

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                    <status.icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>

                  <div className="flex-1 min-w-0">
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
                      {order.customer.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="font-semibold text-sm text-gray-900 dark:text-white shrink-0">
                    ₦{order.totalNGN.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    {nextStatus && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, nextStatus)}
                        disabled={updating === order.id}
                        className="bg-[#006633] hover:bg-[#006633]/90 text-white h-7 text-xs"
                      >
                        {updating === order.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          `Mark ${nextStatus}`
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

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

                    {/* Customer Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Customer
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {order.customer.name} ({order.customer.email})
                      </p>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Payment
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          {order.paymentMethod === 'paystack' ? (
                            <CreditCard className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Coins className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="text-gray-700 dark:text-gray-300 capitalize">
                            {order.paymentMethod}
                          </span>
                        </div>
                        {order.paymentStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePaymentStatus(order.id, 'confirmed')}
                            disabled={updating === order.id}
                            className="text-green-600 border-green-200 hover:bg-green-50 h-7 text-xs"
                          >
                            Confirm Payment
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Quick Status Actions */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                        Update Status
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {Object.keys(nextStatusMap).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateOrderStatus(order.id, s)}
                            disabled={updating === order.id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              order.orderStatus === s
                                ? 'bg-[#006633] text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          disabled={updating === order.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            order.orderStatus === 'cancelled'
                              ? 'bg-red-500 text-white'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
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
