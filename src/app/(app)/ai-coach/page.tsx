'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  mockPastAIInsights,
  mockAIChatMessages,
} from '@/lib/mock/dashboardData';
import {
  Bot,
  Send,
  Sparkles,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

export default function AICoachPage() {
  const [messages, setMessages] = useState(mockAIChatMessages);
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
      let botResponse = "I've logged that context into your health summary. Based on your current recovery score (78/100) and workout logs, make sure to drink an extra 500ml of water and keep your protein intake above 110g today.";
      let showDoctorHandoff = false;

      const lower = query.toLowerCase();
      if (lower.includes('pain') || lower.includes('back') || lower.includes('injury') || lower.includes('doctor') || lower.includes('physio')) {
        botResponse = "I noticed you mentioned pain / back tightness. While I can suggest light decompression stretches, I cannot provide a medical diagnosis. Based on your L4-L5 lumbar history, I strongly recommend scheduling a review with Dr. Anjali Mehta (Physiotherapist).";
        showDoctorHandoff = true;
      } else if (lower.includes('vitamin') || lower.includes('report') || lower.includes('blood')) {
        botResponse = "Your recent Thyrocare metabolic panel indicated a Vitamin D3 level of 28.4 ng/mL. Dr. Priya Sharma recommended 60k IU weekly with morning fats. Would you like me to pull up your full lab trends?";
      } else if (lower.includes('workout') || lower.includes('exercise')) {
        botResponse = "You have completed 4 out of 6 scheduled sessions this week (Total volume: 40.8 tons). You are well on track for your weekly strength progression goals!";
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
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto w-full h-[calc(100vh-140px)] min-h-[600px]">
      {/* Top Pinned Insights Carousel */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#A78BFA]" />
            <span className="section-title">PINNED AI COACH INSIGHTS & PROTOCOLS</span>
          </div>
          <span className="text-xs text-[#8B91B0]">Updated 30 mins ago</span>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x">
          {mockPastAIInsights.map(ins => (
            <div
              key={ins.id}
              className="p-3.5 rounded-xl bg-gradient-to-br from-[#13161F] to-[#1A102E] border border-[#A78BFA]/25 shrink-0 w-[280px] sm:w-[320px] snap-center flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[0.62rem] font-bold px-2 py-0.5 rounded uppercase"
                    style={{ backgroundColor: `${ins.badgeColor}20`, color: ins.badgeColor }}
                  >
                    {ins.category}
                  </span>
                  <span className="text-[0.65rem] text-[#8B91B0]">{ins.date}</span>
                </div>
                <p className="text-xs text-[#E8EAF6] m-0 leading-relaxed line-clamp-2">
                  {ins.text}
                </p>
              </div>

              <button
                onClick={() => handleSendMessage(`Tell me more about: ${ins.category}`)}
                className="text-[0.68rem] font-bold text-[#A78BFA] hover:underline mt-2.5 text-left flex items-center gap-1 cursor-pointer"
              >
                Discuss with Coach →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="fluetas-card flex-1 flex flex-col min-h-0 bg-[#0B0D14] border-[#1E2133] overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 sm:p-4 bg-[#13161F] border-b border-[#1E2133] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4C1D95] flex items-center justify-center text-lg shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              🤖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Outfit'] font-bold text-sm text-[#E8EAF6] m-0">
                  FLUETAS AI COACH
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              </div>
              <p className="text-[0.68rem] text-[#8B91B0] m-0">
                Connected to Vitals, Workouts, Nutrition & Clinical History
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[0.68rem] text-[#8B91B0] bg-[#0B0D14] px-2.5 py-1 rounded-lg border border-[#1E2133]">
            <ShieldAlert size={12} className="text-[#38BDF8]" />
            <span>Summarization & guidance only · Non-diagnostic</span>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 scroll-smooth">
          {messages.map((m: any) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${isBot ? 'self-start' : 'self-end flex-row-reverse'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-[#7C3AED] flex items-center justify-center text-xs shrink-0 mt-0.5">
                    🤖
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isBot
                        ? 'bg-[#13161F] text-[#E8EAF6] border border-[#1E2133] rounded-tl-sm'
                        : 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-medium rounded-tr-sm shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    }`}
                  >
                    <p className="m-0 whitespace-pre-wrap">{m.text}</p>

                    {/* AI -> Doctor Handoff CTA (§6 Requirement) */}
                    {m.showDoctorHandoff && (
                      <div className="mt-3 pt-2.5 border-t border-[#1E2133] bg-[#0B0D14]/80 p-2.5 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={16} className="text-[#10B981]" />
                          <div>
                            <p className="font-bold text-xs text-[#E8EAF6] m-0">Recommended Expert Consultation</p>
                            <p className="text-[0.65rem] text-[#8B91B0] m-0">Dr. Anjali Mehta · Physiotherapy</p>
                          </div>
                        </div>
                        <Link
                          href="/experts?spec=Physiotherapy"
                          className="btn-primary py-1 px-2.5 text-[0.7rem] no-underline shrink-0 flex items-center gap-1"
                        >
                          Book Expert <ArrowRight size={11} />
                        </Link>
                      </div>
                    )}
                  </div>

                  <span className="text-[0.62rem] text-[#8B91B0] px-1 self-end">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2 self-start items-center p-3 bg-[#13161F] border border-[#1E2133] rounded-xl text-xs text-[#8B91B0] animate-pulse">
              <span>🤖 Analyzing biometric telemetry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompt Chips */}
        <div className="px-4 py-2 bg-[#13161F]/50 border-t border-[#1E2133] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            'How to optimize recovery today?',
            'Explain my low Vitamin D3 result',
            'Recommend a physiotherapist for lumbar pain',
            'Suggest my post-workout meal',
          ].map(chip => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full text-[0.68rem] bg-[#0B0D14] text-[#8B91B0] hover:text-[#E8EAF6] hover:border-[#10B981] border border-[#1E2133] shrink-0 transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-[#13161F] border-t border-[#1E2133] flex items-center gap-2 shrink-0"
        >
          <input
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask AI Coach anything about your health, training, nutrition or tests..."
            className="flex-1 bg-[#0B0D14] border border-[#1E2133] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#E8EAF6] outline-none focus:border-[#7C3AED]"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_12px_rgba(124,58,237,0.3)] shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
