'use client';

import { useState, useEffect } from 'react';
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
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const NETWORKS = [
  { value: 'BSC', label: 'BSC (Binance Smart Chain)', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'Ethereum', label: 'Ethereum', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'Polygon', label: 'Polygon', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'Arbitrum', label: 'Arbitrum', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  { value: 'Optimism', label: 'Optimism', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
];

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    network: 'BSC',
    address: '',
    label: '',
  });

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/wallets');
      if (res.ok) {
        const data = await res.json();
        setWallets(data.wallets);
      } else {
        setError('Failed to load wallets');
      }
    } catch {
      setError('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/wallets');
        if (!cancelled && res.ok) {
          const data = await res.json();
          setWallets(data.wallets);
        } else if (!cancelled) {
          setError('Failed to load wallets');
        }
      } catch {
        if (!cancelled) setError('Failed to load wallets');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const addWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network: formData.network,
          address: formData.address.trim(),
          label: formData.label.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFormData({ network: 'BSC', address: '', label: '' });
        setShowForm(false);
        setSuccess('Wallet address added successfully');
        fetchWallets();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to add wallet');
      }
    } catch {
      setError('Failed to add wallet');
    } finally {
      setSubmitting(false);
    }
  };

  const removeWallet = async (id: string) => {
    if (!confirm('Are you sure you want to remove this wallet address?')) return;

    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/wallets/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Wallet address removed');
        fetchWallets();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove wallet');
      }
    } catch {
      setError('Failed to remove wallet');
    }
  };

  const copyAddress = async (address: string, id: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback - select text approach
    }
  };

  const getNetworkConfig = (network: string) => {
    return NETWORKS.find((n) => n.value === network) || NETWORKS[0];
  };

  const getExplorerUrl = (network: string, address: string) => {
    switch (network) {
      case 'BSC':
        return `https://bscscan.com/address/${address}`;
      case 'Ethereum':
        return `https://etherscan.io/address/${address}`;
      case 'Polygon':
        return `https://polygonscan.com/address/${address}`;
      case 'Arbitrum':
        return `https://arbiscan.io/address/${address}`;
      case 'Optimism':
        return `https://optimistic.etherscan.io/address/${address}`;
      default:
        return `https://bscscan.com/address/${address}`;
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Addresses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your crypto wallet addresses for receiving payments
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

      {/* Success / Error Messages */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Important: Verify Your Network
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            All wallet addresses must start with 0x and be 42 characters long. Sending crypto to the wrong network may result in permanent loss of funds. BSC is the primary network. Always verify your address before sharing.
          </p>
        </div>
      </div>

      {/* Add Wallet Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Add Wallet Address
          </h2>
          <form onSubmit={addWallet} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Network *
              </label>
              <Select
                value={formData.network}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, network: value ?? 'BSC' }))
                }
              >
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {NETWORKS.map((network) => (
                    <SelectItem key={network.value} value={network.value}>
                      {network.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                BSC is the primary network for receiving payments
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="0x..."
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter your wallet address starting with 0x (42 characters)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
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
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
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
            Add a wallet address to receive crypto payments
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
          {wallets.map((wallet) => {
            const networkConfig = getNetworkConfig(wallet.network);
            return (
              <div
                key={wallet.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] h-5 ${networkConfig.color}`}
                      >
                        {wallet.network}
                      </Badge>
                      {wallet.isVerified && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        >
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
                      href={getExplorerUrl(wallet.network, wallet.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      title={`View on ${wallet.network} explorer`}
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
            );
          })}
        </div>
      )}

      {/* Customer-Facing Display Section */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="h-5 w-5 text-[#006633]" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer-Facing Display
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Your wallet addresses will appear on your public storefront page. Customers can use these addresses to send crypto payments directly.
        </p>

        {session?.user?.esellCode ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preview — What customers see on your storefront
            </p>

            {wallets.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No wallets to display. Add a wallet above to show it here.
              </p>
            ) : (
              <div className="space-y-3">
                {wallets.map((wallet) => {
                  const networkConfig = getNetworkConfig(wallet.network);
                  return (
                    <div
                      key={wallet.id}
                      className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <Badge
                        variant="secondary"
                        className={`text-[10px] h-5 shrink-0 ${networkConfig.color}`}
                      >
                        {wallet.network}
                      </Badge>
                      <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
                        {truncateAddress(wallet.address)}
                      </code>
                      <button
                        onClick={() => copyAddress(wallet.address, `preview-${wallet.id}`)}
                        className="p-1 text-gray-400 hover:text-[#006633] transition-colors"
                        title="Copy address"
                      >
                        {copied === `preview-${wallet.id}` ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <a
                        href={getExplorerUrl(wallet.network, wallet.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="View on explorer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {wallet.label && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {wallet.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <a
              href={`/store/${session.user.esellCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#006633] hover:underline mt-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View your storefront page
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            Set up your E-Sell code to enable your public storefront.
          </p>
        )}
      </div>
    </div>
  );
}
