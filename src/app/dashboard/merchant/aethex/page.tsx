'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bot,
  Save,
  Plus,
  Trash2,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  ArrowLeft,
  Zap,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface AethexConfigType {
  id?: string;
  isEnabled: boolean;
  greeting: string;
  faqs: string;
  customInstructions: string;
  language: string;
  escalationMessage: string;
  autoResponseDelay: number;
}

interface Interaction {
  id: string;
  question: string;
  answer: string;
  language: string;
  escalated: boolean;
  rating: number | null;
  createdAt: string;
}

interface FAQ {
  question: string;
  answer: string;
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

const DEFAULT_CONFIG: AethexConfigType = {
  isEnabled: true,
  greeting: 'Hi! How can I help you today?',
  faqs: '[]',
  customInstructions: '',
  language: 'en',
  escalationMessage: "Let me connect you with the store owner for more help.",
  autoResponseDelay: 1000,
};

export default function MerchantAethexPage() {
  const [config, setConfig] = useState<AethexConfigType>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [newFaq, setNewFaq] = useState<FAQ>({ question: '', answer: '' });
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [interactionTotal, setInteractionTotal] = useState(0);
  const [interactionFilter, setInteractionFilter] = useState('all');
  const [interactionPage, setInteractionPage] = useState(1);
  const [saved, setSaved] = useState(false);

  // Fetch config
  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/aethex/config');
        if (res.ok) {
          const data = await res.json();
          if (data.config) {
            const cfg = data.config;
            setConfig({
              id: cfg.id,
              isEnabled: cfg.isEnabled ?? true,
              greeting: cfg.greeting || DEFAULT_CONFIG.greeting,
              faqs: cfg.faqs || '[]',
              customInstructions: cfg.customInstructions || '',
              language: cfg.language || 'en',
              escalationMessage: cfg.escalationMessage || DEFAULT_CONFIG.escalationMessage,
              autoResponseDelay: cfg.autoResponseDelay || 1000,
            });
            try {
              setFaqs(JSON.parse(cfg.faqs || '[]'));
            } catch { setFaqs([]); }
          }
        }
      } catch (error) {
        console.error('Fetch config error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  // Fetch interactions
  useEffect(() => {
    async function loadInteractions() {
      try {
        const params = new URLSearchParams({ page: String(interactionPage), limit: '10' });
        if (interactionFilter === 'positive') params.set('rating', 'positive');
        if (interactionFilter === 'negative') params.set('rating', 'negative');
        if (interactionFilter === 'escalated') params.set('escalated', 'true');

        const res = await fetch(`/api/aethex/interactions?${params}`);
        if (res.ok) {
          const data = await res.json();
          setInteractions(data.interactions || []);
          setInteractionTotal(data.total || 0);
        }
      } catch (error) {
        console.error('Fetch interactions error:', error);
      }
    }
    loadInteractions();
  }, [interactionPage, interactionFilter]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        ...config,
        faqs: JSON.stringify(faqs),
      };
      delete (payload as Record<string, unknown>).id;

      const res = await fetch('/api/aethex/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig((prev) => ({ ...prev, id: data.config.id }));
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Save config error:', error);
    } finally {
      setSaving(false);
    }
  }, [config, faqs]);

