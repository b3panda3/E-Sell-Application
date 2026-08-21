'use client';

import { useState, useEffect } from 'react';
import {
  Coins,
  Rocket,
  Loader2,
  Shield,
  Info,
  CheckCircle2,
  ExternalLink,
  Wallet,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BEP20_ABI,
  BEP20_BYTECODE,
  BSC_NETWORKS,
  getExplorerUrl,
  getTxExplorerUrl,
} from '@/lib/contracts/BEP20Token';

// Declare window.ethereum for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

type NetworkType = 'mainnet' | 'testnet';

interface DeployResult {
  contractAddress: string;
  txHash: string;
  network: NetworkType;
  name: string;
  symbol: string;
  supply: number;
  mintable: boolean;
  pausable: boolean;
}

interface ExistingToken {
  id: string;
  contractAddress: string;
  network: string;
  name: string;
  symbol: string;
  supply: string;
  mintable: boolean;
  pausable: boolean;
  verifiedAt: string;
}

export default function ContractsPage() {
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '1000000',
    mintable: false,
    pausable: false,
  });
  const [network, setNetwork] = useState<NetworkType>('testnet');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string>('');
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState('');
  const [existingTokens, setExistingTokens] = useState<ExistingToken[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Load existing tokens on mount
  useEffect(() => {
    async function loadTokens() {
      try {
        const res = await fetch('/api/contracts/deploy');
        if (res.ok) {
          const data = await res.json();
          setExistingTokens(data.tokens || []);
        }
      } catch { /* ignore */ }
    }
    loadTokens();
  }, []);

  // Check if wallet is already connected
  useEffect(() => {
    async function checkConnection() {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          }) as string[];
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch { /* ignore */ }
      }
    }
    checkConnection();
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        setWalletAddress(null);
      } else {
        setWalletAddress(accounts[0]);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask from metamask.io');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);

        // Check if on correct network
        const chainId = await window.ethereum.request({
          method: 'eth_chainId',
        }) as string;

        const targetChainId = BSC_NETWORKS[network].chainIdHex;
        if (chainId !== targetChainId) {
          await switchOrAddNetwork();
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
    } finally {
      setConnecting(false);
    }
  };

  const switchOrAddNetwork = async () => {
    if (typeof window.ethereum === 'undefined') return;

    const net = BSC_NETWORKS[network];

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: net.chainIdHex }],
      });
    } catch (switchError: unknown) {
      // Chain not added, add it
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: net.chainIdHex,
              chainName: net.name,
              nativeCurrency: {
                name: net.currency.name,
                symbol: net.currency.symbol,
                decimals: net.currency.decimals,
              },
              rpcUrls: [net.rpcUrl],
              blockExplorerUrls: [net.blockExplorer],
            }],
          });
        } catch (addError) {
          setError('Failed to add BSC network to MetaMask');
        }
      } else {
        setError('Failed to switch to BSC network');
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setDeploying(true);
    setError('');
    setDeployStep('Preparing deployment...');

    try {
      // Dynamically import ethers
      const { ethers } = await import('ethers');

      setDeployStep('Connecting to blockchain...');

      const provider = new ethers.BrowserProvider(window.ethereum!);
      const signer = await provider.getSigner();

      setDeployStep('Estimating gas fees...');

      // Encode constructor arguments
      const supplyWithDecimals = formData.supply + '000000000000000000'; // 18 decimals
      const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
        ['string', 'string', 'uint256', 'bool', 'bool'],
        [formData.name, formData.symbol, supplyWithDecimals, formData.mintable, formData.pausable]
      );

      const fullBytecode = BEP20_BYTECODE + encodedArgs.slice(2); // remove 0x prefix

      setDeployStep('Sending deployment transaction...');

      const tx = await signer.sendTransaction({
        data: fullBytecode,
        gasLimit: 3000000, // Safe upper bound for token deployment
      });

      setDeployStep(`Transaction sent! Waiting for confirmation... (Tx: ${tx.hash.slice(0, 10)}...)`);

      const receipt = await tx.wait();

      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed or was reverted');
      }

      const contractAddress = receipt.contractAddress;
      if (!contractAddress) {
        throw new Error('Could not get contract address from receipt');
      }

      setDeployStep('Saving deployment to database...');

      const result: DeployResult = {
        contractAddress,
        txHash: tx.hash,
        network,
        name: formData.name,
        symbol: formData.symbol,
        supply: parseInt(formData.supply),
        mintable: formData.mintable,
        pausable: formData.pausable,
      };

      // Save to database
      const res = await fetch('/api/contracts/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      });

      if (res.ok) {
        const data = await res.json();
        setDeployResult(result);
        setExistingTokens([data.deployedToken, ...existingTokens]);
      } else {
        // Still show result even if DB save fails
        setDeployResult(result);
      }

      setDeployStep('');
    } catch (err: unknown) {
      setDeployStep('');
      const message = err instanceof Error ? err.message : 'Deployment failed. Please try again.';

      // Handle user rejection
      if (message.includes('user rejected') || message.includes('User denied')) {
        setError('Transaction was rejected by user');
      } else if (message.includes('insufficient funds')) {
        setError('Insufficient BNB balance for gas fees');
      } else {
        setError(message);
      }
    } finally {
      setDeploying(false);
    }
  };

  const shortAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Deployment
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Deploy BEP-20 tokens on Binance Smart Chain
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setNetwork('testnet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              network === 'testnet'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-2 ring-yellow-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            Testnet
          </button>
          <button
            onClick={() => setNetwork('mainnet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              network === 'mainnet'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            Mainnet
          </button>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
              </p>
              {walletAddress ? (
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {shortAddress(walletAddress)}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  MetaMask required for deployment
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {walletAddress && (
              <Badge
                variant="secondary"
                className={`${network === 'testnet' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}
              >
                {network === 'testnet' ? 'BSC Testnet' : 'BSC Mainnet'}
              </Badge>
            )}
            <Button
              variant={walletAddress ? 'outline' : 'default'}
              size="sm"
              onClick={walletAddress ? () => setWalletAddress(null) : connectWallet}
              disabled={connecting}
              className={!walletAddress ? 'bg-[#006633] hover:bg-[#006633]/90 text-white' : ''}
            >
              {connecting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Connecting...
                </>
              ) : walletAddress ? (
                'Disconnect'
              ) : (
                <>
                  <Wallet className="h-3.5 w-3.5 mr-1.5" />
                  Connect MetaMask
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
            BEP-20 Token Deployment
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            Deploy your own BEP-20 compatible token on BSC. The token will be created with standard ERC-20/BEP-20 functions including transfer, approve, and transferFrom. Connect your MetaMask wallet, fill in the token details, and deploy. {network === 'testnet' ? 'Testnet uses tBNB (free test tokens).' : 'Mainnet requires real BNB for gas fees.'}
          </p>
        </div>
      </div>

      {/* Existing Tokens */}
      {existingTokens.length > 0 && !deployResult && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Coins className="h-5 w-5 text-[#006633]" />
            Your Deployed Tokens
          </h3>
          <div className="space-y-3">
            {existingTokens.map((token) => (
              <div
                key={token.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {token.name} ({token.symbol})
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    {token.contractAddress}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {token.network}
                  </Badge>
                  <button
                    onClick={() => copyToClipboard(token.contractAddress, token.id)}
                    className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {copied === token.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </button>
                  <a
                    href={getExplorerUrl(
                      token.network === 'BSC' ? 'mainnet' : 'testnet',
                      token.contractAddress
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 hover:text-[#006633]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-sm text-green-900 dark:text-green-200 break-all">
                  {deployResult.contractAddress}
                </p>
                <button
                  onClick={() => copyToClipboard(deployResult.contractAddress, 'contract')}
                  className="shrink-0"
                >
                  {copied === 'contract' ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-green-600" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-400">Transaction Hash</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-sm text-green-900 dark:text-green-200 break-all">
                  {deployResult.txHash}
                </p>
                <a
                  href={getTxExplorerUrl(deployResult.network, deployResult.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-green-600" />
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Token Name</p>
                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                  {deployResult.name} ({deployResult.symbol})
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Total Supply</p>
                <p className="text-sm text-green-900 dark:text-green-200">
                  {deployResult.supply.toLocaleString()} {deployResult.symbol}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Network</p>
                <p className="text-sm text-green-900 dark:text-green-200">
                  {deployResult.network === 'testnet' ? 'BSC Testnet' : 'BSC Mainnet'}
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-400">Features</p>
                <p className="text-sm text-green-900 dark:text-green-200">
                  {deployResult.mintable ? 'Mintable' : ''}
                  {deployResult.mintable && deployResult.pausable ? ', ' : ''}
                  {deployResult.pausable ? 'Pausable' : ''}
                  {!deployResult.mintable && !deployResult.pausable ? 'Standard' : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <a
                href={getExplorerUrl(deployResult.network, deployResult.contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on {deployResult.network === 'testnet' ? 'BscScan Testnet' : 'BscScan'}
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeployResult(null)}
                className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
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

          {/* Deployment progress */}
          {deploying && deployStep && (
            <div className="mb-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-blue-700 dark:text-blue-300">{deployStep}</p>
              </div>
            </div>
          )}

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
                  disabled={deploying}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
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
                  disabled={deploying}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
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
                disabled={deploying}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Number of tokens to mint on deployment (18 decimal places)
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
                    disabled={deploying}
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
                    disabled={deploying}
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
              <div className="text-xs text-amber-700 dark:text-amber-400">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc ml-4 space-y-0.5">
                  <li>Deployment requires {network === 'testnet' ? 'tBNB (test BNB)' : 'real BNB'} for gas fees</li>
                  <li>Ensure your wallet has sufficient {network === 'testnet' ? 'tBNB' : 'BNB'} balance</li>
                  <li>Token deployment is irreversible once confirmed on-chain</li>
                  <li>You will be prompted to confirm the transaction in MetaMask</li>
                  {network === 'testnet' && (
                    <li>Get free tBNB from the <a href="https://testnet.bscscan.com/faucet-smart" target="_blank" rel="noopener noreferrer" className="underline font-medium">BSC Testnet Faucet</a></li>
                  )}
                </ul>
              </div>
            </div>

            {network === 'mainnet' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 dark:text-red-400">
                  You are deploying to BSC Mainnet with real BNB. This is not a test. Gas fees will be deducted from your wallet.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={deploying || !formData.name || !formData.symbol || !walletAddress}
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
                  Deploy BEP-20 Token on {network === 'testnet' ? 'Testnet' : 'Mainnet'}
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
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Your deployed token will support all standard BEP-20/ERC-20 functions listed below.
          {formData.mintable && ' Minting is enabled for the contract owner.'}
          {formData.pausable && ' Pause/unpause functionality is included.'}
        </p>
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
            ...(formData.mintable ? ['mint(address, uint256)'] : []),
            ...(formData.pausable ? ['pause()', 'unpause()'] : []),
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
