'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Mic,
  MicOff,
  Phone,
  Globe,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  interactionId?: string;
  rated?: boolean;
}

interface AethexConfig {
  enabled: boolean;
  greeting: string;
  language: string;
  faqQuestions: string[];
  escalationMessage: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Swahili' },
  { code: 'es', label: 'Español' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ha', label: 'Hausa' },
  { code: 'ar', label: 'العربية' },
];

interface AethexChatWidgetProps {
  storefrontId: string;
  primaryColor?: string;
}

export default function AethexChatWidget({ storefrontId, primaryColor = '#006633' }: AethexChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AethexConfig | null>(null);
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Fetch config
  useEffect(() => {
    if (!storefrontId) return;
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/aethex/config/public?storefrontId=${storefrontId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.enabled) {
            setConfig(data as AethexConfig);
            setLanguage(data.language || 'en');
          }
        }
      } catch { /* widget not available */ }
    }
    fetchConfig();
  }, [storefrontId]);

  // Track if greeting has been added
  const greetingAddedRef = useRef(false);

  // Add greeting message when opened
  useEffect(() => {
    if (isOpen && !greetingAddedRef.current && config) {
      greetingAddedRef.current = true;
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: config.greeting || 'Hi! How can I help you today?',
      }]);
    }
  }, [isOpen, config]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const conversationHistory = messages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/aethex/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          storefrontId,
          conversationHistory,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          interactionId: data.interactionId,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: "I'm having trouble responding. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: "Connection error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, storefrontId, language]);

  const rateMessage = useCallback(async (messageId: string, interactionId: string | undefined, rating: number) => {
    if (!interactionId) return;

    try {
      await fetch(`/api/aethex/interactions/${interactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
    } catch { /* ignore */ }

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, rated: true } : m))
    );
  }, []);

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('Voice input is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'ar' ? 'ar-SA' :
                       language === 'fr' ? 'fr-FR' :
                       language === 'es' ? 'es-ES' :
                       language === 'sw' ? 'sw-KE' :
                       language === 'yo' ? 'yo-NG' :
                       language === 'ig' ? 'ig-NG' :
                       language === 'ha' ? 'ha-NG' : 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, language]);

  const handleEscalate = useCallback(() => {
    sendMessage('I would like to speak with a human agent.');
  }, [sendMessage]);

  // Don't render if config not loaded or not enabled
  if (!config) return null;

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110"
            style={{ backgroundColor: primaryColor }}
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div
              className="px-4 py-3 text-white flex items-center justify-between shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <p className="font-semibold text-sm">Aethex AI</p>
                  <p className="text-xs text-white/70">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    aria-label="Select language"
                  >
                    <Globe className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]"
                      >
                        {LANGUAGES.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => { setLanguage(lang.code); setShowLangMenu(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              language === lang.code ? 'text-[#006633] dark:text-emerald-400 font-medium' : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="max-w-[80%]">
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}
                      style={msg.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {/* Rating buttons for AI messages */}
                    {msg.role === 'assistant' && msg.id !== 'greeting' && !msg.rated && (
                      <div className="flex items-center gap-1 mt-1 ml-1">
                        <button
                          onClick={() => rateMessage(msg.id, msg.interactionId, 2)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Thumbs up"
                        >
                          <ThumbsUp className="h-3 w-3 text-gray-400 hover:text-emerald-500" />
                        </button>
                        <button
                          onClick={() => rateMessage(msg.id, msg.interactionId, 1)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label="Thumbs down"
                        >
                          <ThumbsDown className="h-3 w-3 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                      <User className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2 justify-start">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Quick Suggestions */}
            {config.faqQuestions?.length > 0 && messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {config.faqQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Escalate Button */}
            <div className="px-4 pb-1">
              <button
                onClick={handleEscalate}
                className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-[#006633] dark:hover:text-emerald-400 transition-colors"
              >
                <Phone className="h-3 w-3" />
                Chat with a human
              </button>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleVoice}
                className={`shrink-0 h-9 w-9 ${listening ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400' : ''}`}
                aria-label="Voice input"
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 h-9 dark:bg-gray-800 dark:border-gray-700"
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="shrink-0 h-9 w-9 p-0 text-white"
                style={{ backgroundColor: primaryColor }}
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
