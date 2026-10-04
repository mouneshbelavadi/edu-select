'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

const BOT_USERNAME = 'EDUSELECTADVISOR_BOT';
const BOT_LINK = `https://t.me/${BOT_USERNAME}`;

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

  // Auto-scroll simulator
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      } else {
        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'bot',
          text: `🤖 I received "${textToSend.trim()}". Send /start or /help to see all admission tools!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch {
      toast.error('Simulation error. The bot will respond inside Telegram.');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(BOT_LINK);
      toast.success(`Copied ${BOT_LINK} to clipboard!`);
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
              <span>Official Telegram Integration</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              EduSelect on Telegram: <span className="text-[#24A1DE]">24/7 AI Guidance</span> in Your Pocket
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Check KCET 2026 cutoffs, explore career roadmaps, and receive verified NIRF college insights directly inside Telegram with zero installation. Connect with{' '}
              <span className="text-[#24A1DE] font-bold">@{BOT_USERNAME}</span>.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a
                href={BOT_LINK}
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
                href="#qrcode"
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition-colors flex items-center gap-1.5"
              >
                <span>📷 Scan QR Code</span>
                <span aria-hidden="true">↓</span>
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

      {/* 2. MAIN INTERACTIVE SIMULATOR & FEATURES */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Telegram Mobile Chat Mockup */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Try Live Bot Simulator
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Click sample pills or test live</span>
          </div>

          {/* Telegram Phone Wrapper */}
          <div className="bg-[#0e1621] text-white rounded-3xl shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col h-[520px]">
            
            {/* Mock Header */}
            <div className="bg-[#17212b] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow">
                  EC
                </div>
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                    <span>EduSelect Career Counsellor</span>
                    <span className="text-[10px] text-emerald-400">● bot</span>
                  </div>
                  <span className="text-[10px] text-slate-400">@{BOT_USERNAME}</span>
                </div>
              </div>

              <a
                href={BOT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-[#24A1DE]/20 hover:bg-[#24A1DE]/30 text-[#24A1DE] text-[11px] font-bold transition-colors"
              >
                Open in App ↗
              </a>
            </div>

            {/* Chat Body */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#0e1621] text-xs leading-relaxed"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3 sm:p-3.5 shadow-sm ${
                    m.sender === 'user'
                      ? 'self-end bg-[#2b5278] text-white rounded-tr-none'
                      : 'self-start bg-[#182533] text-slate-100 rounded-tl-none border border-slate-700/40'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed font-sans">{m.text}</p>
                  <span
                    className={`text-[9px] mt-1 self-end ${
                      m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              ))}

              {isSimulating && (
                <div className="self-start bg-[#182533] text-slate-400 rounded-2xl rounded-tl-none p-3 border border-slate-700/40 flex items-center gap-2">
                  <span className="animate-spin text-sm">⏳</span>
                  <span>EduSelect Bot is typing response...</span>
                </div>
              )}
            </div>

            {/* Sample Chips */}
            <div className="bg-[#17212b] px-3 py-2 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="text-slate-400 shrink-0 font-medium">Try:</span>
              <button
                type="button"
                onClick={() => handleSendMessage('/cutoff 12500 GM')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono shrink-0 transition-colors cursor-pointer"
              >
                /cutoff 12500 GM
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('/roadmap PCB')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono shrink-0 transition-colors cursor-pointer"
              >
                /roadmap PCB
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage('/colleges BMS')}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-blue-300 font-mono shrink-0 transition-colors cursor-pointer"
              >
                /colleges BMS
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-[#17212b] p-3 border-t border-slate-800/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type command (/cutoff, /roadmap) or question..."
                className="flex-1 bg-[#242f3d] text-white placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#24A1DE] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSimulating || !inputText.trim()}
                className="w-9 h-9 rounded-xl bg-[#24A1DE] hover:bg-[#208bbf] disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Capabilities & Direct Bot Profile Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-blue-600" />
              <span>What Students Can Do in Telegram</span>
            </h3>

            <div className="flex flex-col gap-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-extrabold text-slate-900">Instant KCET 2026 Predictions</div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Type <code>/cutoff [rank] [cat]</code> (e.g. <code>/cutoff 14000 GM</code>) to view high, moderate, and ambitious engineering college cutoffs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-xl">🏛️</span>
                <div>
                  <div className="font-extrabold text-slate-900">Accredited College Details</div>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Search 455 verified colleges with <code>/colleges RV</code> or <code>/colleges Mysore</code> for verified fee bands and placement packages.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-xl">🧭</span>
                <div>
                  <div className="font-extrabold text-slate-900">4-Phase Career Milestones</div>
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

          {/* Official Bot Profile Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                EC
              </div>
              <div className="flex flex-col">
                <div className="font-black text-base flex items-center gap-1.5">
                  <span>EduSelect Career Counsellor</span>
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs text-[#24A1DE] font-semibold">@{BOT_USERNAME}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Available 24/7 on Android, iOS, and Telegram Web. No account creation needed — chat directly and get instant admission data.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href={BOT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#24A1DE] hover:bg-[#208bbf] text-white font-bold text-xs text-center shadow-lg shadow-[#24A1DE]/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Open in Telegram App ↗</span>
              </a>

              <a
                href="#qrcode"
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs text-center border border-white/15 transition-colors whitespace-nowrap"
              >
                View QR Code ↓
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* 3. SCAN QR CODE TO CHAT DIRECTLY (REPLACED SETUP GUIDE) */}
      <section id="qrcode" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 flex flex-col gap-8 scroll-mt-16">
        
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold w-fit mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Instant Mobile & Desktop Access</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Scan QR Code to Chat Directly on Telegram
          </h2>

          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Scan this official QR code with your smartphone camera, Google Lens, or the Telegram scanner to start an instant 1-on-1 session with <strong className="text-blue-700 font-bold">@{BOT_USERNAME}</strong>.
          </p>
        </div>

        {/* QR Code Presentation Showcase Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Official Telegram QR Code */}
          <div className="md:col-span-5 flex flex-col items-center justify-center gap-3">
            <div className="relative p-3 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 rounded-3xl shadow-2xl border-4 border-slate-800 max-w-[280px] w-full flex flex-col items-center">
              
              {/* QR Code Image */}
              <div className="relative w-full aspect-[9/19] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <Image
                  src="/images/telegram/telegram-qr.png"
                  alt={`EduSelect Telegram Bot QR Code (@${BOT_USERNAME})`}
                  fill
                  sizes="(max-width: 768px) 280px, 320px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Verified Username Under QR */}
              <div className="mt-3 py-1.5 px-3 rounded-full bg-white/10 text-white font-mono text-xs font-bold tracking-wider text-center border border-white/10 w-full">
                @{BOT_USERNAME}
              </div>
            </div>

            <span className="text-[11px] font-semibold text-slate-500 text-center">
              Point your smartphone camera to connect
            </span>
          </div>

          {/* Right Column: Connection Steps & 1-Click Action */}
          <div className="md:col-span-7 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Official Telegram Channel & Assistant
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Connect in 3 Simple Steps
              </h3>
            </div>

            {/* 3 Steps */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 text-sm">Scan the QR Code</span>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Open your iPhone / Android Camera, Google Lens, or tap the QR icon inside Telegram search.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 text-sm">Tap "Start" in Telegram</span>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Telegram will open <strong>@{BOT_USERNAME}</strong>. Click <em>Start</em> to receive your personalized menu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-900 text-sm">Receive Free 24/7 Guidance</span>
                  <p className="text-slate-600 mt-0.5 leading-snug">
                    Send <code>/cutoff 12000 GM</code>, <code>/roadmap PCB</code>, or ask any counselling doubt in plain English.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button & Share Link Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <a
                href={BOT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-6 rounded-2xl bg-[#24A1DE] hover:bg-[#208bbf] text-white font-black text-xs sm:text-sm text-center shadow-lg shadow-[#24A1DE]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.538-.196 1.006.128.832.943z" />
                </svg>
                <span>Open in Telegram (@{BOT_USERNAME}) ↗</span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              >
                Copy Link 📋
              </button>
            </div>

            {/* Quick Command Pills */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Popular Commands to Try:</span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-mono">/start</span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">/cutoff 15000 GM</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-mono">/roadmap PCB</span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-mono">/colleges RVCE</span>
              </div>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
