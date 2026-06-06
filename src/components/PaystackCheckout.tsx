'use client';

import { useState } from 'react';
import { Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaystackCheckoutProps {
  orderId: string;
  amount: number;
  email: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

export default function PaystackCheckout({
  orderId,
  amount,
  email,
  onSuccess,
  onClose,
}: PaystackCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initializePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to initialize payment');
        return;
      }

      if (data.testMode) {
        // Test mode: simulate success
        setTimeout(() => {
          onSuccess(data.reference);
        }, 1500);
        return;
      }

      // Real Paystack: open the authorization URL
      if (data.authorization_url) {
        window.open(data.authorization_url, '_blank');

        // Poll for verification
        const pollInterval = setInterval(async () => {
          try {
            const verifyRes = await fetch('/api/payments/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: data.reference }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.data?.status === 'success') {
              clearInterval(pollInterval);
              onSuccess(data.reference);
            }
          } catch {
            // Continue polling
          }
        }, 5000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Pay with Paystack</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pay ₦{amount.toLocaleString()} securely via Paystack
            </p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          <p>Email: {email}</p>
          <p>Amount: ₦{amount.toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={initializePayment}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay ₦{amount.toLocaleString()}
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
