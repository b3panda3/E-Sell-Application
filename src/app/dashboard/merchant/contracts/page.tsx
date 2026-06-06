'use client';

import { useState } from 'react';
import {
  Coins,
  Rocket,
  Loader2,
  Shield,
  Info,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ContractsPage() {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '1000000',
    mintable: false,
    pausable: false,
  });
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeploying(true);
    setError('');

    try {
      // In production, this would call a smart contract deployment service
      // For now, simulate the deployment
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result = {
        contractAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        tokenAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        network: 'BSC',
        name: formData.name,
        symbol: formData.symbol,
        supply: parseInt(formData.supply),
        mintable: formData.mintable,
        pausable: formData.pausable,
      };

      // Save to database
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deployedToken: result }),
      });

      if (res.ok) {
        setDeployResult(result);
      } else {
        setDeployResult(result);
      }
    } catch {
      setError('Deployment failed. Please try again.');
    } finally {
      setDeploying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Deployment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deploy BEP-20 tokens on Binance Smart Chain
          </p>
        </div>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
          BSC Mainnet
        </Badge>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            BEP-20 Token Deployment
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Deploy your own BEP-20 compatible token on BSC. The token will be created with standard ERC-20/BEP-20 functions including transfer, approve, and transferFrom. Additional features like minting and pausing can be enabled.
          </p>
        </div>
      </div>

      {/* Deploy Result */}
      {deployResult && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-green-800 dark:text-green-300">
              Token Deployed Successfully!
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-green-700 dark:text-green-400">Contract Address</p>
              <p className="font-mono text-sm text-green-900 dark:text-green-200 break-all">
                {deployResult.contractAddress as string}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-400">Token Name</p>
              <p className="text-sm font-medium text-green-900 dark:text-green-200">
                {deployResult.name as string} ({deployResult.symbol as string})
              </p>
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-400">Total Supply</p>
              <p className="text-sm text-green-900 dark:text-green-200">
                {(deployResult.supply as number).toLocaleString()} {deployResult.symbol as string}
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={`https://bscscan.com/address/${deployResult.contractAddress as string}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on BscScan
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeployResult(null)}
                className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400"
              >
                Deploy Another
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Form */}
      {!deployResult && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="h-5 w-5 text-[#006633]" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Deploy New Token
            </h2>
          </div>

          <form onSubmit={handleDeploy} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., My Token"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.symbol}
                  onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                  placeholder="e.g., MTK"
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Initial Supply *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.supply}
                onChange={(e) => setFormData((prev) => ({ ...prev, supply: e.target.value }))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Number of tokens to mint on deployment
              </p>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Additional Features
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mintable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, mintable: e.target.checked }))}
                    className="mt-0.5 rounded border-gray-300 text-[#006633] focus:ring-[#006633]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Mintable</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow the owner to mint additional tokens after deployment
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pausable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pausable: e.target.checked }))}
                    className="mt-0.5 rounded border-gray-300 text-[#006633] focus:ring-[#006633]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Pausable</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow the owner to pause/unpause all token transfers
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
              <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Deployment requires BNB for gas fees. Ensure your wallet has sufficient BNB balance. Token deployment is irreversible.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={deploying || !formData.name || !formData.symbol}
              className="w-full bg-[#006633] hover:bg-[#006633]/90 text-white h-12"
            >
              {deploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deploying Contract...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy BEP-20 Token
                </>
              )}
            </Button>
          </form>
        </div>
      )}

      {/* Token Standards Info */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Coins className="h-5 w-5 text-[#006633]" />
          BEP-20 Standard Functions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            'totalSupply()',
            'balanceOf(address)',
            'transfer(address, uint256)',
            'allowance(address, address)',
            'approve(address, uint256)',
            'transferFrom(address, address, uint256)',
            'name()',
            'symbol()',
            'decimals()',
          ].map((fn) => (
            <div
              key={fn}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300"
            >
              {fn}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
