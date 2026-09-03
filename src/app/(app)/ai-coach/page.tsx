'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

const initialMessages = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: "Hello! I am your FLUETAS Health & Performance Assistant. I can help analyze your recovery, training progression, hydration targets, and wellness metrics. What would you like to review today?",
    timestamp: 'Now',
  },
];

const defaultProtocols = [
  {
    id: 'p-1',
    category: 'Hydration Target',
    badgeColor: '#2E6DA4',
    date: 'Daily Target',
    text: 'Maintaining baseline hydration of 2.5L improves training recovery and cognitive performance.',
  },
  {
    id: 'p-2',
    category: 'Recovery Pacing',
    badgeColor: '#7A4E9E',
    date: 'Sleep Protocol',
    text: 'Target 7.5 to 8.0 hours of deep rest to support muscular architecture and hormonal balance.',
  },
  {
    id: 'p-3',
    category: 'Training Split',
    badgeColor: '#2E7D32',
    date: 'Active Plan',
    text: 'Progressive overload across compound lifts ensures steady strength development.',
  },
];

export default function AICoachPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    // Dynamic smart responses
    setTimeout(() => {
      let botResponse = "I've logged that context into your health telemetry summary. Based on your current wellness score and workout logs, make sure to drink an extra 500ml of water and keep your protein intake above 110g today.";
      let showDoctorHandoff = false;

      const lower = query.toLowerCase();
      if (lower.includes('pain') || lower.includes('back') || lower.includes('injury') || lower.includes('doctor') || lower.includes('physio')) {
        botResponse = "I noticed you mentioned pain or back tightness. While I can suggest gentle mobility stretches, I cannot provide a medical diagnosis. Based on your lumbar history, I strongly recommend scheduling a review with Dr. Anjali Mehta (Physiotherapist).";
        showDoctorHandoff = true;
      } else if (lower.includes('vitamin') || lower.includes('report') || lower.includes('blood') || lower.includes('d3')) {
        botResponse = "Your recent metabolic panel indicated a Vitamin D3 level of 28.4 ng/mL. Dr. Priya Sharma recommended 60k IU weekly with morning fats. Would you like me to pull up your full lab trends?";
      } else if (lower.includes('workout') || lower.includes('exercise') || lower.includes('training')) {
        botResponse = "You have completed 4 out of 6 scheduled sessions this week (Total volume: 40.8 tons). You are well on track for your weekly strength progression goals!";
      } else if (lower.includes('recovery') || lower.includes('sleep')) {
        botResponse = "Your sleep consistency this week is 88%. For optimal recovery before tomorrow's strength session, aim for a bedtime around 10:45 PM with minimal screen exposure 30 minutes prior.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showDoctorHandoff,
        } as any,
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 max-w-[1150px] mx-auto w-full min-h-[calc(100vh-130px)]">
      {/* ── 1. AI Coach Header ─────────────────────────────────────────── */}
      <div className="fluetas-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFFFFF]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#7A4E9E]/10 border border-[#7A4E9E]/20 text-[#7A4E9E] flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-['Outfit'] font-bold text-base sm:text-lg text-[#12160F] m-0 tracking-tight">
                FLUETAS AI COACH
              </h1>
              <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
            </div>
            <p className="text-xs text-[#586151] m-0 mt-0.5">
              Connected to Vitals · Workouts · Nutrition · Health History
            </p>
          </div>
        </div>

        {/* Non-diagnostic Safety Label */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[0.6875rem] font-medium text-[#7A4E9E] bg-[#7A4E9E]/10 border border-[#7A4E9E]/20 px-3 py-1.5 rounded-full">
          <ShieldCheck size={13} />
          <span>AI-generated wellness guidance · Non-diagnostic</span>
        </div>
      </div>

      {/* ── 2. Pinned AI Insights & Protocols Grid ────────────────────── */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#7A4E9E]" />
            <span className="section-title">Pinned Insights &amp; Health Protocols</span>
          </div>
          <span className="text-[0.6875rem] text-[#8A9482]">Updated 30 mins ago</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultProtocols.map(ins => (
            <div
              key={ins.id}
              className="fluetas-card p-3.5 flex flex-col justify-between gap-2.5 bg-[#FFFFFF] hover:border-[#7A4E9E]/40 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[0.625rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ backgroundColor: `${ins.badgeColor}15`, color: ins.badgeColor }}
                  >
                    {ins.category}
                  </span>
                  <span className="text-[0.65rem] text-[#8A9482]">{ins.date}</span>
                </div>
                <p className="text-xs text-[#12160F] m-0 leading-relaxed font-medium">
                  {ins.text}
                </p>
              </div>

              <button
                onClick={() => handleSendMessage(`Tell me more about: ${ins.category}`)}
                className="text-xs font-semibold text-[#7A4E9E] hover:text-[#6A3E8E] hover:underline text-left flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Discuss with Coach</span>
                <ArrowRight size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Main Chat Surface ─────────────────────────────────────────── */}
      <div className="fluetas-card flex-1 flex flex-col min-h-[460px] bg-[#FFFFFF] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3.5 scroll-smooth bg-[#FAFAF6]/40">
          {messages.map((m: any) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[90%] sm:max-w-[80%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-[#7A4E9E]/10 border border-[#7A4E9E]/20 text-[#7A4E9E] flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot size={14} />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[0.84rem] leading-relaxed ${
                      isBot
                        ? 'bg-[#FFFFFF] text-[#12160F] border border-[rgba(18,22,15,0.08)] shadow-2xs rounded-tl-xs'
                        : 'bg-[#2E7D32]/10 text-[#12160F] border border-[#2E7D32]/20 font-medium rounded-tr-xs'
                    }`}
                  >
                    {isBot && (
                      <span className="text-[0.625rem] font-bold text-[#7A4E9E] uppercase tracking-wider block mb-1">
                        FLUETAS AI
                      </span>
                    )}

                    <p className="m-0 whitespace-pre-wrap">{m.text}</p>

                    {/* AI -> Doctor Handoff Card */}
                    {m.showDoctorHandoff && (
                      <div className="mt-3 pt-2.5 border-t border-[rgba(18,22,15,0.08)] bg-[#FAFAF6] p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-[#2E6DA4]/10 text-[#2E6DA4]">
                            <Stethoscope size={15} />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-[#12160F] m-0">Recommended Expert Review</p>
                            <p className="text-[0.6875rem] text-[#586151] m-0">Dr. Anjali Mehta · Physiotherapy</p>
                          </div>
                        </div>
                        <Link
                          href="/experts?spec=Physiotherapy"
                          className="btn-primary py-1.5 px-3 text-xs no-underline shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                        >
                          <span>Book Expert</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>

                  <span className="text-[0.625rem] text-[#8A9482] px-1 self-end font-mono">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 self-start items-center p-3 bg-[#FFFFFF] border border-[rgba(18,22,15,0.08)] rounded-xl text-xs text-[#586151] animate-pulse shadow-2xs">
              <Sparkles size={13} className="text-[#7A4E9E]" />
              <span>Analyzing biometric telemetry &amp; protocols...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── 4. Suggested Quick Prompt Chips ─────────────────────────────── */}
        <div className="px-4 py-2.5 bg-[#FFFFFF] border-t border-[rgba(18,22,15,0.08)] flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[0.65rem] font-bold text-[#8A9482] uppercase tracking-wider shrink-0 hidden md:inline">
            Suggested:
          </span>
          {[
            'How can I optimize recovery today?',
            'Explain my recent health trends',
            'Help me plan today\'s workout',
            'What should I discuss with my doctor?',
          ].map(chip => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAFAF6] hover:bg-[#FFFFFF] text-[#586151] hover:text-[#12160F] border border-[rgba(18,22,15,0.08)] hover:border-[#7A4E9E]/30 shrink-0 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── 5. Chat Input Bar ───────────────────────────────────────────── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-3.5 bg-[#FFFFFF] border-t border-[rgba(18,22,15,0.08)] flex items-center gap-2.5 shrink-0"
        >
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask FLUETAS AI about your health, workouts, nutrition, or recovery..."
            className="flex-1 bg-[#FAFAF6] border border-[rgba(18,22,15,0.10)] focus:border-[#7A4E9E] focus:bg-[#FFFFFF] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#12160F] placeholder-[#8A9482] outline-none transition-all shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-10 h-10 rounded-xl bg-[#7A4E9E] hover:bg-[#6A3E8E] disabled:opacity-40 disabled:cursor-not-allowed text-[#FAFAF6] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
