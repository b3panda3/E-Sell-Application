'use client';

import { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Command {
  keywords: string[];
  action: string;
  path?: string;
  description: string;
  roles: ('CUSTOMER' | 'MERCHANT')[];
}

const COMMANDS: Command[] = [
  { keywords: ['dashboard', 'home'], action: 'navigate', path: '/dashboard/customer', description: 'Go to dashboard', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['browse', 'stores', 'shop'], action: 'navigate', path: '/dashboard/customer/browse', description: 'Browse stores', roles: ['CUSTOMER'] },
  { keywords: ['cart', 'shopping'], action: 'navigate', path: '/dashboard/customer/cart', description: 'View cart', roles: ['CUSTOMER'] },
  { keywords: ['checkout', 'pay'], action: 'navigate', path: '/dashboard/customer/checkout', description: 'Checkout', roles: ['CUSTOMER'] },
  { keywords: ['purchases', 'orders', 'my orders', 'my purchases'], action: 'navigate', path: '/dashboard/customer/purchases', description: 'View purchases', roles: ['CUSTOMER'] },
  { keywords: ['messages', 'chat', 'inbox'], action: 'navigate', path: '/dashboard/customer/messages', description: 'View messages', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['notifications', 'alerts'], action: 'navigate', path: '/dashboard/customer/notifications', description: 'View notifications', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['settings', 'profile'], action: 'navigate', path: '/dashboard/customer/settings', description: 'Settings', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['assistant', 'ai', 'bot'], action: 'navigate', path: '/dashboard/customer/assistant', description: 'AI Assistant', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['storefront', 'my store'], action: 'navigate', path: '/dashboard/merchant/storefront', description: 'Storefront', roles: ['MERCHANT'] },
  { keywords: ['products', 'services'], action: 'navigate', path: '/dashboard/merchant/products', description: 'Products', roles: ['MERCHANT'] },
  { keywords: ['merchant orders', 'manage orders'], action: 'navigate', path: '/dashboard/merchant/orders', description: 'Merchant orders', roles: ['MERCHANT'] },
  { keywords: ['staff', 'team', 'employees'], action: 'navigate', path: '/dashboard/merchant/staff', description: 'Staff management', roles: ['MERCHANT'] },
  { keywords: ['wallet', 'wallets', 'crypto'], action: 'navigate', path: '/dashboard/merchant/wallets', description: 'Wallet addresses', roles: ['MERCHANT'] },
  { keywords: ['contract', 'token', 'deploy', 'bep20'], action: 'navigate', path: '/dashboard/merchant/contracts', description: 'Contract deployment', roles: ['MERCHANT'] },
  { keywords: ['logout', 'sign out', 'log out'], action: 'logout', description: 'Sign out', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['scroll top', 'go top', 'top'], action: 'scrollTop', description: 'Scroll to top', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['scroll bottom', 'go bottom', 'bottom'], action: 'scrollBottom', description: 'Scroll to bottom', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['back', 'go back'], action: 'goBack', description: 'Go back', roles: ['CUSTOMER', 'MERCHANT'] },
  { keywords: ['help', 'commands'], action: 'showHelp', description: 'Show commands', roles: ['CUSTOMER', 'MERCHANT'] },
];

function fuzzyMatch(transcript: string, keywords: string[]): boolean {
  const lower = transcript.toLowerCase().trim();
  return keywords.some(
    (kw) => lower.includes(kw.toLowerCase()) || levenshtein(lower, kw.toLowerCase()) <= 2
  );
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export default function VoiceCommandBar() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [feedback, setFeedback] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const userRole = pathname.includes('/merchant') ? 'MERCHANT' as const : 'CUSTOMER' as const;

  const executeCommand = useCallback(
    (command: Command) => {
      switch (command.action) {
        case 'navigate':
          if (command.path) {
            const basePath = userRole === 'MERCHANT' ? '/dashboard/merchant' : '/dashboard/customer';
            const fullPath = command.path.replace('/dashboard/customer', basePath).replace('/dashboard/merchant', basePath);
            router.push(fullPath);
            setFeedback(`Navigating to ${command.description}...`);
          }
          break;
        case 'logout':
          router.push('/api/auth/signout');
          break;
        case 'scrollTop':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setFeedback('Scrolling to top');
          break;
        case 'scrollBottom':
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          setFeedback('Scrolling to bottom');
          break;
        case 'goBack':
          router.back();
          setFeedback('Going back');
          break;
        case 'showHelp':
          setShowHelp(true);
          setFeedback('Showing available commands');
          break;
      }
      setTimeout(() => setFeedback(''), 3000);
    },
    [router, userRole]
  );

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setFeedback('Voice commands not supported in this browser');
      setTimeout(() => setFeedback(''), 3000);
      return;
    }

    const SpeechRecognitionAPI = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognitionAPI as any)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setFeedback('Listening...');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setFeedback(`Heard: "${result}"`);

      const matchedCommand = COMMANDS.filter((c) => c.roles.includes(userRole)).find((cmd) =>
        fuzzyMatch(result, cmd.keywords)
      );

      if (matchedCommand) {
        executeCommand(matchedCommand);
      } else {
        setFeedback(`No command found for "${result}"`);
        setTimeout(() => setFeedback(''), 3000);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback('Voice recognition error. Try again.');
      setTimeout(() => setFeedback(''), 3000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [executeCommand, userRole]);

  const roleCommands = COMMANDS.filter((c) => c.roles.includes(userRole));

  return (
    <>
      {/* Floating Mic Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {feedback && (
          <div className="bg-gray-800 dark:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm max-w-xs shadow-lg animate-fade-in">
            {feedback}
          </div>
        )}

        {showHelp && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xl max-w-xs max-h-80 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Voice Commands</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1.5">
              {roleCommands.map((cmd) => (
                <div key={cmd.keywords[0]} className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{cmd.keywords.slice(0, 2).join(', ')}</span>
                  {' — '}
                  {cmd.description}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={startListening}
          size="icon"
          className={`h-12 w-12 rounded-full shadow-lg transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
        >
          {isListening ? (
            <MicOff className="h-5 w-5 text-white" />
          ) : (
            <Mic className="h-5 w-5 text-white" />
          )}
        </Button>
      </div>
    </>
  );
}
