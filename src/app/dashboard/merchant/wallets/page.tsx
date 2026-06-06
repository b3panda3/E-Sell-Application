'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Wallet,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Shield,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface WalletAddress {
  id: string;
  network: string;
  address: string;
  label: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function WalletsPage() {
  const { data: session } = useSession();
  const [wallets, setWallets] = useState<WalletAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    address: '',
    label: '',
  });

  const fetchWallets = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        // Wallet addresses are on the user, fetch from a dedicated endpoint
      }
    } catch {
      // silently fail
    }

    // Try fetching wallets directly
    try {
      const res = await fetch('/api/storefront');
      if (res.ok) {
        const data = await res.json();
        const userId = Array.isArray(data) ? data[0]?.userId : data.userId;
        if (userId) {
          // We'll need a wallets endpoint
        }
      }
    } catch {
      // silently fail
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch wallets from profile
    const loadWallets = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          // Wallet addresses come from the user relation
          // We'll use the storefront API to get wallet addresses
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    };
    loadWallets();
  }, []);

  const addWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim()) return;
    setSubmitting(true);

    try {
      // Use the storefront API to add wallet address
      const res = await fetch('/api/storefront', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: {
            network: 'BSC',
            address: formData.address.trim(),
            label: formData.label.trim() || null,
          },
        }),
      });

      if (res.ok) {
        setFormData({ address: '', label: '' });
        setShowForm(false);
        fetchWallets();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  };

  const removeWallet = async (id: string) => {
    if (!confirm('Are you sure you want to remove this wallet address?')) return;
    try {
      await fetch(`/api/user/profile`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletId: id }),
      });
      fetchWallets();
    } catch {
      // silently fail
    }
  };

  const copyAddress = async (address: string, id: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Addresses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your BSC wallet addresses for receiving crypto payments
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#006633] hover:bg-[#006633]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Important: BSC Network Only
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Only add BSC (Binance Smart Chain) wallet addresses. Sending crypto to the wrong network may result in permanent loss of funds. Always verify your address before sharing.
          </p>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add BSC Wallet Address
          </h2>
          <form onSubmit={addWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="0x..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter your BSC (BEP-20) wallet address starting with 0x
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Main Wallet, Business Wallet"
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={submitting || !formData.address.trim()}
                className="bg-[#006633] hover:bg-[#006633]/90 text-white"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Wallet
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Wallets List */}
      {wallets.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Wallet className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No wallet addresses
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Add a BSC wallet address to receive crypto payments
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[#006633] hover:bg-[#006633]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Wallet
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-[10px] h-5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {wallet.network}
                    </Badge>
                    {wallet.isVerified && (
                      <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <Check className="h-3 w-3 mr-0.5" /> Verified
                      </Badge>
                    )}
                    {wallet.label && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {wallet.label}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {wallet.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Added {new Date(wallet.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    onClick={() => copyAddress(wallet.address, wallet.id)}
                    className="p-2 text-gray-400 hover:text-[#006633] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Copy address"
                  >
                    {copied === wallet.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <a
                    href={`https://bscscan.com/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="View on BscScan"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => removeWallet(wallet.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Remove wallet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
