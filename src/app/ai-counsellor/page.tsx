'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  SparklesIcon,
  CheckIcon,
  ArrowRightIcon,
  GraduationCapIcon,
  BuildingLibraryIcon,
  CompassIcon,
} from '@/components/ui/Icons';

interface MessageSource {
  title: string;
  url: string;
  type: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: MessageSource[];
}

const STARTER_PROMPTS = [
  {
    icon: '🧭',
    title: 'After 10th Choices',
    prompt: 'What are my best options after 10th if I enjoy science and practical machines?',
    tag: 'Class 10',
  },
  {
    icon: '🩺',
    title: 'Can I do MBBS with PCM?',
    prompt: 'Can I become a doctor if I take PCM in 11th and 12th? What are the NMC rules?',
    tag: 'Medical',
  },
  {
    icon: '💻',
    title: 'CSE vs ECE vs AI Engineering',
    prompt: 'Which engineering branch offers the best placements and versatility: CSE, ECE, or AI/DS?',
    tag: 'B.Tech',
  },
  {
    icon: '🏛️',
    title: 'Top Karnataka Colleges & Fees',
    prompt: 'What are the top NIRF engineering colleges in Karnataka with low tuition fees?',
    tag: 'Colleges',
  },
  {
    icon: '💼',
    title: 'Government Jobs After 12th',
    prompt: 'Which central and state government jobs can I apply for directly after 12th pass?',
    tag: 'Govt Jobs',
  },
  {
    icon: '⚡',
    title: 'Polytechnic vs 11th Science',
    prompt: 'Should I choose a 3-year Polytechnic Diploma or 11th/12th Science for engineering?',
    tag: 'Diploma',
  },
];

