"use client";
import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const NutritionProduct3D = dynamic(() => import("../components/NutritionProduct3D"), { ssr: false });

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
function Ring({ pct, color, size = 96, label, value }: { pct: number; color: string; size?: number; label: string; value?: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 absolute inset-0">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rule)" strokeWidth="6" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-[13px] font-bold text-ink leading-none">{value ?? `${pct}%`}</span>
        </div>
      </div>
      <span className="eyebrow !text-[9px]">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   01 — HERO PRODUCT CARD (Today's Summary)
───────────────────────────────────────── */
function HeroAppCard() {
  const [time, setTime] = useState("8:41 AM");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full max-w-[380px] mx-auto lg:mx-0 lg:ml-auto select-none">
      {/* Phone frame */}
      <div className="rounded-[36px] border-[3px] border-[#1a1f18] bg-[#12160F] shadow-[0_40px_120px_rgba(18,22,15,0.35)] overflow-hidden">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-[#0d1210]">
          <span className="text-[12px] font-semibold text-[#FAFAF6]" suppressHydrationWarning>{time}</span>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><rect x="0" y="3" width="2" height="7" rx="1" fill="#FAFAF6" opacity="0.4"/><rect x="3" y="2" width="2" height="8" rx="1" fill="#FAFAF6" opacity="0.6"/><rect x="6" y="1" width="2" height="9" rx="1" fill="#FAFAF6" opacity="0.8"/><rect x="9" y="0" width="2" height="10" rx="1" fill="#FAFAF6"/><rect x="11.5" y="2" width="2.5" height="6" rx="1" fill="#FAFAF6" stroke="#FAFAF6" strokeWidth="0.5"/></svg>
          </div>
        </div>

        {/* App header */}
        <div className="px-6 pt-2 pb-4 bg-[#0d1210]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#8e998a]">Good morning,</p>
              <p className="brand text-[17px] text-[#FAFAF6]">ANYA</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-leaf-hi" style={{ boxShadow: "0 0 0 4px rgba(76,168,79,0.2)" }} />
              <span className="text-[11px] text-leaf-hi font-semibold">Day 14</span>
            </div>
          </div>
        </div>

        {/* Today card */}
        <div className="px-5 pb-5 bg-[#0d1210] space-y-4">
          {/* Wellness rings */}
          <div className="rounded-2xl bg-[#161d19] border border-[#2a3028] p-5">
            <p className="eyebrow !text-[#8e998a] mb-4">Today&apos;s wellness</p>
            <div className="flex justify-between items-center">
              <Ring pct={82} color="var(--leaf)"   label="Training" size={68} />
              <Ring pct={76} color="var(--ember)"  label="Recovery" size={68} />
              <Ring pct={91} color="var(--tide)"   label="Sleep" size={68} value="7h42" />
              <Ring pct={68} color="var(--violet)" label="Hydration" size={68} />
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#161d19] border border-[#2a3028] p-4">
              <p className="text-[11px] text-[#8e998a] font-semibold uppercase tracking-wide mb-1">Cycle</p>
              <p className="text-[22px] font-bold text-[#FAFAF6] leading-none">Day 14</p>
              <p className="text-[11px] text-rose font-medium mt-1">Ovulatory ↑ Energy</p>
            </div>
            <div className="rounded-xl bg-[#161d19] border border-[#2a3028] p-4">
              <p className="text-[11px] text-[#8e998a] font-semibold uppercase tracking-wide mb-1">Calories</p>
              <p className="text-[22px] font-bold text-[#FAFAF6] leading-none">1,840</p>
              <p className="text-[11px] text-leaf font-medium mt-1">of 2,100 goal</p>
            </div>
          </div>

          {/* AI nudge */}
          <div className="rounded-xl bg-[#1a2b1c] border border-leaf/20 p-4 flex gap-3">
            <div className="h-8 w-8 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[14px]">🤖</span>
            </div>
            <p className="text-[13px] text-[#d3dbcf] leading-snug">
              Your peak training window is now. Recovery at 76% — push hard, then rest well tonight.
            </p>
          </div>

          {/* CTA */}
          <button className="w-full rounded-xl bg-leaf py-4 text-[14px] font-bold text-[#FAFAF6] tracking-wide uppercase">
            Start Chest + Biceps
          </button>
        </div>
      </div>

      {/* Decorative ambient glow */}
      <div aria-hidden className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(ellipse, rgba(46,125,50,0.5), transparent 70%)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   02 — ONE RECORD CONVERGING CARDS
───────────────────────────────────────── */
function OneRecordSection() {
  const cards = [
    { icon: "🏋️", label: "TRAINING", val: "4 workouts", sub: "This week",  x: "-38%", y: "-38%", rot: "-8deg",  delay: "0s" },
    { icon: "😴", label: "SLEEP",    val: "7h 42m",     sub: "Last night", x: "32%",  y: "-35%", rot: "5deg",   delay: "0.1s" },
    { icon: "♀", label: "CYCLE",    val: "Day 14",     sub: "Ovulatory",  x: "-40%", y: "12%",  rot: "-5deg",  delay: "0.2s" },
    { icon: "🤖", label: "AI CHAT", val: "3 insights", sub: "Today",      x: "34%",  y: "15%",  rot: "7deg",   delay: "0.3s" },
    { icon: "👨‍⚕️", label: "EXPERT", val: "Consult",   sub: "Aug 28",     x: "20%",  y: "48%",  rot: "4deg",   delay: "0.4s" },
  ];

  return (
    <section className="py-32 border-b border-rule bg-surface-2 overflow-hidden">
      <div className="wrap">
        <div className="text-center mb-20 max-w-[700px] mx-auto">
          <h2 className="section-heading text-[clamp(2.5rem,5vw,4rem)] text-ink mb-5">
            Your health lives in<br /><span className="text-leaf">five different apps.</span>
          </h2>
          <p className="text-[18px] text-ink-soft">FLUETAS puts it all in one record — so your AI, your experts, and you are always looking at the same picture.</p>
        </div>

        {/* Visual: scattered → unified */}
        <div className="relative max-w-[900px] mx-auto h-[380px] flex items-center justify-center">
          {/* scattered data cards */}
          {cards.map((c) => (
            <div
              key={c.label}
              className="absolute w-[160px] rounded-2xl border border-rule bg-surface shadow-lg p-4"
              style={{ left: `calc(50% + ${c.x})`, top: `calc(50% + ${c.y})`, transform: `translate(-50%, -50%) rotate(${c.rot})` }}
            >
              <p className="eyebrow mb-2 flex items-center gap-1.5 !text-[10px]"><span className="text-[14px]">{c.icon}</span>{c.label}</p>
              <p className="text-[18px] font-bold text-ink leading-none mb-0.5">{c.val}</p>
              <p className="text-[12px] text-ink-soft">{c.sub}</p>
            </div>
          ))}

          {/* Connecting dashed lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <line x1="25%" y1="20%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="5 6" />
            <line x1="75%" y1="20%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="5 6" />
            <line x1="20%" y1="65%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="5 6" />
            <line x1="78%" y1="65%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="5 6" />
            <line x1="40%" y1="85%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="5 6" />
          </svg>

          {/* Center: Unified FLUETAS Profile */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[200px] rounded-3xl bg-ink border-2 border-leaf/40 shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 0 0 8px rgba(46,125,50,0.08), 0 32px 80px rgba(18,22,15,0.35)" }}>
            <div className="bg-[#161d19] px-5 py-4 border-b border-[#2a3028]">
              <p className="brand text-[11px] text-[#8e998a]">FLUETAS PROFILE</p>
              <p className="text-[16px] font-bold text-[#FAFAF6] mt-0.5">Anya K.</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { l: "Training", pct: 82, c: "var(--leaf)" },
                { l: "Recovery", pct: 76, c: "var(--ember)" },
                { l: "Sleep",    pct: 91, c: "var(--tide)" },
              ].map(b => (
                <div key={b.l}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-[#8e998a] font-medium uppercase tracking-wide">{b.l}</span>
                    <span className="text-[#FAFAF6] font-bold">{b.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#2a3028]">
                    <div className="h-full rounded-full transition-all" style={{ width: `${b.pct}%`, background: b.c }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[#2a3028]">
                <p className="text-[11px] font-bold text-leaf-hi">Wellness Score: 84</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   03 — TRAIN SECTION: Real Workout Screen
───────────────────────────────────────── */
function WorkoutScreen() {
  const exercises = [
    { n: "01", name: "Barbell Bench Press",    sets: "4 sets", reps: "8–10 reps", last: "80 kg" },
    { n: "02", name: "Incline Dumbbell Press", sets: "3 sets", reps: "10–12 reps", last: "24 kg" },
    { n: "03", name: "Cable Fly",              sets: "3 sets", reps: "12 reps",   last: "15 kg" },
    { n: "04", name: "Dumbbell Curl",          sets: "3 sets", reps: "10–12 reps", last: "14 kg" },
    { n: "05", name: "Hammer Curl",            sets: "2 sets", reps: "12 reps",   last: "12 kg" },
  ];

  const bars = [
    { d: "M", h: 55, active: false }, { d: "T", h: 78, active: false }, { d: "W", h: 90, active: true },
    { d: "T", h: 62, active: false }, { d: "F", h: 40, active: false }, { d: "S", h: 83, active: false }, { d: "S", h: 70, active: false },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 max-w-[1100px] mx-auto items-start">
      {/* Left: Workout card — looks like a real app screen */}
      <div className="rounded-[28px] border border-rule bg-surface shadow-[0_20px_80px_rgba(18,22,15,0.10)] overflow-hidden">
        {/* App header */}
        <div className="bg-ink px-8 py-7">
          <div className="flex items-center justify-between mb-1">
            <p className="eyebrow !text-[#8e998a] !text-[10px]">TODAY&apos;S SESSION</p>
            <span className="rounded-full bg-leaf/20 border border-leaf/30 px-3 py-1 text-[11px] font-bold text-leaf-hi uppercase tracking-wide">Day 3 of 4</span>
          </div>
          <h3 className="headline text-[2.2rem] text-[#FAFAF6] mt-1">CHEST +<br />BICEPS</h3>
          <div className="flex gap-5 mt-4">
            <span className="flex items-center gap-1.5 text-[13px] text-[#8e998a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              ~50 min
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-[#8e998a]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M6.5 17.5h11M12 2v3M12 19v3"/></svg>
              5 exercises
            </span>
          </div>
        </div>

        {/* Exercise list */}
        <div className="divide-y divide-rule">
          {exercises.map((ex, i) => (
            <div key={ex.n} className={`flex items-center gap-5 px-8 py-5 ${i === 0 ? "bg-leaf/5" : ""}`}>
              <span className="text-[13px] font-bold text-ink-soft w-6 shrink-0">{ex.n}</span>
              <div className="flex-1">
                <p className="text-[16px] font-semibold text-ink">{ex.name}</p>
                <p className="text-[13px] text-ink-soft mt-0.5">{ex.sets} · {ex.reps}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[12px] text-ink-soft">Last</p>
                <p className="text-[14px] font-bold text-ink">{ex.last}</p>
              </div>
              {i === 0 && (
                <div className="h-2 w-2 rounded-full bg-leaf-hi shrink-0" style={{ boxShadow: "0 0 0 4px rgba(76,168,79,0.2)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="p-6">
          <button className="w-full rounded-xl bg-leaf py-5 text-[15px] font-bold text-[#FAFAF6] uppercase tracking-widest hover:bg-leaf-hi transition-colors">
            Begin Workout →
          </button>
        </div>
      </div>

      {/* Right: Progress + AI insight */}
      <div className="space-y-6">
        {/* Weekly volume chart */}
        <div className="rounded-[24px] border border-rule bg-surface p-7 shadow-sm">
          <p className="eyebrow mb-5">Weekly volume</p>
          <div className="flex items-end gap-2 h-[90px]">
            {bars.map(({ d, h, active }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-md transition-all" style={{
                  height: `${h}%`,
                  background: active ? "var(--leaf)" : "var(--rule)",
                  minHeight: 4,
                  boxShadow: active ? "0 4px 16px rgba(46,125,50,0.3)" : "none"
                }} />
                <span className={`text-[11px] font-semibold ${active ? "text-leaf" : "text-ink-soft"}`}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal bests */}
        <div className="rounded-[24px] border border-rule bg-surface p-7 shadow-sm">
          <p className="eyebrow mb-4">Personal bests</p>
          <div className="space-y-4">
            {[
              { ex: "Bench Press", pb: "100 kg", date: "Aug 14" },
              { ex: "Incline Press", pb: "30 kg", date: "Aug 21" },
              { ex: "Dumbbell Curl", pb: "18 kg", date: "Jul 30" },
            ].map(p => (
              <div key={p.ex} className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{p.ex}</p>
                  <p className="text-[12px] text-ink-soft">{p.date}</p>
                </div>
                <span className="text-[18px] font-bold text-ink">{p.pb}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI recommendation */}
        <div className="rounded-[24px] border border-leaf/20 bg-leaf/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-leaf-hi" />
            <span className="eyebrow !text-leaf !text-[10px]">AI FLUETAS Coach</span>
          </div>
          <p className="text-[14px] text-ink leading-relaxed">
            Based on your 82% training readiness and yesterday&apos;s rest day, this is an ideal session to push intensity. Target 85–90% of your 1RM on bench.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   04 — HER SECTION: Cycle Tracker UI
───────────────────────────────────────── */
function CycleTrackerUI() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const today = 14;
  const phases = [
    { label: "Menstrual", days: [1,2,3,4,5], color: "var(--rose)" },
    { label: "Follicular", days: [6,7,8,9,10,11,12,13], color: "var(--ember)" },
    { label: "Ovulatory", days: [14,15,16], color: "var(--leaf)" },
    { label: "Luteal", days: [17,18,19,20,21,22,23,24,25,26,27,28], color: "var(--tide)" },
  ];
  const getColor = (day: number) => phases.find(p => p.days.includes(day))?.color ?? "var(--rule)";

  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      {/* Main tracker card */}
      <div className="rounded-[28px] border border-rule bg-surface shadow-[0_20px_80px_rgba(18,22,15,0.08)] overflow-hidden">
        <div className="px-10 py-8 border-b border-rule flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow mb-1 !text-rose">FLUETAS HER</p>
            <h3 className="section-heading text-[2rem] text-ink">Cycle Tracker</h3>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-rose/20 bg-rose/5 px-6 py-4">
            <div>
              <p className="text-[12px] font-semibold text-rose uppercase tracking-wide">Current Phase</p>
              <p className="text-[20px] font-bold text-ink">Ovulatory</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-ink-soft">Day</p>
              <p className="tabular text-[2.5rem] font-bold text-rose leading-none">14</p>
            </div>
          </div>
        </div>

        {/* Calendar dot grid */}
        <div className="px-10 py-8">
          <p className="eyebrow mb-5">This cycle</p>
          <div className="flex flex-wrap gap-2">
            {days.map(day => {
              const color = getColor(day);
              const isToday = day === today;
              const isPast = day < today;
              return (
                <div
                  key={day}
                  className={`relative h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${isToday ? "ring-2 ring-offset-1 ring-rose scale-125" : ""}`}
                  style={{
                    background: isPast || isToday ? color : "var(--surface-2)",
                    color: isPast || isToday ? "white" : "var(--ink-soft)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          {/* Phase legend */}
          <div className="flex flex-wrap gap-4 mt-6">
            {phases.map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-[12px] text-ink-soft font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "ENERGY",   val: "High",   icon: "⚡", color: "var(--leaf)",   note: "↑ Peak window" },
          { label: "MOOD",     val: "Great",  icon: "✨", color: "var(--violet)", note: "Stable" },
          { label: "SYMPTOMS", val: "None",   icon: "✓", color: "var(--tide)",   note: "Clear" },
          { label: "LIBIDO",   val: "High",   icon: "♀", color: "var(--rose)",   note: "Ovulatory peak" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-rule bg-surface p-6 text-center">
            <span className="text-[24px] mb-2 block">{m.icon}</span>
            <p className="eyebrow mb-1">{m.label}</p>
            <p className="text-[20px] font-bold text-ink mb-1">{m.val}</p>
            <p className="text-[11px] font-semibold rounded-full px-2 py-0.5 inline-block" style={{ color: m.color, background: `${m.color}15` }}>{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   05 — AI CHAT: Real conversation UI
───────────────────────────────────────── */
function AIChatUI() {
  const [activeChat, setActiveChat] = useState(0);

  const chats = [
    {
      prompt: "I've been sleeping poorly but training more. Should I push through my leg session today?",
      replies: [
        { type: "data", content: "Over the last 3 days, your sleep dropped 18% while your training strain increased 22%." },
        { type: "text", content: "I'd suggest skipping heavy legs today and doing active recovery or mobility instead. Your muscles are adapting but your nervous system needs a break." },
        { type: "action", content: "Switch to: 30-min mobility flow →" },
      ],
      disclaimer: "Not a medical diagnosis — consult a professional for health concerns."
    },
    {
      prompt: "What should I train today?",
      replies: [
        { type: "data", content: "Training readiness: 82% · Recovery: 76% · Last session: Chest + Biceps (yesterday)" },
        { type: "text", content: "Today is optimal for Back + Shoulders. Your posterior chain has had 48h rest — your strongest lifting window." },
        { type: "action", content: "Load Back + Shoulders →" },
      ],
      disclaimer: "Based on your tracked recovery metrics."
    },
    {
      prompt: "How can I improve my recovery score?",
      replies: [
        { type: "data", content: "Current recovery: 76% · Sleep quality: 91% · Hydration: 68% (low)" },
        { type: "text", content: "Your sleep is excellent — the main drag on recovery is hydration. Add 500ml before your session and a 15-min post-workout stretch." },
        { type: "action", content: "View Recovery Plan →" },
      ],
      disclaimer: "Personalised advice. Verify nutrition guidance with your dietitian."
    }
  ];

  const current = chats[activeChat];

  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <div className="rounded-[28px] border border-[#2a3028] bg-[#0d1210] overflow-hidden shadow-2xl flex flex-col">
        {/* App bar */}
        <div className="flex items-center gap-4 border-b border-[#2a3028] px-7 py-5 bg-[#0d1210]">
          <div className="h-10 w-10 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center">
            <span className="text-[18px]">🤖</span>
          </div>
          <div>
            <p className="brand text-[15px] text-[#FAFAF6]">FLUETAS AI</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
              <p className="text-[11px] text-[#8e998a]">Connected to your profile</p>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[11px] text-[#8e998a]">Powered by FLUETAS-approved knowledge</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-7 md:p-10 space-y-6 flex-1">
          {/* User message */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#2a3028] flex items-center justify-center text-[11px] font-bold text-[#8e998a]">A</div>
              <span className="text-[11px] text-[#8e998a] font-semibold uppercase tracking-wide">Anya</span>
            </div>
            <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[#1e2a21] border border-[#2a3028] px-5 py-4">
              <p className="text-[16px] text-[#FAFAF6] leading-relaxed">{current.prompt}</p>
            </div>
          </div>

          {/* AI replies */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center text-[12px]">🤖</div>
              <span className="text-[11px] text-leaf-hi font-semibold uppercase tracking-wide">FLUETAS AI</span>
            </div>
            <div className="max-w-[80%] space-y-3">
              {current.replies.map((r, i) => (
                r.type === "data" ? (
                  <div key={i} className="rounded-xl bg-[#161d19] border border-[#2a3028] px-5 py-3">
                    <p className="text-[13px] text-[#8e998a] font-mono">{r.content}</p>
                  </div>
                ) : r.type === "action" ? (
                  <button key={i} className="flex items-center gap-2 rounded-xl border border-leaf/30 bg-leaf/10 px-5 py-3 text-[14px] text-leaf-hi font-semibold hover:bg-leaf/20 transition-colors">
                    {r.content}
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 6h10M7 2l4 4-4 4"/></svg>
                  </button>
                ) : (
                  <div key={i} className="rounded-2xl rounded-tl-sm border border-[#2a3028] bg-[#0d1210] px-5 py-4">
                    <p className="text-[16px] text-[#d3dbcf] leading-relaxed">{r.content}</p>
                  </div>
                )
              ))}
              <p className="text-[11px] text-[#8e998a] italic pl-2">{current.disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Bottom: suggested prompts + input */}
        <div className="border-t border-[#2a3028] px-7 pb-7 pt-5 space-y-4 bg-[#0a0f0c]">
          <div className="flex flex-wrap gap-2">
            {chats.map((c, i) => i !== activeChat && (
              <button key={i} onClick={() => setActiveChat(i)}
                className="rounded-full border border-[#2a3028] bg-[#161d19] px-4 py-2 text-[12px] text-[#8e998a] hover:text-[#FAFAF6] hover:bg-[#1e2621] transition-colors text-left max-w-[280px] truncate">
                &ldquo;{c.prompt}&rdquo;
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-[#3f4a3c] bg-[#161d19] px-5 py-4">
            <span className="flex-1 text-[15px] text-[#4a5548]">Ask anything about your health...</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-leaf">
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#FAFAF6" strokeWidth="2" strokeLinecap="round"><path d="M1 6h10M7 2l4 4-4 4"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   06 — EXPERTS: Real Profile Directory
───────────────────────────────────────── */
function ExpertsDirectory() {
  const experts = [
    { role: "Physiotherapist", name: "Dr. Sarah Jenkins", exp: "8 yrs", speciality: "Sports injury & rehabilitation", slots: "Next: Thu 10am", rating: 4.9, reviews: 142, color: "var(--ember)", initials: "SJ" },
    { role: "Gynecologist",    name: "Dr. Elena Rostova", exp: "12 yrs", speciality: "Hormonal health & cycle wellness", slots: "Next: Fri 2pm",  rating: 4.9, reviews: 214, color: "var(--rose)", initials: "ER" },
    { role: "Sports Nutritionist", name: "Marcus Thorne", exp: "6 yrs", speciality: "Performance nutrition & macros", slots: "Next: Thu 4pm",  rating: 4.8, reviews: 97,  color: "var(--leaf)", initials: "MT" },
    { role: "Performance Coach",   name: "David Chen",   exp: "10 yrs", speciality: "Strength & conditioning", slots: "Next: Sat 11am", rating: 4.9, reviews: 188, color: "var(--tide)", initials: "DC" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {experts.map(e => (
          <div key={e.name} className="rounded-[24px] border border-rule bg-surface shadow-sm overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300">
            {/* Avatar area */}
            <div className="h-[160px] relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${e.color}18, ${e.color}08)` }}>
              <div className="h-20 w-20 rounded-full border-4 border-surface shadow-lg flex items-center justify-center text-[28px] font-bold" style={{ background: `${e.color}20`, color: e.color }}>
                {e.initials}
              </div>
              <div className="absolute top-4 right-4">
                <span className="rounded-full bg-surface border border-rule px-2.5 py-1 text-[11px] font-bold text-ink-soft">{e.exp}</span>
              </div>
            </div>
            {/* Info */}
            <div className="p-6 flex flex-col flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: e.color }}>{e.role}</p>
              <h3 className="section-heading text-[17px] text-ink mb-1">{e.name}</h3>
              <p className="text-[13px] text-ink-soft mb-3">{e.speciality}</p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[#f59e0b] text-[14px]">★</span>
                <span className="text-[14px] font-bold text-ink">{e.rating}</span>
                <span className="text-[13px] text-ink-soft">({e.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[12px] font-semibold text-ink">{e.slots}</span>
              </div>
              <button className="mt-auto w-full rounded-xl border-2 border-rule py-3 text-[13px] font-bold text-ink hover:border-ink transition-colors uppercase tracking-wide">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonials marquee */}
      <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_120px,_black_calc(100%-120px),transparent_100%)]">
        <div className="flex w-max animate-marquee items-center gap-6">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {[
                { text: "FLUETAS gives me the context I've always been missing before a consultation.", author: "Dr. Sarah Jenkins", role: "Physiotherapist" },
                { text: "Finally, a platform that understands that cycle data and training aren't separate.", author: "Dr. Elena Rostova", role: "Gynecologist" },
                { text: "I can adjust a client's macros based on their actual recovery data, not guesswork.", author: "Marcus Thorne", role: "Sports Nutritionist" },
                { text: "The first tool that brings sleep, strain, and my programming into one view.", author: "David Chen", role: "Performance Coach" },
                { text: "I don't have to explain my whole history every time I see a new specialist.", author: "Anya K.", role: "FLUETAS Athlete" },
              ].map((r, j) => (
                <div key={`${i}-${j}`} className="flex w-[400px] shrink-0 flex-col rounded-[20px] border border-rule bg-surface p-7 shadow-sm">
                  <p className="mb-5 text-[16px] italic text-ink leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <div className="mt-auto flex items-center gap-3 border-t border-rule pt-5">
                    <div className="h-10 w-10 rounded-full bg-surface-2 shrink-0 flex items-center justify-center text-[13px] font-bold text-ink-soft border border-rule">{r.author.charAt(0)}</div>
                    <div>
                      <p className="text-[14px] font-bold text-ink">{r.author}</p>
                      <p className="eyebrow !text-[10px]">{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   07 — HEALTH RECORD: Compact Profile Card
───────────────────────────────────────── */
function HealthRecordCard() {
  const metrics = [
    { label: "Training",  pct: 82, color: "var(--leaf)" },
    { label: "Recovery",  pct: 76, color: "var(--ember)" },
    { label: "Sleep",     pct: 91, color: "var(--tide)" },
    { label: "Nutrition", pct: 64, color: "var(--violet)" },
  ];

  const log = [
    { icon: "🏋️", title: "Chest + Biceps workout logged",  time: "Today, 9:15am",   color: "text-leaf" },
    { icon: "♀",  title: "Cycle log updated — Day 14",     time: "Today, 8:00am",   color: "text-rose" },
    { icon: "🤖", title: "AI conversation: recovery advice", time: "Yesterday",     color: "text-violet" },
    { icon: "👨‍⚕️","title": "Dr. Elena Rostova consultation",  time: "Aug 28",      color: "text-ember" },
    { icon: "📄", title: "Blood report uploaded",          time: "Aug 25",          color: "text-tide" },
  ];

  return (
    <div className="max-w-[960px] mx-auto rounded-[32px] border border-rule bg-surface shadow-[0_32px_120px_rgba(18,22,15,0.10)] overflow-hidden">
      {/* Profile header */}
      <div className="flex items-center justify-between flex-wrap gap-6 px-10 py-8 bg-surface-2 border-b border-rule">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-ink flex items-center justify-center text-[24px] font-bold text-surface border-4 border-surface shadow-md">A</div>
          <div>
            <h3 className="brand text-[20px] text-ink">ANYA KAPOOR</h3>
            <p className="text-[14px] text-ink-soft">Active since August 2026 · Mumbai, India</p>
            <div className="flex gap-2 mt-1.5">
              <span className="rounded-full bg-leaf/10 border border-leaf/20 px-2.5 py-0.5 text-[11px] font-bold text-leaf">FLUETAS MEMBER</span>
              <span className="rounded-full bg-surface border border-rule px-2.5 py-0.5 text-[11px] font-bold text-ink-soft">PREMIUM</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center rounded-2xl bg-surface border border-rule px-6 py-4 shadow-sm">
            <p className="eyebrow mb-1">Wellness Score</p>
            <p className="tabular text-[3rem] font-bold text-leaf leading-none">84</p>
          </div>
          <div className="text-center rounded-2xl bg-surface border border-rule px-6 py-4 shadow-sm">
            <p className="eyebrow mb-1">Streak</p>
            <p className="tabular text-[3rem] font-bold text-ink leading-none">14<span className="text-[1.2rem] text-ink-soft">d</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] divide-y md:divide-y-0 md:divide-x divide-rule">
        {/* Metrics */}
        <div className="p-10 space-y-7">
          <p className="eyebrow mb-2">Health metrics</p>
          {metrics.map(m => (
            <div key={m.label}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-bold text-ink tracking-widest uppercase">{m.label}</span>
                <span className="tabular text-[20px] font-bold text-ink leading-none">{m.pct}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-surface-2 overflow-hidden border border-rule">
                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent log */}
        <div className="p-10 bg-surface-2">
          <p className="eyebrow mb-6">Recent entries</p>
          <div className="space-y-5">
            {log.map((ev, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface border border-rule text-[17px] mt-0.5">
                  {ev.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-ink leading-tight">{ev.title}</p>
                  <p className={`text-[12px] font-medium mt-0.5 ${ev.color}`}>{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full rounded-xl border border-rule py-3 text-[13px] font-bold text-ink hover:border-ink-soft transition-colors uppercase tracking-wide">
            View Full Record →
          </button>
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
        <div className="wrap flex h-[72px] items-center justify-between gap-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <img src="/assets/image.png" alt="FLUETAS" width={36} height={36} />
            <span className="brand text-[18px]">FLUETAS</span>
          </a>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-ink-soft">
            <a href="#train"     className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Train</a>
            <a href="#her"       className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Her</a>
            <a href="#ai"        className="hover:text-ink transition-colors uppercase tracking-[0.05em]">AI</a>
            <a href="#experts"   className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Experts</a>
            <a href="#record"    className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Record</a>
            <a href="#nutrition" className="hover:text-ink transition-colors uppercase tracking-[0.05em]">Nutrition</a>
          </nav>

          <a href="#closing" className="shrink-0 rounded-sm bg-ink px-6 py-3 text-[13px] font-semibold text-surface transition-colors hover:bg-ink/80 uppercase tracking-[0.04em]">
            Join FLUETAS
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════
          01 — HERO
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-rule min-h-[calc(100vh-72px)] flex items-center">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 900px 700px at 80% 50%, rgba(46,125,50,0.07) 0%, transparent 65%)" }} />

        <div className="wrap py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 gap-16 lg:gap-12 lg:grid-cols-[1fr_400px] lg:items-center">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-leaf-hi animate-pulse-soft" style={{ boxShadow: "0 0 0 4px rgba(76,168,79,0.2)" }} />
                <span className="eyebrow !text-leaf !text-[10px] tracking-[0.1em]">FLUETAS · LAUNCHING 4 SEPTEMBER 2026</span>
              </div>

              <h1 className="headline text-[clamp(3.2rem,5.5vw,5.8rem)] text-ink mb-6 leading-[0.93]">
                YOUR BODY.<br />
                YOUR DATA.<br />
                <span className="text-leaf">YOUR FORMULA.</span>
              </h1>

              <p className="mb-10 max-w-[480px] text-[18px] leading-[1.65] text-ink-soft">
                One platform for training, women&apos;s wellness, AI guidance, expert consultations and personalized nutrition — all in a single health record.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#closing" className="rounded-sm bg-ink px-8 py-4 text-[14px] font-bold text-surface uppercase tracking-[0.05em] hover:-translate-y-px transition-transform">
                  Join the waitlist
                </a>
                <a href="#platform" className="rounded-sm border-2 border-rule px-8 py-4 text-[14px] font-bold text-ink hover:border-ink-soft transition-colors uppercase tracking-[0.05em]">
                  See how it works
                </a>
              </div>
            </div>

            <div id="platform">
              <HeroAppCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          02 — ONE RECORD
      ══════════════════════════════════ */}
      <OneRecordSection />

      {/* ══════════════════════════════════
          STATEMENT 1
      ══════════════════════════════════ */}
      <section className="bg-ink py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,7vw,7rem)] text-[#FAFAF6]">
            ONE BODY.<br/>
            MANY SIGNALS.<br/>
            <span className="text-leaf-hi">ONE RECORD.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          03 — TRAIN
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule" id="train">
        <div className="wrap">
          <div className="text-center mb-16 max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">FLUETAS Train</p>
            <h2 className="section-heading text-[clamp(2.5rem,4.5vw,4rem)] text-ink mb-5">
              Train with purpose.
            </h2>
            <p className="text-[18px] text-ink-soft leading-relaxed">
              Structured workouts built around progression — with your recovery data baked in, so every session is the right session.
            </p>
          </div>
          <WorkoutScreen />
        </div>
      </section>

      {/* ══════════════════════════════════
          04 — HER
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="her">
        <div className="wrap">
          <div className="text-center mb-16 max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-rose">FLUETAS Her</p>
            <h2 className="section-heading text-[clamp(2.5rem,4.5vw,4rem)] text-ink mb-5">
              Understand your cycle.<br />Understand yourself.
            </h2>
            <p className="text-[18px] text-ink-soft leading-relaxed">
              Your cycle shapes your energy, your mood and your training window. Her tracks it all and connects it to the rest of your FLUETAS profile.
            </p>
          </div>
          <CycleTrackerUI />
        </div>
      </section>

      {/* ══════════════════════════════════
          05 — AI
      ══════════════════════════════════ */}
      <section className="bg-[#0d1210] py-32 border-b border-[#2a3028]" id="ai">
        <div className="wrap">
          <div className="text-center mb-16 max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-violet">FLUETAS AI</p>
            <h2 className="section-heading text-[clamp(2.5rem,4.5vw,4.5rem)] text-[#FAFAF6] mb-5">
              Ask FLUETAS AI anything.
            </h2>
            <p className="text-[18px] text-[#8e998a] leading-relaxed">
              An AI coach powered by FLUETAS-approved knowledge — and trained on your actual data, not generic advice.
            </p>
          </div>
          <AIChatUI />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 2
      ══════════════════════════════════ */}
      <section className="bg-ink py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,6vw,6rem)] text-[#FAFAF6]">
            AI WHEN YOU NEED ANSWERS.<br/>
            <span className="text-ember">EXPERTS WHEN YOU NEED PEOPLE.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          06 — EXPERTS
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="experts">
        <div className="wrap">
          <div className="text-center mb-16 max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-ember">FLUETAS Experts</p>
            <h2 className="section-heading text-[clamp(2.5rem,4.5vw,4rem)] text-ink mb-5">
              Human expertise when you need it.
            </h2>
            <p className="text-[18px] text-ink-soft leading-relaxed">
              Book consultations directly through FLUETAS. Your profile is already in their hands before you speak.
            </p>
          </div>
          <ExpertsDirectory />
        </div>
      </section>

      {/* ══════════════════════════════════
          07 — HEALTH RECORD
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface relative overflow-hidden" id="record">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04]">
          <div className="w-[1200px] h-[1200px] rounded-full border border-ink" />
          <div className="absolute w-[800px] h-[800px] rounded-full border border-ink" />
        </div>

        <div className="wrap relative z-10">
          <div className="text-center mb-16 max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">The Centerpiece</p>
            <h2 className="section-heading text-[clamp(2.5rem,5vw,5rem)] text-ink mb-5">
              Your record builds itself.
            </h2>
            <p className="text-[20px] text-ink-soft leading-relaxed">
              Every session, every conversation, every consultation feeds into the most complete picture of your body you&apos;ve ever had.
            </p>
          </div>
          <HealthRecordCard />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 3
      ══════════════════════════════════ */}
      <section className="bg-ink py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <h2 className="headline text-[clamp(3rem,7vw,7rem)] text-[#FAFAF6]">
            YOUR DATA<br/>
            <span className="text-tide">DOESN&apos;T RESET.</span>
          </h2>
        </div>
      </section>

      {/* ══════════════════════════════════
          08 — NUTRITION (understated)
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule bg-surface-2" id="nutrition">
        <div className="wrap">
          <div className="text-center mb-20 max-w-[700px] mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="eyebrow !text-leaf">FLUETAS Nutrition</span>
              <span className="rounded-full border border-rule bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.05em] text-ink-soft">Coming soon</span>
            </div>
            <h2 className="section-heading text-[clamp(2.5rem,4.5vw,4rem)] text-ink mb-5">
              Nutrition connected to your journey.
            </h2>
            <p className="text-[18px] text-ink-soft leading-relaxed">
              What you track digitally becomes what you consume physically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1000px] mx-auto">
            {[
              { title: "Athlete+", color: "#D9622B", hex: "var(--ember)", desc: "Beetroot · Electrolytes · B12" },
              { title: "Gut+",     color: "#2E7D32", hex: "var(--leaf)",  desc: "Bael · Amla · Kokum · Ginger" },
              { title: "Recover+", color: "#2E6DA4", hex: "var(--tide)",  desc: "Coconut water · Amla · Lemon" },
            ].map(({ title, color, hex, desc }) => (
              <div key={title} className="flex flex-col items-center group">
                <div className="w-full h-[420px] rounded-[28px] bg-surface border border-rule shadow-lg overflow-hidden mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                  <NutritionProduct3D color={color} />
                </div>
                <h3 className="section-heading text-[24px] text-ink mb-2">{title}</h3>
                <p className="text-[13px] text-ink-soft uppercase tracking-widest text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          09 — PRIVACY
      ══════════════════════════════════ */}
      <section className="py-32 border-b border-rule">
        <div className="wrap">
          <div className="mb-16 text-center max-w-[700px] mx-auto">
            <p className="eyebrow mb-4 !text-leaf">Built around trust</p>
            <h2 className="section-heading text-[clamp(2.5rem,4vw,3.5rem)] text-ink mb-5">
              Your data. Your control.
            </h2>
            <p className="text-[18px] text-ink-soft leading-relaxed">
              Your profile is yours, not ours. You control what is stored, what experts can see, and how your information is shared.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { title: "Privacy", body: "Sensitive data — including cycle and consultation history — is never used without your knowledge." },
              { title: "Consent", body: "You choose what is stored, what experts can see, and how your information is shared." },
              { title: "Control", body: "Download, update or delete your data at any time. The keys stay with you." },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-[24px] border border-rule bg-surface-2 p-10 text-center">
                <h3 className="section-heading text-[22px] text-ink mb-4">{title}</h3>
                <p className="text-[16px] text-ink-soft leading-relaxed">{body}</p>
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
                <img src="/assets/image.png" alt="FLUETAS" width={40} height={40} />
                <span className="brand text-[20px]">FLUETAS</span>
              </a>
              <p className="text-[15px] text-ink-soft max-w-[260px] leading-relaxed">
                One platform for training, wellness, AI guidance and expert consultations.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-16 gap-y-10">
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[11px]">Platform</p>
                {["Train", "Her", "AI Coach", "Experts", "Nutrition"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[15px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[11px]">Company</p>
                {["How it works", "Privacy", "Launch"].map((l) => (
                  <a key={l} href="#" className="text-[15px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <p className="eyebrow mb-2 !text-[11px]">Social</p>
                {["Instagram", "Facebook"].map((l) => (
                  <a key={l} href="#" className="text-[15px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-20 flex flex-col gap-4 border-t border-rule pt-10 sm:flex-row sm:justify-between">
            <p className="text-[13px] text-ink-soft">Fitness · Wellness · Nutrition · Experts · Technology</p>
            <p className="text-[13px] text-ink-soft"><span className="brand text-[13px]">FLUETAS</span>.IN · Launching 4 September 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
