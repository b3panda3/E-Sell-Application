'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  MessageSquare,
  Send,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Conversation {
  partner: { id: string; name: string; image: string | null };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
  sender: { id: string; name: string; image: string | null };
  recipient: { id: string; name: string; image: string | null };
}

export default function CustomerMessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (partnerId: string) => {
    try {
      const res = await fetch(`/api/messages/conversation/${partnerId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedPartner) {
      fetchMessages(selectedPartner);
    }
  }, [selectedPartner, fetchMessages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!selectedPartner) return;
    const interval = setInterval(() => {
      fetchMessages(selectedPartner);
      fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedPartner, fetchMessages, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!selectedPartner || !messageInput.trim()) return;
    setSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedPartner,
          content: messageInput.trim(),
        }),
      });

      if (res.ok) {
        setMessageInput('');
        fetchMessages(selectedPartner);
        fetchConversations();
      }
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex h-[calc(100vh-14rem)]">
        {/* Conversation Sidebar */}
        <div
          className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col ${
            selectedPartner ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partner.id}
                  onClick={() => setSelectedPartner(conv.partner.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 ${
                    selectedPartner === conv.partner.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center shrink-0">
                    {conv.partner.image ? (
                      <img
                        src={conv.partner.image}
                        alt={conv.partner.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {conv.partner.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {conv.partner.name}
                      </p>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-blue-500 text-white text-[10px] h-5 min-w-5">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Area */}
        <div
          className={`flex-1 flex flex-col ${
            selectedPartner ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedPartner ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSelectedPartner(null)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {conversations.find((c) => c.partner.id === selectedPartner)?.partner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {conversations.find((c) => c.partner.id === selectedPartner)?.partner.name}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.senderId === session?.user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? 'bg-blue-500 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isMine ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
