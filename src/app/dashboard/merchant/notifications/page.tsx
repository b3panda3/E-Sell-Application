'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  Package,
  Settings,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  referenceId: string | null;
}

const typeIcons: Record<string, typeof Bell> = {
  PAYMENT: CreditCard,
  MESSAGE: MessageSquare,
  ORDER: Package,
  SYSTEM: Settings,
};

const typeColors: Record<string, string> = {
  PAYMENT: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  MESSAGE: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  ORDER: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  SYSTEM: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const filterOptions = [
  { value: 'ALL', label: 'All' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'MESSAGE', label: 'Messages' },
  { value: 'ORDER', label: 'Orders' },
  { value: 'SYSTEM', label: 'System' },
];

export default function MerchantNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchNotifications = useCallback(async () => {
    try {
      const params = filter !== 'ALL' ? `?type=${filter}` : '';
      const res = await fetch(`/api/notifications${params}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // silently fail
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="text-[#006633] dark:text-emerald-400"
          >
            <Check className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === opt.value
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            All caught up!
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            No notifications to show
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = typeIcons[notification.type] || Settings;
            const colorClass = typeColors[notification.type] || typeColors.SYSTEM;

            return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex items-start gap-4 transition-colors ${
                  !notification.readAt
                    ? 'border-l-4 border-l-[#006633] bg-green-50/30 dark:bg-green-900/10'
                    : ''
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      {notification.body && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {notification.body}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] h-5 shrink-0 ${colorClass}`}
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
