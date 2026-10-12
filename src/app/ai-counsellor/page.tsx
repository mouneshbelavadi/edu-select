'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
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

interface QuickTopic {
  id: string;
  category: string;
  icon: string;
  title: string;
  prompt: string;
  badge: string;
}

const CAREER_TOPIC_CATEGORIES = [
  { id: 'all', label: '🌟 All Questions' },
  { id: '10th', label: '🧭 After 10th' },
  { id: '12th_science', label: '🔬 12th Science & Tech' },
  { id: 'medical', label: '🩺 Medical & NEET' },
  { id: 'btech', label: '💻 Engineering Branches' },
  { id: 'colleges', label: '🏛️ Top Colleges & Cutoffs' },
  { id: 'commerce', label: '📊 Commerce & CA' },
  { id: 'arts', label: '🎨 Arts & Law' },
  { id: 'diploma', label: '⚡ Polytechnic & ITI' },
  { id: 'govt', label: '📜 Govt Jobs & Exams' },
];

const PRE_FILLED_QUESTIONS: QuickTopic[] = [
  // After 10th
  {
    id: 'c10-1',
    category: '10th',
    icon: '🧭',
    title: 'Top pathways after Class 10',
    prompt: 'What are all my educational options after 10th standard (PUC Science, Commerce, Arts, Polytechnic, ITI)?',
    badge: 'After 10th',
  },
  {
    id: 'c10-2',
    category: '10th',
    icon: '⚡',
    title: 'Polytechnic Diploma vs 11th Science',
    prompt: 'Should I choose a 3-year Polytechnic Diploma or 11th/12th Science if my goal is Engineering?',
    badge: 'Diploma',
  },
  {
    id: 'c10-3',
    category: '10th',
    icon: '🔧',
    title: 'ITI Trades & Public Sector Careers',
    prompt: 'What are the top ITI trades (Electrician, Fitter, COPA) and what jobs can I get in Indian Railways or PSUs?',
    badge: 'ITI Trades',
  },

  // 12th Science & Tech
  {
    id: 'sci-1',
    category: '12th_science',
    icon: '🔬',
    title: 'Best Careers with Science PCM',
    prompt: 'What are the best degree options after 12th PCM besides mainstream engineering?',
    badge: '12th PCM',
  },
  {
    id: 'sci-2',
    category: '12th_science',
    icon: '⚓',
    title: 'Merchant Navy & Marine Careers',
    prompt: 'How can I join the Merchant Navy after 12th PCM? What are the salaries and eligibility for B.Sc Nautical Science?',
    badge: 'Merchant Navy',
  },
  {
    id: 'sci-3',
    category: '12th_science',
    icon: '🔭',
    title: 'Pure Science & Research at IISc / IISER',
    prompt: 'How can I get into IISc Bangalore or IISERs for scientific research after 12th?',
    badge: 'Research',
  },

  // Medical & NEET
  {
    id: 'med-1',
    category: 'medical',
    icon: '🩺',
    title: 'Can I do MBBS with PCM without Biology?',
    prompt: 'Can I become a doctor if I take PCM in 11th and 12th? What are the NMC regulations for NEET-UG?',
    badge: 'NMC / NEET',
  },
  {
    id: 'med-2',
    category: 'medical',
    icon: '🏥',
    title: 'Medical Rural Bonds & USMLE Mobility',
    prompt: 'What are the rural service bond requirements in government medical colleges, and can Indian MBBS doctors practice abroad (USMLE / WFME)?',
    badge: 'MBBS Bonds',
  },
  {
    id: 'med-3',
    category: 'medical',
    icon: '💊',
    title: 'High-Demand Allied Health & Nursing',
    prompt: 'What are the top medical options without NEET (B.Sc Nursing, BPT Physiotherapy, B.Pharm, Radiology)?',
    badge: 'Allied Health',
  },

  // Engineering Branches
  {
    id: 'eng-1',
    category: 'btech',
    icon: '💻',
    title: 'CSE vs ECE vs AI/DS Comparison',
    prompt: 'Which engineering branch offers the best placements and long-term versatility: CSE, ECE, or AI & Data Science?',
    badge: 'Branch Comparison',
  },
  {
    id: 'eng-2',
    category: 'btech',
    icon: '⚙️',
    title: 'Mechanical & Civil Engineering Scope',
    prompt: 'What are the career prospects, PSU jobs via GATE, and salary trends for Mechanical and Civil Engineering?',
    badge: 'Core Engg',
  },
  {
    id: 'eng-3',
    category: 'btech',
    icon: '🌐',
    title: 'Washington Accord & Tier-1 NBA Value',
    prompt: 'What is the Washington Accord and how does Tier-1 NBA accreditation help Indian engineering graduates work abroad?',
    badge: 'Global Licensure',
  },

  // Colleges & Cutoffs
  {
    id: 'col-1',
    category: 'colleges',
    icon: '🏛️',
    title: 'Compare Top Bangalore Engineering Colleges',
    prompt: 'Compare RVCE, BMSCE, MSRIT, PES University, and UVCE in terms of KCET cutoffs, median placements, and fees.',
    badge: 'KCET Cutoffs',
  },
  {
    id: 'col-2',
    category: 'colleges',
    icon: '💰',
    title: 'Low-Fee Government Engineering Colleges',
    prompt: 'Which are the top government engineering colleges in Karnataka with low fees and good placements like UVCE or NITK?',
    badge: 'Govt Colleges',
  },

  // Commerce & CA
  {
    id: 'com-1',
    category: 'commerce',
    icon: '📊',
    title: 'Chartered Accountancy (ICAI New 2-Year Scheme)',
    prompt: 'Explain the ICAI new scheme for CA: Foundation, Inter, 2-year articleship stipend, and career salary progression.',
    badge: 'CA / Finance',
  },
  {
    id: 'com-2',
    category: 'commerce',
    icon: '📈',
    title: 'B.Com vs BBA vs Corporate Finance',
    prompt: 'Which degree has better scope for corporate careers: B.Com (with ACCA/CMA) or BBA (leading to MBA)?',
    badge: 'B.Com / BBA',
  },

  // Arts & Law
  {
    id: 'art-1',
    category: 'arts',
    icon: '⚖️',
    title: '5-Year Integrated Law via CLAT (NLUs)',
    prompt: 'How do I prepare for CLAT to get into top NLUs like NLSIU Bangalore for 5-year BA LLB / BBA LLB?',
    badge: 'Law / CLAT',
  },
  {
    id: 'art-2',
    category: 'arts',
    icon: '🏛️',
    title: 'Humanities & UPSC Civil Services',
    prompt: 'Which subjects in Arts / Humanities provide the strongest foundation for the UPSC Civil Services (IAS/IPS)?',
    badge: 'UPSC / Civils',
  },

  // Polytechnic & Lateral Entry
  {
    id: 'dip-1',
    category: 'diploma',
    icon: '⚡',
    title: 'Polytechnic Lateral Entry (DCET to 2nd Year B.Tech)',
    prompt: 'How does lateral entry work for diploma students writing Karnataka DCET to join 2nd year B.Tech directly?',
    badge: 'DCET Lateral',
  },

  // Govt Jobs
  {
    id: 'gov-1',
    category: 'govt',
    icon: '📜',
    title: 'Central Government Jobs After 12th Pass',
    prompt: 'Which central government jobs can I apply for directly after 12th (SSC CHSL, NDA Defence, Railway RRB)?',
    badge: 'Govt Jobs 12th',
  },
  {
    id: 'gov-2',
    category: 'govt',
    icon: '🎖️',
    title: 'Armed Forces Officer Entry (NDA & Agniveer)',
    prompt: 'What are the eligibility criteria, physical requirements, and exam pattern for NDA and Indian Army/Navy Agniveer?',
    badge: 'Defence Entry',
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
  const [activeCategory, setActiveCategory] = useState<string>('all');

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

  // Send message function wrapped in useCallback for stable reference
  const sendMessage = useCallback(
    async (textToSend?: string) => {
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
      } catch {
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
    },
    [inputText, isLoading, messages]
  );

  // Handle initial query from URL
  useEffect(() => {
    if (initialQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

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

  // Filtered pre-filled questions based on selected category
  const filteredQuestions = useMemo(() => {
    if (activeCategory === 'all') return PRE_FILLED_QUESTIONS;
    return PRE_FILLED_QUESTIONS.filter((q) => q.category === activeCategory);
  }, [activeCategory]);

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
                  Live Career Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Mapped to 455 Colleges, 100+ Pathways, 31 Engineering Branches & Official Entrance Exams
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
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
          {/* EMPTY STATE / PURE CHATBOT LANDING WITH PRE-FILLED DATA SELECTOR */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-4 sm:py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4 shadow-sm">
                <SparklesIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Ask EduSelect Anything
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-lg leading-relaxed">
                Your dedicated AI career counsellor. Select any pre-filled topic below or type your own question to receive verified advice mapped to our database.
              </p>

              {/* CATEGORY SELECTOR PILLS */}
              <div className="mt-6 w-full max-w-3xl">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
                  {CAREER_TOPIC_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#1E2A78] text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>

                {/* PRE-FILLED QUESTIONS GRID */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                  {filteredQuestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => sendMessage(item.prompt)}
                      className="p-3.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl text-left transition-all duration-150 group flex flex-col justify-between shadow-xs hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {item.badge}
                        </span>
                      </div>
                      <div className="mt-2.5">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 leading-snug">
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

          {/* ACTIVE MESSAGES STREAM */}
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
                            Verified EduSelect Database Sources & Directories:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {message.sources.map((src, sIdx) => (
                              <Link
                                key={sIdx}
                                href={src.url}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-colors"
                              >
                                {src.type === 'College' || src.type === 'Colleges' ? (
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
                          className="hover:text-slate-700 transition-colors flex items-center gap-1 font-medium cursor-pointer"
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
                  Checking EduSelect database & generating recommendations...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 3. STICKY BOTTOM INPUT BAR WITH PRE-FILLED TOPIC PILLS */}
      <footer className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* PERSISTENT QUICK SELECTOR PILLS STRIP */}
          <div className="mb-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden sm:inline">
              Suggested:
            </span>
            {PRE_FILLED_QUESTIONS.slice(0, 8).map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => sendMessage(q.prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[11px] font-medium whitespace-nowrap transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <span>{q.icon}</span>
                <span>{q.title}</span>
              </button>
            ))}
          </div>

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
              placeholder="Ask anything about careers, courses, colleges, cutoffs, or select a pre-filled topic above..."
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
            <span>
              Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Enter</kbd> to send,{' '}
              <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">Shift + Enter</kbd> for newline
            </span>
            <span className="hidden sm:inline">Strictly Educational & Career Guidance • Grounded in NIRF 2025 & KEA KCET Data</span>
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