// Lightweight safe markdown renderer component
function MarkdownRenderer({ content }: { content: string }) {
  const renderedElements = useMemo(() => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        if (listType === 'ul') {
          elements.push(
            <ul key={`ul-${elements.length}`} className="my-2 space-y-1 list-disc pl-5 text-sm text-slate-700 leading-relaxed">
              {currentList.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="my-2 space-y-1 list-decimal pl-5 text-sm text-slate-700 leading-relaxed">
              {currentList.map((item, idx) => (
                <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
              ))}
            </ol>
          );
        }
        currentList = [];
        listType = null;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const rows = tableRows.slice(1);
        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto border border-slate-200 rounded-lg shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-200">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="p-2.5 whitespace-nowrap">
                      {col.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-slate-700">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const formatInline = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-blue-700 px-1 py-0.5 rounded text-[12px] font-mono">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 underline font-medium hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Table line
      if (line.startsWith('|') && line.endsWith('|')) {
        flushList();
        // Skip separator row like |---|---|
        if (/^\|[-|\s]+\|$/.test(line)) {
          continue;
        }
        const cols = line.split('|').slice(1, -1);
        tableRows.push(cols);
        inTable = true;
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Empty line
      if (!line) {
        flushList();
        continue;
      }

      // Headings
      if (line.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="mt-3 mb-1 text-sm font-bold text-slate-900">
            {line.replace('#### ', '')}
          </h4>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="mt-4 mb-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-1">
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="mt-4 mb-2 text-lg font-bold text-[#1E2A78]">
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }

      // Unordered list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.substring(2));
        continue;
      }

      // Ordered list item
      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(numMatch[2]);
        continue;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p
          key={`p-${i}`}
          className="my-1.5 text-sm text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }

    flushList();
    flushTable();

    return elements;
  }, [content]);

  return <div className="space-y-1">{renderedElements}</div>;
}

function AiCounsellorChat() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || searchParams.get('query') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialSentRef = useRef(false);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Send message function
  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Build history for multi-turn context
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (data.success && data.reply) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMsg = data.error || 'Unable to receive advice right now. Please try again.';
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Notice:** ${errorMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err: any) {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Network Issue:** Could not reach the counsellor service. Please check your connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Handle Enter key (Shift+Enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat
  const handleClearChat = () => {
    setMessages([]);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F8FAFC]">
      {/* 1. TOP CHAT HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 shrink-0 z-10 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1E2A78] to-blue-600 flex items-center justify-center text-white shadow-sm">
              <SparklesIcon className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  EduSelect AI Counsellor
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live AI
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Trained on 455 Colleges, 100+ Pathways, 29 Engineering Branches & Official Entrance Exams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                title="Start a new conversation"
              >
                Clear Chat
              </button>
            )}
            <Link
              href="/careers"
              className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hidden sm:flex items-center gap-1"
            >
              <CompassIcon className="w-3.5 h-3.5" />
              <span>Career Explorer</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CHAT MESSAGES CONTAINER */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6" role="log" aria-live="polite">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* EMPTY STATE / WELCOME SCREEN */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 sm:py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 shadow-sm">
                <SparklesIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ask EduSelect Anything
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-lg leading-relaxed">
                I am your pure AI career counsellor. No complicated forms or filters required—just ask your question and get verified, factual answers grounded in our data.
              </p>

              {/* STARTER PROMPTS GRID */}
              <div className="mt-8 w-full max-w-3xl">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Suggested Questions
                  </span>
                  <span className="text-xs text-slate-500">Click any prompt to ask</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {STARTER_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      className="p-3.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl text-left transition-all duration-150 group flex flex-col justify-between shadow-xs hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {item.tag}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE MESSAGES LIST */}
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#1E2A78] flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                    <SparklesIcon className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
                    isUser
                      ? 'bg-[#1E2A78] text-white rounded-br-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  ) : (
                    <div>
                      <MarkdownRenderer content={message.content} />

                      {/* Matched Data Source Chips */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                            Verified EduSelect Database Sources:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((src, sIdx) => (
                              <Link
                                key={sIdx}
                                href={src.url}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors"
                              >
                                {src.type === 'College' ? (
                                  <BuildingLibraryIcon className="w-3 h-3 text-slate-400" />
                                ) : src.type === 'Branch' ? (
                                  <GraduationCapIcon className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <CompassIcon className="w-3 h-3 text-slate-400" />
                                )}
                                <span>{src.title}</span>
                                <ArrowRightIcon className="w-2.5 h-2.5 opacity-60" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Bar (Copy) */}
                      <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{message.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(message.id, message.content)}
                          className="hover:text-slate-700 transition-colors flex items-center gap-1 font-medium"
                          title="Copy answer"
                        >
                          {copiedId === message.id ? (
                            <>
                              <CheckIcon className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <span>Copy</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isUser && (
                    <div className="mt-1 text-right text-[10px] text-blue-200/80">
                      {message.timestamp}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs mt-1 text-xs font-bold">
                    You
                  </div>
                )}
              </div>
            );
          })}

          {/* THINKING / TYPING INDICATOR */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-[#1E2A78] flex items-center justify-center text-white shrink-0 shadow-xs">
                <SparklesIcon className="w-4 h-4 text-amber-300" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 shadow-xs flex items-center gap-3">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                </div>
                <span className="text-xs font-medium text-slate-500">
                  Checking EduSelect database & generating advice...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 3. STICKY BOTTOM INPUT BAR */}
      <footer className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-end gap-2 sm:gap-3 bg-slate-50 border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl p-2 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about careers, courses, colleges, cutoffs, or entrance exams..."
              className="flex-1 bg-transparent border-0 resize-none px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 max-h-40 leading-relaxed"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2 bg-[#1E2A78] hover:bg-blue-900 disabled:opacity-40 disabled:hover:bg-[#1E2A78] text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Shift + Enter</kbd> for newline</span>
            <span className="hidden sm:inline">Grounded in NIRF 2025, KEA KCET & Verified Curricula</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AiCounsellorPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Loading AI Counsellor...
        </div>
      }
    >
      <AiCounsellorChat />
    </Suspense>
  );
}
