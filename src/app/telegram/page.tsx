'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  SparklesIcon,
  GraduationCapIcon,
  CpuIcon,
  CompassIcon,
  BookOpenIcon,
  CheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@/components/ui/Icons';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export default function TelegramIntegrationPage() {
  // Live Simulator State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: `🎓 *Welcome to EduSelect AI Bot!*

Your 24/7 personal college admissions and career counselling assistant for Indian students.

*Quick Commands to Try:*
• \`/cutoff 12500 GM\` — Check KCET 2026 cutoff odds
• \`/roadmap PCB\` — Class 11-12 PU & medical roadmap
• \`/colleges RVCE\` — Verified NIRF fees & placements
• \`/help\` — View full commands list

Try clicking the buttons below or type any question!`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Webhook Diagnostics State
  const [tokenStatus, setTokenStatus] = useState<{ configured: boolean; maskedToken: string | null } | null>(null);
  const [webhookInputUrl, setWebhookInputUrl] = useState('');
  const [webhookStatusData, setWebhookStatusData] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Auto-scroll simulator
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check bot configuration on mount
  useEffect(() => {
    fetch('/api/telegram/webhook')
      .then((res) => res.json())
      .then((data) => {
        setTokenStatus({
          configured: Boolean(data.tokenConfigured),
          maskedToken: data.maskedToken || null,
        });
      })
      .catch(() => {});
  }, []);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isSimulating) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsSimulating(true);

    try {
      const res = await fetch(`/api/telegram/webhook?simulate=${encodeURIComponent(textToSend.trim())}`);
      const json = await res.json();

      if (json.simulation?.response) {
        const botMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: json.simulation.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      toast.error('Simulation error');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCheckWebhookInfo = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch('/api/telegram/webhook?action=getInfo');
      const json = await res.json();
      setWebhookStatusData(json.webhookInfo || json);
      toast.success('Fetched live webhook status from Telegram');
    } catch {
      toast.error('Failed to communicate with Telegram API');
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleRegisterWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookInputUrl.trim()) {
      toast.error('Please enter your full public webhook URL');
      return;
    }

    try {
      const res = await fetch(
        `/api/telegram/webhook?action=setWebhook&url=${encodeURIComponent(webhookInputUrl.trim())}`
      );
      const json = await res.json();
      if (json.success) {
        toast.success('Webhook registered successfully with Telegram!');
        handleCheckWebhookInfo();
      } else {
        toast.error(json.error || 'Failed to set webhook');
      }
    } catch {
      toast.error('Error contacting webhook setup');
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="flex flex-col gap-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24A1DE]/20 text-[#24A1DE] border border-[#24A1DE]/30 text-xs font-bold w-fit mx-auto md:mx-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
              </svg>
              <span>Telegram Bot Integration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              EduSelect on Telegram: <span className="text-[#24A1DE]">24/7 AI Guidance</span> in Your Pocket
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Enable students to check KCET 2026 cutoffs, generate year-by-year career roadmaps, and receive verified NIRF college insights directly inside Telegram with zero installation.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href="https://t.me/EduSelectBot"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#24A1DE] hover:bg-[#208bbf] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#24A1DE]/25 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
                </svg>
                <span>Launch Bot in Telegram ↗</span>
              </a>

              <a
                href="#guide"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors"
              >
                Step-by-Step Setup Guide ↓
              </a>
            </div>
          </div>

          {/* Quick Badges Tile */}
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 flex flex-col gap-4 w-full md:w-80 shrink-0">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Student Capabilities:
            </span>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>KCET Cutoff Odds on Demand</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>4-Phase Career Roadmaps</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>455 Verified College Directory</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <span>Works on 2G/3G mobile networks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN WORKSPACE: LIVE SIMULATOR + HIGHLIGHTS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Interactive Telegram Simulator (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-blue-600" />
              <span>Interactive Live Telegram Simulator</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">Test real bot responses</span>
          </div>

          {/* Simulator Box */}
          <div className="bg-[#0E1621] rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Telegram Header */}
            <div className="bg-[#17212B] p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center font-bold text-base shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <span>EduSelect AI Bot</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400">
                      BOT
                    </span>
                  </div>
                  <div className="text-[11px] text-[#24A1DE]">online • verified educational counsellor</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: '1',
                      sender: 'bot',
                      text: '🎓 *EduSelect Bot Ready.* Pick a command below or send your question!',
                      timestamp: 'Just now',
                    },
                  ])
                }
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Clear Chat
              </button>
            </div>

            {/* Chat Messages Body */}
            <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#0E1621]">
              {messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line shadow-sm ${
                        isUser
                          ? 'bg-[#2B5278] text-white rounded-br-none'
                          : 'bg-[#182533] text-slate-100 rounded-bl-none border border-slate-700/60'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-500 px-1 mt-0.5">{m.timestamp}</span>
                  </div>
                );
              })}

              {isSimulating && (
                <div className="flex items-center gap-2 text-xs text-[#24A1DE] p-2 bg-[#182533] rounded-xl w-fit">
                  <div className="w-3 h-3 border-2 border-[#24A1DE] border-t-transparent rounded-full animate-spin" />
                  <span>EduSelect AI is generating response...</span>
                </div>
              )}
            </div>

            {/* Quick Trigger Chips */}
            <div className="bg-[#17212B] p-2.5 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-400 font-bold px-1 shrink-0">Try:</span>
              {[
                '/cutoff 12450 GM',
                '/cutoff 25000 2A',
                '/roadmap PCB',
                '/roadmap CSE',
                '/colleges RVCE',
                '/help',
              ].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSendMessage(cmd)}
                  disabled={isSimulating}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#2B5278] text-slate-200 transition-colors whitespace-nowrap shrink-0 border border-slate-700"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-[#17212B] p-3 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type /cutoff, /roadmap, or any admissions question..."
                className="flex-1 bg-[#0E1621] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#24A1DE]"
              />
              <button
                type="submit"
                disabled={isSimulating || !inputText.trim()}
                className="p-2.5 rounded-xl bg-[#24A1DE] hover:bg-[#208bbf] text-white disabled:opacity-40 transition-colors"
                title="Send"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Bot Features & Fast Facts (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CpuIcon className="w-5 h-5 text-[#24A1DE]" />
              <span>Why Students Prefer Telegram</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-xl">⚡</span>
                <div>
                  <div className="font-extrabold text-slate-900">Instant KCET & Board Predictions</div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Type <code>/cutoff 12450</code> to immediately discover closing ranks and eligibility chances across 455 colleges.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xl">🧭</span>
                <div>
                  <div className="font-extrabold text-slate-900">Year-by-Year Career Roadmaps</div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Send <code>/roadmap PCB</code> or <code>/roadmap CSE</code> to obtain duration, exams, and verified initial steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-xl">💬</span>
                <div>
                  <div className="font-extrabold text-slate-900">Private AI Counsellor DMs</div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Ask doubts about CSE vs ECE, Polytechnic vs 11th Science, or government recruitments in plain English.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bot Token Status Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Telegram Server Status
              </span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  tokenStatus?.configured
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {tokenStatus?.configured ? '● Live Bot Token Active' : '○ Token Pending in .env'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {tokenStatus?.configured
                ? `Active Token: ${tokenStatus.maskedToken}. Webhook is ready to process live student updates.`
                : `Add TELEGRAM_BOT_TOKEN to your .env.local to activate direct Telegram messaging.`}
            </p>

            <button
              type="button"
              onClick={handleCheckWebhookInfo}
              disabled={isLoadingStatus}
              className="mt-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center cursor-pointer"
            >
              {isLoadingStatus ? 'Connecting to Telegram...' : 'Verify Telegram Webhook Status →'}
            </button>

            {webhookStatusData && (
              <pre className="p-3 bg-slate-900 text-emerald-400 text-[10px] rounded-xl overflow-x-auto max-h-36">
                {JSON.stringify(webhookStatusData, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </main>

      {/* 3. STEP-BY-STEP COMPLETE INTEGRATION GUIDE */}
      <section id="guide" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 flex flex-col gap-8">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold w-fit mx-auto">
            <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Developer & Admin Setup Guide</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How to Connect Your Telegram Bot in 4 Easy Steps
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Follow this complete walkthrough to create your bot, add your API token, and go live.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Create Bot with @BotFather
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-600">Telegram App</span>
            </div>

            <ol className="flex flex-col gap-2.5 text-xs text-slate-600 leading-relaxed list-decimal pl-4">
              <li>
                Open Telegram and search for the verified account <strong>@BotFather</strong>.
              </li>
              <li>
                Send the command <code>/newbot</code>.
              </li>
              <li>
                Choose a friendly display name (e.g., <code>EduSelect College Counsellor</code>).
              </li>
              <li>
                Choose a username ending in <code>bot</code> (e.g., <code>EduSelectAdvisor_bot</code>).
              </li>
              <li>
                BotFather will immediately generate an <strong>HTTP API Token</strong> (e.g. <code>7123456789:AAH...</code>).
              </li>
            </ol>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Add Token to Environment
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600">Project Config</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Open your <code>.env.local</code> file in your project root and paste the token:
            </p>

            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono select-all overflow-x-auto">
              TELEGRAM_BOT_TOKEN="7123456789:AAHxxxxxxxxxxxxxxxxxxxx"
            </div>

            <p className="text-[11px] text-slate-500">
              When deploying to Vercel, add this same key in <strong>Project Settings → Environment Variables</strong>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Register the Webhook URL
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-600">Automated</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Telegram sends updates to your webhook route: <code>/api/telegram/webhook</code>.
              Enter your live domain or ngrok URL below to register it with one click:
            </p>

            <form onSubmit={handleRegisterWebhook} className="flex flex-col gap-2">
              <input
                type="url"
                value={webhookInputUrl}
                onChange={(e) => setWebhookInputUrl(e.target.value)}
                placeholder="https://your-domain.com/api/telegram/webhook"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Register Webhook with Telegram →
              </button>
            </form>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Test and Share with Students
                </h3>
              </div>
              <span className="text-[11px] font-bold text-amber-600">Ready to Share</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Open Telegram on your phone or desktop, search for your bot username, click <strong>Start</strong>, and test commands:
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-slate-800">/start</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-slate-800">/cutoff 12500 GM</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-slate-800">/roadmap PCB</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-slate-800">/colleges RVCE</span>
            </div>

            <p className="text-[11px] text-slate-500 pt-1">
              Share your direct <code>https://t.me/YourBotName</code> link on student WhatsApp groups and college noticeboards.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
