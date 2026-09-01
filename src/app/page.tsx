"use client";
import React, { useEffect, useState } from "react";

/* ─────────────────────────────────────────
   COUNTDOWN
───────────────────────────────────────── */
const LAUNCH = new Date("2026-09-04T00:00:00Z").getTime();
function getDiff() {
  const ms = Math.max(0, LAUNCH - Date.now());
  return {
    days:    Math.floor(ms / 86400000),
    hours:   Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}
function CountdownRow() {
  const [t, setT] = useState(getDiff);
  const [live, setLive] = useState(false);
  useEffect(() => {
    setLive(true);
    const id = setInterval(() => setT(getDiff()), 1000);
    return () => clearInterval(id);
  }, []);
  const units = [
    { v: t.days, l: "Days" }, { v: t.hours, l: "Hrs" },
    { v: t.minutes, l: "Min" }, { v: t.seconds, l: "Sec" },
  ];
  return (
    <div className="flex gap-3">
      {units.map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center rounded-lg border border-rule bg-surface px-4 py-3 min-w-[64px] sm:min-w-[80px]">
          <span className="tabular text-[2.5rem] font-medium leading-none text-ink" suppressHydrationWarning>
            {live ? String(v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-2 eyebrow">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   WAITLIST FORM
───────────────────────────────────────── */
function WaitlistForm({ id = "wl-email" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done) return (
    <p className="text-[17px] text-ink" role="status">
      You&apos;re on the list — we&apos;ll email <span className="font-semibold">{email}</span> before the doors open on 4 September.
    </p>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="h-[60px] flex-1 rounded-sm border border-rule bg-surface px-5 py-4 text-[16px] text-ink placeholder:text-ink-soft focus:border-leaf focus:outline-none transition-colors"
      />
      <button type="submit" className="rounded-sm bg-leaf px-8 h-[60px] text-[15px] font-semibold text-[#FAFAF6] transition-colors hover:bg-leaf-hi">
        Notify me
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   RING (SVG progress)
───────────────────────────────────────── */
function Ring({ pct, color, size = 96, label }: { pct: number; color: string; size?: number; label: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rule)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="font-display text-[20px] font-semibold text-ink leading-none">{pct}%</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO MOCKUP
───────────────────────────────────────── */
function HeroMockup() {
  const bars = [
    { d: "M", h: 55 }, { d: "T", h: 78 }, { d: "W", h: 90 }, { d: "T", h: 62 },
    { d: "F", h: 40 }, { d: "S", h: 83 }, { d: "S", h: 70 },
  ];
  return (
    <div className="rounded-[24px] border border-rule bg-surface shadow-[0_24px_80px_rgba(18,22,15,0.12)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-rule px-6 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/assets/image.png" alt="" aria-hidden width={24} height={24} />
          <span className="brand text-[15px]">FLUETAS</span>
        </div>
        <div className="text-right">
          <p className="text-[14px] text-ink-soft">Good evening, Anya</p>
          <p className="text-[13px] font-semibold text-leaf">Day 14 of cycle</p>
        </div>
      </div>
      <div className="p-7 space-y-7">
        <div>
          <p className="eyebrow mb-5">Your wellness today</p>
          <div className="flex justify-between px-2">
            <Ring pct={82} color="var(--leaf)"   label="Training" size={72} />
            <Ring pct={76} color="var(--ember)"  label="Recovery" size={72} />
            <Ring pct={68} color="var(--tide)"   label="Hydration" size={72} />
            <Ring pct={91} color="var(--violet)" label="Sleep"     size={72} />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-4">Weekly activity</p>
          <div className="flex items-end gap-2 h-[80px]">
            {bars.map(({ d, h }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="w-full rounded-md" style={{ height: `${h}%`, background: i === 2 ? "var(--leaf)" : "var(--rule)", minHeight: 4 }} />
                <span className="text-[12px] font-medium text-ink-soft">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-leaf/20 bg-leaf/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-leaf-hi" />
            <span className="eyebrow !text-leaf">AI insight</span>
          </div>
          <p className="text-[15px] text-ink leading-relaxed">
            Your training load increased 14% this week. Consider prioritizing recovery and hydration before your next session.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   GIANT HEALTH RECORD
───────────────────────────────────────── */
function GiantHealthRecord() {
  return (
    <div className="rounded-[32px] border border-rule bg-surface shadow-[0_32px_120px_rgba(18,22,15,0.08)] overflow-hidden w-full max-w-[900px] mx-auto">
      <div className="flex items-center justify-between border-b border-rule px-10 py-8 bg-surface-2">
        <div>
          <h3 className="brand text-[24px] text-ink mb-1">ANYA&apos;S FLUETAS PROFILE</h3>
          <p className="text-[15px] text-ink-soft">Active since August 2026</p>
        </div>
        <div className="flex items-center gap-4 bg-surface rounded-2xl border border-rule px-6 py-4 shadow-sm">
          <span className="text-[14px] font-semibold text-ink-soft uppercase tracking-wider">Wellness Score</span>
          <span className="tabular text-[3rem] font-bold text-leaf leading-none">84</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] divide-y md:divide-y-0 md:divide-x divide-rule">
        {/* Left Col: Bars */}
        <div className="p-10 space-y-8">
          {[
            { label: "TRAINING", pct: 82, color: "var(--leaf)" },
            { label: "RECOVERY", pct: 76, color: "var(--ember)" },
            { label: "SLEEP", pct: 81, color: "var(--tide)" },
            { label: "NUTRITION", pct: 64, color: "var(--violet)" },
          ].map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between items-end mb-3">
                <span className="text-[14px] font-bold text-ink tracking-widest">{bar.label}</span>
                <span className="tabular text-[20px] font-bold text-ink leading-none">{bar.pct}%</span>
              </div>
              <div className="h-4 w-full rounded-full bg-surface-2 overflow-hidden border border-rule">
                <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
        {/* Right Col: Recent */}
        <div className="p-10 bg-surface-2">
          <p className="eyebrow mb-6">Recent Ecosystem Events</p>
          <div className="space-y-5">
            {[
              { icon: "🏋️", text: "Legs + Core workout", time: "Today", color: "text-leaf" },
              { icon: "♀", text: "Cycle log updated", time: "Today", color: "text-rose" },
              { icon: "🤖", text: "AI conversation", time: "Yesterday", color: "text-violet" },
              { icon: "👨‍⚕️", text: "Expert consultation", time: "Aug 28", color: "text-ember" },
            ].map((ev, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface border border-rule text-[18px]">
                  {ev.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-ink">{ev.text}</p>
                  <p className="text-[13px] text-ink-soft">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   TRAIN WORKOUT UI
───────────────────────────────────────── */
function WorkoutUI() {
  return (
    <div className="rounded-[24px] border border-rule bg-surface shadow-md overflow-hidden flex flex-col md:flex-row max-w-[1000px] mx-auto">
      <div className="flex-1 p-8 md:p-12">
        <h3 className="section-heading text-[2rem] text-ink mb-1 uppercase tracking-tight">CHEST + BICEPS</h3>
        <p className="text-[16px] text-ink-soft mb-8 border-b border-rule pb-6">Today&apos;s workout</p>
        
        <div className="space-y-4 mb-10">
          {[
            { n: "01", name: "Barbell Bench Press", sets: "4 × 8–10" },
            { n: "02", name: "Incline Dumbbell Press", sets: "3 × 10–12" },
            { n: "03", name: "Cable Fly", sets: "3 × 12" },
            { n: "04", name: "Dumbbell Curl", sets: "3 × 10–12" },
          ].map((ex) => (
            <div key={ex.n} className="flex items-center gap-5">
              <span className="step-num !text-[1.5rem] !text-leaf opacity-60 w-8">{ex.n}</span>
              <div className="flex-1">
                <p className="text-[17px] font-medium text-ink">{ex.name}</p>
                <p className="text-[14px] text-ink-soft mt-0.5">{ex.sets}</p>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full rounded-sm bg-leaf py-5 text-[15px] font-bold text-[#FAFAF6] uppercase tracking-widest hover:bg-leaf-hi transition-colors">
          Start Workout
        </button>
      </div>
      
      {/* Media Placeholder */}
      <div className="flex-1 bg-surface-2 min-h-[400px] border-l border-rule relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative text-center">
          <div className="h-20 w-20 rounded-full bg-leaf/10 border-2 border-leaf/20 flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="var(--leaf)"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-ink-soft uppercase tracking-widest">Exercise Media</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CYCLE VISUALIZATION
───────────────────────────────────────── */
function CycleVisualization() {
  return (
    <div className="w-full max-w-[1000px] mx-auto bg-surface rounded-[24px] border border-rule p-8 md:p-12 shadow-sm">
      <h3 className="section-heading text-[2rem] text-ink text-center mb-16 uppercase tracking-tight">Your Cycle</h3>
      
      {/* Timeline */}
      <div className="relative mb-16 px-4 md:px-12">
        <div className="absolute top-1/2 left-4 md:left-12 right-4 md:right-12 h-0.5 bg-rule -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-4 md:left-12 h-0.5 bg-rose -translate-y-1/2 transition-all duration-1000" style={{ width: "45%" }}></div>
        
        <div className="relative flex justify-between items-center">
          {[1, 7, 14, 21, 28].map((day) => {
            const isToday = day === 14;
            const isPast = day <= 14;
            return (
              <div key={day} className="flex flex-col items-center gap-4">
                <div className={`w-5 h-5 rounded-full border-[3px] bg-surface z-10 transition-colors ${
                  isToday ? 'border-rose scale-150' : isPast ? 'border-rose' : 'border-rule'
                }`}>
                  {isToday && <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-rose rounded-full"></div>}
                </div>
                <span className={`tabular text-[16px] font-semibold ${isToday ? 'text-rose text-[18px]' : 'text-ink-soft'}`}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
        
        <div className="absolute -top-10 left-[48%] -translate-x-1/2 text-[14px] font-bold text-rose uppercase tracking-widest">
          Day 14
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "ENERGY", val: 82, trend: "High" },
          { label: "MOOD", val: "Good", trend: "Stable" },
          { label: "SYMPTOMS", val: "Low", trend: "Clear" },
          { label: "SLEEP", val: "7h", trend: "Optimal" },
        ].map((m) => (
          <div key={m.label} className="border border-rule rounded-xl bg-surface-2 p-6 text-center flex flex-col items-center justify-center">
            <span className="eyebrow mb-3">{m.label}</span>
            <span className="font-display text-[2rem] font-semibold text-ink leading-none mb-2">{m.val}</span>
            <span className="text-[13px] text-rose font-medium bg-rose/10 px-3 py-1 rounded-full">{m.trend}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   GIANT AI CHAT
───────────────────────────────────────── */
function GiantAIChat() {
  const [activeChat, setActiveChat] = useState(0);

  const chats = [
    {
      prompt: "I've been sleeping poorly but training more. Should I push through my leg session today?",
      replies: [
        "Your recent activity suggests that recovery may need more attention. Over the last 3 days, your sleep has dropped by 18% while your training strain increased by 22%.",
        "I recommend skipping the heavy leg session and substituting it with active recovery or mobility work today."
      ],
      disclaimer: "Not a medical diagnosis — consult a professional for health concerns."
    },
    {
      prompt: "What should I train today?",
      replies: [
        "Based on your 82% training readiness and the fact you hit Chest + Biceps yesterday, today is optimal for a Back + Shoulders session.",
        "Your hydration is a bit low (68%), so make sure to drink water before you start."
      ],
      disclaimer: "These recommendations are based on your tracked recovery metrics."
    },
    {
      prompt: "How can I improve recovery?",
      replies: [
        "Your sleep score is excellent (91%), but your physical recovery is lagging (76%).",
        "I suggest adding a 15-minute mobility routine post-workout and ensuring you get at least 30g of protein within an hour of finishing your session."
      ],
      disclaimer: "Personalized nutrition advice should be verified with your registered dietitian."
    }
  ];

  const current = chats[activeChat];

  return (
    <div className="w-full max-w-[1200px] mx-auto rounded-[32px] border border-[#2a3028] bg-[#0d1210] overflow-hidden shadow-2xl flex flex-col h-[700px]">
      <div className="flex items-center gap-4 border-b border-[#2a3028] px-8 py-6 bg-[#161d19]">
        <img src="/assets/image.png" alt="" aria-hidden width={40} height={40} />
        <div>
          <p className="brand text-[18px] text-[#FAFAF6]">FLUETAS AI</p>
          <p className="text-[13px] text-[#8e998a]">FLUETAS-approved knowledge</p>
        </div>
      </div>
      
      <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-10">
        <div className="flex flex-col items-end gap-2">
          <span className="eyebrow !text-[#8e998a]">You</span>
          <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-[#1e2621] px-6 py-5">
            <p className="text-[18px] text-[#FAFAF6] leading-relaxed">
              {current.prompt}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <span className="eyebrow !text-leaf-hi">FLUETAS AI</span>
          <div className="max-w-[70%] rounded-2xl rounded-tl-sm border border-[#2a3028] bg-[#0d1210] px-6 py-5">
            {current.replies.map((reply, i) => (
              <p key={i} className={`text-[18px] text-[#d3dbcf] leading-relaxed ${i !== current.replies.length - 1 ? 'mb-4' : ''}`}>
                {reply}
              </p>
            ))}
            <p className="mt-4 text-[13px] text-[#8e998a] italic border-t border-[#2a3028] pt-4">{current.disclaimer}</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 border-t border-[#2a3028] bg-[#0d1210] flex flex-col gap-4">
        {/* Floating prompts embedded cleanly */}
        <div className="flex flex-wrap gap-3 hidden md:flex">
          {chats.map((c, i) => i !== activeChat && (
            <button key={i} onClick={() => setActiveChat(i)} className="rounded-full border border-[#2a3028] bg-[#161d19] px-4 py-2 text-[13px] text-[#8e998a] hover:text-[#FAFAF6] hover:bg-[#1e2621] cursor-pointer transition-colors">
              &ldquo;{c.prompt}&rdquo;
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 rounded-xl border border-[#3f4a3c] bg-[#161d19] px-6 py-5">
          <span className="flex-1 text-[17px] text-[#8e998a]">Ask anything...</span>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf">
            <svg width="18" height="18" viewBox="0 0 12 12" fill="none" stroke="#FAFAF6" strokeWidth="2" strokeLinecap="round"><path d="M1 6h10M7 2l4 4-4 4"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-ink font-sans">

      {/* ══════════════════════════════════
          NAV
      ══════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-rule">
        <div className="wrap flex h-[80px] items-center justify-between gap-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <img src="/assets/image.png" alt="FLUETAS" width={40} height={40} />
            <span className="brand text-[20px]">FLUETAS</span>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-[14px] font-medium text-ink-soft">
            <a href="#train"     className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Train</a>
            <a href="#her"       className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Her</a>
            <a href="#ai"        className="hover:text-ink transition-colors uppercase tracking-[0.05em]">AI</a>
            <a href="#experts"   className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Experts</a>
            <a href="#nutrition" className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Nutrition</a>
          </nav>

          <a href="#closing" className="shrink-0 rounded-sm bg-ink px-6 py-3 text-[14px] font-semibold text-surface transition-colors hover:-translate-y-px uppercase tracking-[0.04em]">
            Join FLUETAS
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════
          01 — HERO (Scaled Up)
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-rule min-h-[calc(100vh-80px)] flex items-center">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-0 h-[800px] w-[800px]"
          style={{ background: "radial-gradient(circle, rgba(46,125,50,0.1) 0%, transparent 70%)" }} />
        
        <div className="wrap py-12 lg:py-16 w-full">
          <div className="grid grid-cols-1 gap-12 lg:gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-leaf-hi" style={{ boxShadow: "0 0 0 4px rgba(76,168,79,0.2)" }} />
                <span className="eyebrow !text-leaf !text-[11px] tracking-[0.1em]">FLUETAS PLATFORM · LIVE 4 SEPTEMBER 2026</span>
              </div>

              {/* Massive Hero Headline - Adjusted to fit screen */}
              <h1 className="headline text-[clamp(3rem,5vw,5.5rem)] text-ink mb-6 leading-[0.95]">
                YOUR BODY.<br />
                YOUR DATA.<br />
                <span className="text-leaf">YOUR FORMULA.</span>
              </h1>

              <p className="mb-10 max-w-[500px] text-[18px] leading-[1.6] text-ink-soft">
                One platform for training, women&apos;s wellness, AI guidance, expert consultations and personalized nutrition.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#closing" className="rounded-sm bg-ink px-8 py-4 text-[14px] font-bold text-surface uppercase tracking-[0.05em] hover:-translate-y-px transition-transform">
                  Join FLUETAS
                </a>
                <a href="#platform" className="rounded-sm border-2 border-rule px-8 py-4 text-[14px] font-bold text-ink hover:border-ink-soft transition-colors uppercase tracking-[0.05em]">
                  Explore Platform
                </a>
              </div>
            </div>

            <div id="platform" className="w-full max-w-[480px] mx-auto lg:mx-0 lg:ml-auto">
              <HeroMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          02 — FRAGMENTATION (Giant Floating Cards)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2 overflow-hidden">
        <div className="wrap relative">
          <div className="text-center mb-24 max-w-[800px] mx-auto">
            <h2 className="section-heading text-[clamp(2.5rem,5vw,4.5rem)] text-ink mb-6">
              Your health shouldn&apos;t live in five different places.
            </h2>
            <p className="text-[20px] text-ink-soft">Most people already track their body — across half a dozen apps that never talk to each other.</p>
          </div>

          {/* Floating Cards Graphic */}
          <div className="relative h-[600px] max-w-[1000px] mx-auto flex items-center justify-center">
            
            {/* The Center */}
            <div className="absolute z-20 flex flex-col items-center justify-center w-64 h-64 rounded-full bg-ink text-[#FAFAF6] shadow-2xl">
              <span className="brand text-[24px] mb-2">ONE RECORD</span>
              <span className="text-[14px] text-[#8e998a]">FLUETAS</span>
            </div>

            {/* Orbiting Cards */}
            <div className="absolute top-0 left-[10%] w-[240px] rounded-2xl border border-rule bg-surface p-6 shadow-lg -rotate-6">
              <p className="eyebrow mb-4 flex items-center gap-2"><span className="text-[16px]">🏋️</span> TRAINING</p>
              <p className="text-[24px] font-bold text-ink leading-none mb-1">4 workouts</p>
              <p className="text-[14px] text-ink-soft">This week</p>
            </div>

            <div className="absolute top-[10%] right-[5%] w-[240px] rounded-2xl border border-rule bg-surface p-6 shadow-lg rotate-3">
              <p className="eyebrow mb-4 flex items-center gap-2"><span className="text-[16px]">😴</span> SLEEP</p>
              <p className="text-[24px] font-bold text-ink leading-none mb-1">7h 42m</p>
              <p className="text-[14px] text-ink-soft">Last night</p>
            </div>

            <div className="absolute bottom-[20%] left-[5%] w-[240px] rounded-2xl border border-rule bg-surface p-6 shadow-lg rotate-12">
              <p className="eyebrow mb-4 flex items-center gap-2"><span className="text-[16px]">🥗</span> NUTRITION</p>
              <p className="text-[24px] font-bold text-ink leading-none mb-1">2,140 kcal</p>
              <p className="text-[14px] text-ink-soft">Today&apos;s intake</p>
            </div>

            <div className="absolute bottom-[10%] right-[15%] w-[240px] rounded-2xl border border-rule bg-surface p-6 shadow-lg -rotate-6">
              <p className="eyebrow mb-4 flex items-center gap-2"><span className="text-[16px]">♀</span> CYCLE</p>
              <p className="text-[24px] font-bold text-ink leading-none mb-1">Day 18</p>
              <p className="text-[14px] text-ink-soft">Luteal phase</p>
            </div>

            <div className="absolute top-[40%] right-[30%] -translate-x-[200px] w-[240px] rounded-2xl border border-rule bg-surface p-6 shadow-lg rotate-2 z-10">
              <p className="eyebrow mb-4 flex items-center gap-2"><span className="text-[16px]">👨‍⚕️</span> EXPERT</p>
              <p className="text-[24px] font-bold text-ink leading-none mb-1">Consultation</p>
              <p className="text-[14px] text-ink-soft">Notes saved</p>
            </div>

            {/* Connecting visual lines (implied via styling, simplified for layout) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" aria-hidden>
               <circle cx="50%" cy="50%" r="200" fill="none" stroke="var(--ink)" strokeWidth="2" strokeDasharray="10 10"/>
               <circle cx="50%" cy="50%" r="350" fill="none" stroke="var(--ink)" strokeWidth="1" strokeDasharray="5 15"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 1
      ══════════════════════════════════ */}
      <section className="bg-ink py-40 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,7vw,7rem)] text-[#FAFAF6]">
            ONE BODY.<br/>
            MANY SIGNALS.<br/>
            <span className="text-leaf-hi">ONE RECORD.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          03 — TRAIN (Big UI)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule" id="train">
        <div className="wrap">
          <div className="text-center mb-20 max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">FLUETAS Train</p>
            <h2 className="section-heading text-[clamp(3rem,5vw,4.5rem)] text-ink mb-6">
              Train with purpose.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              Structured workouts designed around progression, consistency and better training decisions.
            </p>
          </div>
          <WorkoutUI />
        </div>
      </section>

      {/* ══════════════════════════════════
          04 — HER (Cycle Visual)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="her">
        <div className="wrap">
          <div className="text-center mb-20 max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-rose">FLUETAS Her</p>
            <h2 className="section-heading text-[clamp(3rem,5vw,4.5rem)] text-ink mb-6">
              Understand your cycle.<br />Understand yourself.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              Your cycle shapes your energy, your mood and your training. Her tracks it all and connects it to the rest of your FLUETAS profile.
            </p>
          </div>
          <CycleVisualization />
        </div>
      </section>

      {/* ══════════════════════════════════
          05 — AI (Full Width)
      ══════════════════════════════════ */}
      <section className="bg-[#0d1210] py-32 border-b border-[#2a3028]" id="ai">
        <div className="wrap">
          <div className="text-center mb-20 max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-violet">FLUETAS AI</p>
            <h2 className="section-heading text-[clamp(3rem,5vw,5rem)] text-[#FAFAF6] mb-6">
              ASK FLUETAS AI ANYTHING.
            </h2>
            <p className="text-[20px] text-[#8e998a] leading-relaxed">
              An AI assistant powered by FLUETAS-approved knowledge — not a generic chatbot.
            </p>
          </div>
          <GiantAIChat />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 2
      ══════════════════════════════════ */}
      <section className="bg-ink py-40 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,6vw,6rem)] text-[#FAFAF6]">
            AI WHEN YOU NEED ANSWERS.<br/>
            <span className="text-ember">EXPERTS WHEN YOU NEED PEOPLE.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          06 — EXPERTS (Real People)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="experts">
        <div className="wrap">
          <div className="text-center mb-20 max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-ember">FLUETAS Experts</p>
            <h2 className="section-heading text-[clamp(3rem,5vw,4.5rem)] text-ink mb-6">
              Human expertise when you need it.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              Book consultations directly through FLUETAS. Your profile is already in their hands before you speak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { role: "Physiotherapist", name: "Dr. Sarah Jenkins", exp: "8 yrs", img: "SJ", color: "var(--ember)" },
              { role: "Gynecologist",    name: "Dr. Elena Rostova", exp: "12 yrs", img: "ER", color: "var(--rose)" },
              { role: "Nutritionist",    name: "Marcus Thorne",     exp: "6 yrs", img: "MT", color: "var(--leaf)" },
              { role: "Trainer",         name: "David Chen",        exp: "10 yrs", img: "DC", color: "var(--tide)" },
            ].map(({ role, name, exp, img, color }) => (
              <div key={role} className="rounded-[24px] border border-rule bg-surface overflow-hidden shadow-md flex flex-col">
                <div className="h-[240px] bg-surface-2 flex items-center justify-center border-b border-rule relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-rule/50 to-transparent"></div>
                  <span className="font-display text-[4rem] text-ink-soft opacity-20">{img}</span>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="section-heading text-[24px] text-ink leading-tight">{name}</h3>
                    <p className="text-[15px] font-semibold" style={{ color }}>{role}</p>
                  </div>
                  <div className="flex items-center gap-4 mb-8 text-[14px] text-ink-soft">
                    <span className="flex items-center gap-1 font-semibold text-ink"><span className="text-[#f59e0b]">★</span> 4.9</span>
                    <span>•</span>
                    <span>{exp} experience</span>
                  </div>
                  <button className="mt-auto w-full py-4 rounded-lg border-2 border-rule text-[14px] font-bold text-ink hover:border-ink transition-colors uppercase tracking-widest">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Scrolling Remarks */}
          <div className="mt-24 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
            <div className="flex w-max animate-marquee items-center gap-8">
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {[
                    { text: "FLUETAS gives me the context I've always been missing before a consultation.", author: "Dr. Sarah Jenkins", role: "Physiotherapist" },
                    { text: "Finally, a platform that understands that cycle data and training aren't separate.", author: "Dr. Elena Rostova", role: "Gynecologist" },
                    { text: "I can adjust a client's macros based on their actual recovery data, not guesswork.", author: "Marcus Thorne", role: "Sports Nutritionist" },
                    { text: "The first tool that brings sleep, strain, and my programming into one view.", author: "David Chen", role: "Performance Coach" },
                    { text: "I don't have to explain my whole history every time I speak to a new specialist.", author: "Anya K.", role: "FLUETAS Athlete" },
                  ].map((r, j) => (
                    <div key={`${i}-${j}`} className="flex w-[460px] shrink-0 flex-col rounded-[20px] border border-rule bg-surface p-8 shadow-sm">
                      <p className="mb-6 text-[18px] italic text-ink leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                      <div className="mt-auto flex items-center gap-4 border-t border-rule pt-6">
                        <div className="h-12 w-12 rounded-full bg-surface-2 shrink-0 flex items-center justify-center text-[14px] font-bold text-ink-soft border border-rule">{r.author.charAt(0)}</div>
                        <div>
                          <p className="text-[15px] font-bold text-ink mb-1">{r.author}</p>
                          <p className="eyebrow !text-[11px]">{r.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════
          07 — HEALTH RECORD (BIGGEST VISUAL)
      ══════════════════════════════════ */}
      <section className="py-40 border-b border-rule bg-surface relative overflow-hidden" id="journey">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-[1200px] h-[1200px] rounded-full border border-ink"></div>
          <div className="absolute w-[800px] h-[800px] rounded-full border border-ink"></div>
        </div>
        
        <div className="wrap relative z-10">
          <div className="text-center mb-24 max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">The Centerpiece</p>
            <h2 className="section-heading text-[clamp(3.5rem,6vw,5.5rem)] text-ink mb-6">
              Your record builds itself.
            </h2>
            <p className="text-[22px] text-ink-soft leading-relaxed">
              Every training session, every conversation, every consultation feeds into the most complete picture of your body you&apos;ve ever had.
            </p>
          </div>

          <div className="relative">
            <GiantHealthRecord />
            
            {/* Visual pointers feeding in */}
            <div className="hidden xl:block absolute top-[20%] -left-32 text-right">
              <span className="brand text-[20px] text-ink mb-2 block">TRAIN & HER</span>
              <div className="h-px w-24 bg-ink ml-auto"></div>
            </div>
            <div className="hidden xl:block absolute bottom-[30%] -left-32 text-right">
              <span className="brand text-[20px] text-ink mb-2 block">AI INSIGHTS</span>
              <div className="h-px w-24 bg-ink ml-auto"></div>
            </div>
            <div className="hidden xl:block absolute top-[30%] -right-32 text-left">
              <span className="brand text-[20px] text-ink mb-2 block">EXPERTS</span>
              <div className="h-px w-24 bg-ink mr-auto"></div>
            </div>
            <div className="hidden xl:block absolute bottom-[20%] -right-32 text-left">
              <span className="brand text-[20px] text-ink mb-2 block">NUTRITION</span>
              <div className="h-px w-24 bg-ink mr-auto"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          08 — NUTRITION (Product Renders)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="nutrition">
        <div className="wrap">
          <div className="text-center mb-24 max-w-[800px] mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="eyebrow !text-leaf">FLUETAS Nutrition</span>
              <span className="rounded-full border border-rule bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.05em] text-ink-soft">Coming soon</span>
            </div>
            <h2 className="section-heading text-[clamp(3rem,5vw,4.5rem)] text-ink mb-6">
              Nutrition connected to your journey.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              What you track digitally becomes what you consume physically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-[1100px] mx-auto">
            {[
              { title: "Athlete+", color: "var(--ember)", desc: "Beetroot · Electrolytes · B12" },
              { title: "Gut+",     color: "var(--leaf)", desc: "Bael · Amla · Kokum · Ginger" },
              { title: "Recover+", color: "var(--tide)", desc: "Coconut water · Amla · Lemon" },
            ].map(({ title, color, desc }) => (
              <div key={title} className="flex flex-col items-center">
                {/* Product Render Placeholder */}
                <div className="w-full h-[450px] rounded-[32px] bg-surface border border-rule shadow-xl relative flex flex-col items-center justify-center overflow-hidden mb-8 group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-transparent" style={{ '--tw-gradient-to': color } as React.CSSProperties}></div>
                  <div className="h-[280px] w-[140px] rounded-full border-[8px] border-surface-2 shadow-inner bg-surface relative flex items-center justify-center overflow-hidden">
                     <div className="absolute bottom-0 w-full h-[40%]" style={{ background: color, opacity: 0.8 }}></div>
                     <span className="brand text-[20px] text-ink relative z-10 -rotate-90 origin-center tracking-widest">{title}</span>
                  </div>
                </div>
                <h3 className="section-heading text-[28px] text-ink mb-2">{title}</h3>
                <p className="text-[15px] text-ink-soft uppercase tracking-widest text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 3
      ══════════════════════════════════ */}
      <section className="bg-ink py-40 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,7vw,7rem)] text-[#FAFAF6]">
            YOUR DATA<br/>
            <span className="text-tide">DOESN&apos;T RESET.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          09 — PRIVACY
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule">
        <div className="wrap">
          <div className="mb-20 text-center max-w-[800px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">Built around trust</p>
            <h2 className="section-heading text-[clamp(2.5rem,4vw,3.5rem)] text-ink mb-6">
              Your data. Your control.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              Your profile is yours, not ours. You control what is stored, what experts can see, and how your information is shared.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { title: "Privacy", body: "Sensitive data — including cycle and consultation history — is never used without your knowledge." },
              { title: "Consent", body: "You choose what is stored, what experts can see, and how your information is shared." },
              { title: "Control", body: "Download, update or delete your data at any time. The keys stay with you." },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-[24px] border border-rule bg-surface-2 p-10 text-center">
                <h3 className="section-heading text-[24px] text-ink mb-4">{title}</h3>
                <p className="text-[17px] text-ink-soft leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          10 — FINAL CTA
      ══════════════════════════════════ */}
      <section className="py-40 text-center relative overflow-hidden" id="closing">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 1000px 600px at 50% 0%, rgba(46,125,50,0.06), transparent 70%)" }} />
        <div className="wrap relative z-10">
          <p className="eyebrow mb-8 !text-leaf !text-[12px]">The platform launches 4 September 2026</p>
          <h2 className="headline text-[clamp(3rem,6vw,6rem)] text-ink mb-8">
            Be part of the<br /><span className="text-leaf">FLUETAS</span> journey.
          </h2>
          <p className="font-display font-semibold text-ink-soft text-[20px] tracking-tight mb-16">
            Your Body. Your Data. Your Formula.
          </p>
          <div className="mb-16 flex justify-center">
            <CountdownRow />
          </div>
          <div className="mx-auto max-w-[600px] text-left mb-6">
            <WaitlistForm />
          </div>
          <p className="text-[15px] text-ink-soft">No spam. We&apos;ll only email you when it matters.</p>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="border-t border-rule py-20 bg-surface-2">
        <div className="wrap">
          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
            <div>
              <a href="/" className="flex items-center gap-3 mb-5">
                <img src="/assets/image.png" alt="FLUETAS" width={48} height={48} />
                <span className="brand text-[24px]">FLUETAS</span>
              </a>
              <p className="text-[16px] text-ink-soft max-w-[280px] leading-relaxed">
                One platform for training, wellness, AI guidance and expert consultations.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-16 gap-y-10">
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[12px]">Platform</p>
                {["Train", "Her", "AI Coach", "Experts", "Nutrition"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[16px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[12px]">Company</p>
                {["How it works", "Privacy", "Launch"].map((l) => (
                  <a key={l} href="#" className="text-[16px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[12px]">Social</p>
                {["Instagram", "Facebook"].map((l) => (
                  <a key={l} href="#" className="text-[16px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-20 flex flex-col gap-4 border-t border-rule pt-10 sm:flex-row sm:justify-between">
            <p className="text-[14px] text-ink-soft">Fitness · Wellness · Nutrition · Experts · Technology</p>
            <p className="text-[14px] text-ink-soft"><span className="brand text-[14px]">FLUETAS</span>.IN · Launching 4 September 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