  const addFaq = useCallback(() => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setFaqs((prev) => [...prev, { ...newFaq }]);
    setNewFaq({ question: '', answer: '' });
  }, [newFaq]);

  const removeFaq = useCallback((index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Analytics
  const totalChats = interactionTotal;
  const positiveRatings = interactions.filter((i) => i.rating === 2).length;
  const totalRatings = interactions.filter((i) => i.rating !== null).length;
  const satisfactionPct = totalRatings > 0 ? Math.round((positiveRatings / totalRatings) * 100) : 0;
  const escalatedCount = interactions.filter((i) => i.escalated).length;
  const escalationRate = interactions.length > 0 ? Math.round((escalatedCount / interactions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006633] dark:border-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/dashboard/merchant" />}
            nativeButton={false}
            className="mb-2 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-[#006633] dark:text-emerald-400" />
            Aethex AI Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your AI customer service assistant
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#006633] hover:bg-[#1B6B3A] text-white"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalChats}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Chats</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <ThumbsUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{satisfactionPct}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{escalationRate}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Escalation Rate</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          {/* Enable/Disable Toggle */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-[#006633] dark:text-emerald-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Aethex AI Chat</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {config.isEnabled ? 'Active on your storefront' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.isEnabled}
                    onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006633] dark:bg-gray-700 dark:peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Greeting Message */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Greeting Message</Label>
              <Input
                value={config.greeting}
                onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                placeholder="Hi! How can I help you today?"
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </CardContent>
          </Card>

          {/* Language & Delay */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</Label>
                <Select
                  value={config.language}
                  onValueChange={(value: string | null) => {
                    if (value) setConfig({ ...config, language: value });
                  }}
                >
                  <SelectTrigger className="mt-1 w-full dark:bg-gray-800 dark:border-gray-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Auto-response Delay: {config.autoResponseDelay}ms
                </Label>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={100}
                  value={config.autoResponseDelay}
                  onChange={(e) => setConfig({ ...config, autoResponseDelay: parseInt(e.target.value) })}
                  className="w-full mt-1 accent-[#006633] dark:accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>500ms</span>
                  <span>5000ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Escalation Message */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Escalation Message</Label>
              <Input
                value={config.escalationMessage}
                onChange={(e) => setConfig({ ...config, escalationMessage: e.target.value })}
                placeholder="Let me connect you with the store owner..."
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4 space-y-3">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Instructions</Label>
              <Textarea
                value={config.customInstructions}
                onChange={(e) => setConfig({ ...config, customInstructions: e.target.value })}
                placeholder="Additional instructions for the AI assistant (e.g., 'Always mention our return policy', 'Offer discounts for bulk orders')..."
                rows={4}
                className="dark:bg-gray-800 dark:border-gray-700"
              />
            </CardContent>
          </Card>
        </div>

        {/* FAQ Manager & Interaction Logs */}
        <div className="space-y-4">
          {/* FAQ Manager */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
                FAQ Manager
                <Badge variant="secondary" className="text-xs">{faqs.length}</Badge>
              </h3>

              {/* Add FAQ */}
              <div className="space-y-2 mb-4">
                <Input
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  placeholder="Question"
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Input
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Answer"
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFaq}
                  disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                  className="w-full"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add FAQ
                </Button>
              </div>

              {/* FAQ List */}
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {faqs.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No FAQs yet. Add some to help the AI answer common questions.
                  </p>
                ) : (
                  faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{faq.question}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{faq.answer}</p>
                        </div>
                        <button
                          onClick={() => removeFaq(i)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors shrink-0"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interaction Logs */}
          <Card className="dark:bg-gray-900 dark:border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-[#006633] dark:text-emerald-400" />
                  Interaction Logs
                  <Badge variant="secondary" className="text-xs">{interactionTotal}</Badge>
                </h3>
                <div className="flex gap-1">
                  {['all', 'positive', 'negative', 'escalated'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setInteractionFilter(filter); setInteractionPage(1); }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        interactionFilter === filter
                          ? 'bg-[#006633] text-white dark:bg-emerald-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {interactions.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No interactions yet.
                  </p>
                ) : (
                  interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{interaction.question}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{interaction.answer}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {interaction.escalated && (
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-1.5">
                              Escalated
                            </Badge>
                          )}
                          {interaction.rating === 2 && <ThumbsUp className="h-3 w-3 text-emerald-500" />}
                          {interaction.rating === 1 && <ThumbsDown className="h-3 w-3 text-red-500" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        {new Date(interaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {interactionTotal > 10 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={interactionPage === 1}
                    onClick={() => setInteractionPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {interactionPage} of {Math.ceil(interactionTotal / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={interactionPage >= Math.ceil(interactionTotal / 10)}
                    onClick={() => setInteractionPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
