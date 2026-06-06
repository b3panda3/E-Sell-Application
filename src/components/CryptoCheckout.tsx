'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CryptoCheckoutProps {
  walletAddress: string;
  amount: number;
  currency: string;
  qrData: string;
  expiresAt: string;
  paymentId: string;
  onConfirm: (txHash: string) => void;
  onCancel: () => void;
}

export default function CryptoCheckout({
  walletAddress,
  amount,
  currency,
  qrData,
  expiresAt,
  paymentId,
  onConfirm,
  onCancel,
}: CryptoCheckoutProps) {
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const expiry = new Date(expiresAt).getTime();
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setExpired(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleConfirm = async () => {
    if (!txHash.trim()) return;
    setConfirming(true);
    try {
      const res = await fetch('/api/payments/crypto/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, txHash: txHash.trim() }),
      });

      if (res.ok) {
        onConfirm(txHash.trim());
      }
    } catch {
      // Error handling
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currencyColors: Record<string, string> = {
    BNB: 'from-yellow-400 to-yellow-600',
    USDT: 'from-green-400 to-green-600',
  };

  if (expired) {
    return (
      <div className="text-center p-6 space-y-4">
        <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <Clock className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Payment Expired
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This payment request has expired. Please create a new one.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`bg-gradient-to-r ${currencyColors[currency] || 'from-gray-400 to-gray-600'} rounded-lg p-4 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Send exactly</p>
            <p className="text-2xl font-bold">
              {amount} {currency}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Time remaining</p>
            <p className="text-2xl font-bold font-mono">{formatTime(timeLeft)}</p>
          </div>
        </div>
        <p className="text-xs mt-2 opacity-80">Network: BSC (Binance Smart Chain)</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="bg-white p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <QRCodeSVG value={qrData} size={180} level="M" />
        </div>
      </div>

      {/* Wallet Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Send to this wallet address:
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-mono break-all text-gray-900 dark:text-gray-100">
            {walletAddress}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyAddress}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Transaction Hash Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter transaction hash after sending:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            placeholder="0x..."
            className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.open(`https://bscscan.com/`, '_blank')}
            title="View on BscScan"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleConfirm}
          disabled={!txHash.trim() || confirming}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {confirming ? 'Confirming...' : 'Confirm Payment'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
