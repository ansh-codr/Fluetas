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
        <div key={l} className="flex flex-col items-center rounded-lg border border-rule bg-surface px-4 py-3 min-w-[64px]">
          <span className="tabular text-[2rem] font-medium leading-none text-ink" suppressHydrationWarning>
            {live ? String(v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 eyebrow">{l}</span>
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
    <p className="text-base text-ink" role="status">
      You&apos;re on the list — we&apos;ll email <span className="font-semibold">{email}</span> before the doors open on 4 September.
    </p>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="h-13 flex-1 rounded-sm border border-rule bg-surface px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-soft focus:border-leaf focus:outline-none transition-colors"
      />
      <button type="submit" className="rounded-sm bg-leaf px-7 py-3.5 text-[14px] font-semibold text-[#FAFAF6] transition-colors hover:bg-leaf-hi">
        Notify me
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   RING (SVG progress)
───────────────────────────────────────── */
function Ring({ pct, color, size = 72, label }: { pct: number; color: string; size?: number; label: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rule)" strokeWidth="5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="font-display text-[17px] font-semibold text-ink leading-none">{pct}%</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD MOCKUP
───────────────────────────────────────── */
function DashboardMockup() {
  const bars = [
    { d: "M", h: 55 }, { d: "T", h: 78 }, { d: "W", h: 90 }, { d: "T", h: 62 },
    { d: "F", h: 40 }, { d: "S", h: 83 }, { d: "S", h: 70 },
  ];
  return (
    <div className="rounded-2xl border border-rule bg-surface shadow-[0_8px_40px_rgba(18,22,15,0.08)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/image.png" alt="" aria-hidden width={22} height={22} className="rounded-sm" />
          <span className="brand text-[13px]">FLUETAS</span>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-ink-soft">Good evening, Anya</p>
          <p className="text-[11px] font-semibold text-leaf">Day 14 of cycle</p>
        </div>
      </div>
      <div className="p-5 space-y-5">
        <div>
          <p className="eyebrow mb-4">Your wellness today</p>
          <div className="flex justify-between">
            <Ring pct={82} color="var(--leaf)"   label="Training"  />
            <Ring pct={76} color="var(--ember)"  label="Recovery"  />
            <Ring pct={68} color="var(--tide)"   label="Hydration" />
            <Ring pct={91} color="var(--violet)" label="Sleep"     />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">Weekly activity</p>
          <div className="flex items-end gap-1.5 h-[60px]">
            {bars.map(({ d, h }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-sm" style={{ height: `${h}%`, background: i === 2 ? "var(--leaf)" : "var(--rule)", minHeight: 4 }} />
                <span className="text-[10px] text-ink-soft">{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-leaf/20 bg-leaf/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
            <span className="eyebrow !text-leaf">AI insight</span>
          </div>
          <p className="text-[13px] text-ink leading-relaxed">
            Your training load increased 14% this week. Consider prioritizing recovery and hydration before your next session.
          </p>
        </div>
        <div className="flex justify-around border-t border-rule pt-4">
          {["Train", "Her", "AI", "Experts", "Record"].map((tab) => (
            <button key={tab} className={`text-[11px] font-semibold ${tab === "Train" ? "text-leaf" : "text-ink-soft"}`}>{tab}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AI CHAT CARD
───────────────────────────────────────── */
function AIChatCard() {
  return (
    <div className="rounded-2xl border border-rule bg-surface shadow-[0_8px_40px_rgba(18,22,15,0.06)] overflow-hidden max-w-[520px] mx-auto">
      <div className="flex items-center gap-3 border-b border-rule px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-surface-2">
          <img src="/assets/image.png" alt="" aria-hidden width={32} height={32} />
        </div>
        <div>
          {/* Brand name consistent treatment */}
          <p className="brand text-[13px]">FLUETAS AI</p>
          <p className="text-[11px] text-ink-soft">FLUETAS-approved knowledge</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
          <span className="text-[11px] text-ink-soft">Active</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {/* User message */}
        <div className="flex flex-col items-end gap-1">
          <span className="eyebrow !text-ink-soft">You</span>
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3">
            <p className="text-[14px] text-[#FAFAF6] leading-relaxed">
              I&apos;ve trained legs twice this week and my sleep has been poor. Should I train tomorrow?
            </p>
          </div>
        </div>
        {/* AI reply */}
        <div className="flex flex-col items-start gap-1">
          <span className="eyebrow !text-leaf">FLUETAS AI</span>
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-2 border border-rule px-4 py-3">
            <p className="text-[14px] text-ink leading-relaxed">
              Based on what you&apos;ve shared, recovery may be worth prioritizing tomorrow. Consider reducing intensity and focusing on sleep quality and hydration instead.
            </p>
            <p className="mt-2 text-[12px] text-ink-soft italic">Not a medical diagnosis — consult a professional for health concerns.</p>
          </div>
        </div>
        {/* Input */}
        <div className="flex items-center gap-3 rounded-xl border border-rule bg-surface-2 px-4 py-3">
          <span className="flex-1 text-[13px] text-ink-soft">Ask about training, nutrition or recovery…</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#FAFAF6" strokeWidth="1.8" strokeLinecap="round"><path d="M1 6h10M7 2l4 4-4 4"/></svg>
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
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <a href="/" className="flex shrink-0 items-center gap-2">
            <img src="/assets/image.png" alt="FLUETAS" width={34} height={34} className="rounded-sm" />
            {/* Consistent brand treatment in nav */}
            <span className="brand text-[18px]">FLUETAS</span>
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-ink-soft">
            <a href="#train"     className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">Train</a>
            <a href="#her"       className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">Her</a>
            <a href="#ai"        className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">AI</a>
            <a href="#experts"   className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">Experts</a>
            <a href="#nutrition" className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">Nutrition</a>
            <a href="#journey"   className="hover:text-ink transition-colors uppercase tracking-[0.05em] text-[12px]">How it works</a>
          </nav>

          <a href="#closing" className="shrink-0 rounded-sm bg-leaf px-5 py-2.5 text-[13px] font-semibold text-[#FAFAF6] transition-colors hover:bg-leaf-hi uppercase tracking-[0.04em]">
            Join FLUETAS
          </a>
        </div>
      </header>

      {/* ══════════════════════════════════
          01 — HERO
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-rule">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-0 h-[700px] w-[600px]"
          style={{ background: "radial-gradient(circle, rgba(46,125,50,0.12) 0%, transparent 68%)" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[500px]"
          style={{ background: "radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 68%)" }} />

        <div className="wrap py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              {/* Launch badge */}
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" style={{ boxShadow: "0 0 0 3px rgba(76,168,79,0.2)" }} />
                <span className="eyebrow !text-leaf !text-[10px] tracking-[0.1em]">FLUETAS PLATFORM · LIVE 4 SEPTEMBER 2026</span>
              </div>

              {/* Hero headline — Space Grotesk 600, huge, tight */}
              <h1 className="headline text-[clamp(3rem,7vw,6.5rem)] text-ink mb-8">
                Your Body.<br />
                Your Data.<br />
                <span className="text-leaf">Your Formula.</span>
              </h1>

              <p className="mb-10 max-w-[480px] text-[18px] leading-[1.65] text-ink-soft">
                One platform for training, women&apos;s wellness, AI guidance, expert consultations and personalized nutrition.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#closing" className="rounded-sm bg-ink px-8 py-4 text-[14px] font-semibold text-surface uppercase tracking-[0.04em] hover:-translate-y-px transition-transform">
                  Join FLUETAS
                </a>
                <a href="#platform" className="rounded-sm border border-rule px-7 py-4 text-[14px] font-semibold text-ink hover:border-ink-soft transition-colors">
                  Explore the platform
                </a>
              </div>
            </div>

            <div id="platform" className="w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          02 — FRAGMENTATION → UNITY
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule bg-surface-2">
        <div className="wrap">
          <div className="mb-14 max-w-[640px]">
            <p className="eyebrow mb-4 !text-leaf">The problem we&apos;re solving</p>
            <h2 className="section-heading text-[clamp(2rem,3.8vw,3.2rem)] text-ink mb-5">
              Your health shouldn&apos;t live<br />in five different places.
            </h2>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Most people already track their body — across half a dozen apps that never talk to each other. FLUETAS brings it all together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* Fragmented */}
            <div className="rounded-2xl border border-rule bg-surface p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/10 text-rose text-[16px]">✕</span>
                <span className="eyebrow text-ink-soft">Fragmented today</span>
              </div>
              <div className="flex flex-col gap-2">
                {["Workout app", "Sleep tracker", "Nutrition app", "Doctor reports", "Period tracker", "AI chatbot", "Coach"].map((app, i) => (
                  <div key={app} className="flex flex-col">
                    <div className="flex h-9 items-center rounded-md border border-rule bg-surface-2 px-3">
                      <span className="text-[13px] text-ink-soft">{app}</span>
                    </div>
                    {i < 6 && <div className="h-3 w-px bg-rule self-center" />}
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-2 rounded-md bg-rose/10 border border-rose/20 px-3 py-2">
                  <span className="text-rose text-[13px] font-semibold">No shared picture. No real insight.</span>
                </div>
              </div>
            </div>

            {/* Unified */}
            <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf/15 text-[16px]">✓</span>
                <span className="eyebrow !text-leaf">FLUETAS brings it together</span>
              </div>
              <div className="flex flex-col items-center gap-0">
                {[
                  { label: "TRAIN",    color: "var(--leaf)"   },
                  { label: "HER",      color: "var(--rose)"   },
                ].map(({ label, color }) => (
                  <React.Fragment key={label}>
                    <div className="flex h-9 w-40 items-center justify-center rounded-md border" style={{ borderColor: color, color }}>
                      <span className="brand text-[12px]">{label}</span>
                    </div>
                    <div className="h-3 w-px opacity-40" style={{ background: color }} />
                  </React.Fragment>
                ))}
                <div className="flex w-48 items-center justify-center rounded-xl border-2 border-leaf bg-leaf py-4">
                  <span className="brand text-[15px] text-[#FAFAF6]">FLUETAS</span>
                </div>
                {[
                  { label: "AI COACH",  color: "var(--violet)" },
                  { label: "EXPERTS",   color: "var(--ember)"  },
                  { label: "PROFILE",   color: "var(--tide)"   },
                ].map(({ label, color }) => (
                  <React.Fragment key={label}>
                    <div className="h-3 w-px opacity-40" style={{ background: color }} />
                    <div className="flex h-9 w-40 items-center justify-center rounded-md border" style={{ borderColor: color, color }}>
                      <span className="brand text-[12px]">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
                <div className="mt-4 text-center">
                  <p className="text-[13px] font-medium text-leaf">Every interaction contributes to a more complete picture of you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          03 — TRAIN
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule" id="train">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.8"><path d="M4 12h2M18 12h2M6 8v8M18 8v8M8 12h8" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-leaf">FLUETAS Train</span>
              </div>
              {/* Editorial heading with line breaks */}
              <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink mb-6">
                Train<br />with purpose.
              </h2>
              <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
                Structured workouts designed around progression, consistency and better training decisions — not just sets and reps logged in a spreadsheet.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Chest + Biceps", "Back + Shoulders", "Legs + Core", "Abs", "Full body", "Custom splits"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[15px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-leaf shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {/* Visual: workout card */}
            <div className="rounded-2xl border border-rule bg-surface-2 p-6 space-y-3">
              <p className="eyebrow mb-2">Today&apos;s session · Chest + Biceps</p>
              {[
                { name: "Bench Press",  sets: "4 × 8",  rest: "90s" },
                { name: "Incline DB",   sets: "3 × 10", rest: "60s" },
                { name: "Cable Flyes",  sets: "3 × 12", rest: "45s" },
                { name: "Barbell Curl", sets: "3 × 10", rest: "60s" },
                { name: "Hammer Curl",  sets: "3 × 12", rest: "45s" },
              ].map((ex, i) => (
                <div key={ex.name} className="flex items-center gap-4 rounded-lg border border-rule bg-surface px-4 py-3">
                  <span className="font-display text-[13px] font-semibold text-leaf w-5 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-[14px] font-medium text-ink">{ex.name}</span>
                  <span className="text-[13px] text-ink-soft">{ex.sets}</span>
                  <span className="eyebrow">{ex.rest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          04 — HER
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule bg-surface-2" id="her">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Visual first on desktop */}
            <div className="order-2 lg:order-1 rounded-2xl border border-rose/20 bg-rose/5 p-6 space-y-4">
              <p className="eyebrow mb-2">Cycle · Day 14 of 28</p>
              <div className="relative h-4 rounded-full bg-rose/10 overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-rose/40" style={{ width: "50%" }} />
                <div className="absolute top-0 h-full w-0.5 bg-rose" style={{ left: "50%" }} />
              </div>
              <div className="grid grid-cols-4 gap-2 text-[11px] text-ink-soft text-center">
                <span>Menstrual</span><span>Follicular</span><span className="text-rose font-semibold">Ovulation</span><span>Luteal</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { l: "Energy",   v: 85, c: "#C23B6B" },
                  { l: "Mood",     v: 78, c: "#7A4E9E" },
                  { l: "Sleep",    v: 72, c: "#2E6DA4" },
                  { l: "Symptoms", v: 40, c: "#D9622B" },
                ].map(({ l, v, c }) => (
                  <div key={l} className="rounded-lg border border-rule bg-surface px-4 py-3">
                    <p className="eyebrow mb-2">{l}</p>
                    <div className="h-1.5 rounded-full bg-rule overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-5 flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-rose">FLUETAS Her</span>
              </div>
              {/* Editorial: line breaks for emphasis */}
              <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink mb-6">
                Understand<br />your cycle.<br />Understand yourself.
              </h2>
              <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
                Your cycle shapes your energy, your mood and your training. Her tracks it all and connects it to the rest of your FLUETAS profile — so nothing happens in isolation.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Period dates", "Cycle phase", "Symptoms", "Mood", "Energy levels", "Wellness patterns"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[15px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          05 — AI
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule" id="ai">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="1.8"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 13h.01M15 13h.01" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-violet">FLUETAS AI</span>
              </div>
              {/* Editorial: each word its own moment */}
              <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink mb-6">
                Ask.<br />Understand.<br />Improve.
              </h2>
              <p className="text-[17px] text-ink-soft leading-relaxed mb-6">
                An AI assistant powered by FLUETAS-approved knowledge — not a generic chatbot. Ask about training, nutrition, recovery or women&apos;s wellness and get responsible, grounded guidance.
              </p>
              <div className="rounded-xl border border-violet/20 bg-violet/5 px-5 py-4 mb-8">
                <p className="text-[13px] font-semibold text-violet mb-1">Why FLUETAS-approved matters</p>
                <p className="text-[14px] text-ink-soft leading-relaxed">
                  Our AI answers from curated, vetted knowledge — not the open internet. That&apos;s the difference between guidance and guesswork.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Training advice", "Nutrition guidance", "Recovery tips", "Fitness tracking", "Women's wellness", "Hydration goals"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[15px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <AIChatCard />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          06 — EXPERTS
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule bg-surface-2" id="experts">
        <div className="wrap">
          <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3 3 0 0 1 0 5.8M22 20c0-2.8-2-5-5-5.7" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-ember">FLUETAS Experts</span>
              </div>
              <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink">
                Human expertise<br />when you need it.
              </h2>
            </div>
            <div>
              <p className="text-[17px] text-ink-soft leading-relaxed mb-4 font-medium">
                AI can guide you. Experts can <em>know</em> you.
              </p>
              <p className="text-[17px] text-ink-soft leading-relaxed">
                Book consultations directly through FLUETAS. Your profile — workouts, cycle data, AI conversations — is already in their hands before you speak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { title: "Physiotherapist", tags: ["Recovery", "Injury", "Mobility"], color: "var(--ember)" },
              { title: "Gynecologist",    tags: ["Women's wellness", "Hormonal health", "Reproductive care"], color: "var(--rose)" },
              { title: "Nutritionist",    tags: ["Diet planning", "Gut health", "Meal guidance"], color: "var(--leaf)" },
              { title: "Trainer",         tags: ["Strength", "Programming", "Form & technique"], color: "var(--tide)" },
            ].map(({ title, tags, color }) => (
              <div key={title} className="rounded-xl border border-rule bg-surface p-5 hover:shadow-sm transition-shadow">
                <div className="mb-4 h-1 rounded-full" style={{ background: color }} />
                <h3 className="subhead text-[15px] text-ink mb-3">{title}</h3>
                <div className="space-y-1.5">
                  {tags.map((t) => (
                    <p key={t} className="text-[13px] text-ink-soft flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ background: color }} />
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
              <p className="mt-8 text-[13px] text-ink-soft italic text-center md:text-left">
            Consultation information becomes part of your FLUETAS profile, subject to your consent and privacy control.
          </p>

          {/* Scrolling Remarks */}
          <div className="mt-16 w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_60px,_black_calc(100%-60px),transparent_100%)]">
            <div className="flex w-max animate-marquee items-center gap-6">
              {[...Array(2)].map((_, i) => (
                <React.Fragment key={i}>
                  {[
                    { text: "FLUETAS gives me the context I've always been missing before a consultation.", author: "Dr. Sarah Jenkins", role: "Physiotherapist" },
                    { text: "Finally, a platform that understands that cycle data and training aren't separate.", author: "Dr. Elena Rostova", role: "Gynecologist" },
                    { text: "I can adjust a client's macros based on their actual recovery data, not guesswork.", author: "Marcus Thorne", role: "Sports Nutritionist" },
                    { text: "The first tool that brings sleep, strain, and my programming into one view.", author: "David Chen", role: "Performance Coach" },
                    { text: "I don't have to explain my whole history every time I speak to a new specialist.", author: "Anya K.", role: "FLUETAS Athlete" },
                  ].map((r, j) => (
                    <div key={`${i}-${j}`} className="flex w-[380px] shrink-0 flex-col rounded-xl border border-rule bg-surface p-6 shadow-sm">
                      <p className="mb-4 text-[15px] italic text-ink leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                      <div className="mt-auto flex items-center gap-3 border-t border-rule pt-4">
                        <div className="h-8 w-8 rounded-full bg-surface-2 shrink-0 flex items-center justify-center text-[10px] font-bold text-ink-soft border border-rule">{r.author.charAt(0)}</div>
                        <div>
                          <p className="text-[13px] font-semibold text-ink leading-none mb-1">{r.author}</p>
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
      </section>

      {/* ══════════════════════════════════
          07 — EVOLVING PROFILE
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule" id="journey">
        <div className="wrap">
          <div className="mb-16 max-w-[640px]">
            <p className="eyebrow mb-4 !text-leaf">Your profile gets richer over time</p>
            <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink mb-5">
              How your record<br />builds itself.
            </h2>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Your history doesn&apos;t disappear after one workout or one consultation. It keeps building — becoming the most complete picture of your body you&apos;ve ever had.
            </p>
          </div>

          {/* Vertical rail with large editorial step numbers */}
          <div className="flex flex-col gap-0 max-w-[660px]">
            {[
              { n: "01", title: "Train & track", sub: "Your workouts, meals, sleep and cycle data become part of your ongoing history — logged automatically as you use FLUETAS.", accent: "var(--leaf)" },
              { n: "02", title: "Ask AI",        sub: "Get guidance from FLUETAS-approved knowledge. Every conversation adds context to your profile.", accent: "var(--violet)" },
              { n: "03", title: "Consult an expert", sub: "Connect with the right professional when you need a real opinion — with your complete record already available to them.", accent: "var(--ember)" },
              { n: "04", title: "Report & follow-up", sub: "Consultation notes, tests and recommendations can be saved to your record, with appropriate consent. Nothing is lost.", accent: "var(--tide)" },
              { n: "05", title: "Updated profile", sub: "Your history never disappears. Every training session, every conversation, every consultation — building toward your formula.", accent: "var(--leaf)" },
            ].map(({ n, title, sub, accent }, i, arr) => (
              <div key={n} className="flex gap-6 items-stretch">
                {/* Rail: large number + connector line */}
                <div className="flex flex-col items-center" style={{ width: 56, flexShrink: 0 }}>
                  {/* Editorial step number — Space Grotesk 500, 32px */}
                  <div className="step-num" style={{ color: accent }}>{n}</div>
                  {i < arr.length - 1 && <div className="flex-1 w-px my-2 opacity-20" style={{ background: accent }} />}
                </div>
                {/* Content */}
                <div className={`flex-1 ${i < arr.length - 1 ? "pb-10" : ""}`}>
                  <h3 className="subhead text-[16px] text-ink mb-2 mt-1">{title}</h3>
                  <p className="text-[15px] text-ink-soft leading-relaxed">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thread tagline */}
          <div className="mt-14 border-t border-rule pt-8">
            <p className="font-display text-[20px] font-semibold text-leaf tracking-[-0.02em]">
              Your Body. Your Data. Your Formula.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          08 — NUTRITION (FUTURE VISION)
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule bg-surface-2" id="nutrition">
        <div className="wrap">
          <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.8"><path d="M12 3c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-4-3-5-4-8z"/><path d="M12 21v-6" strokeLinecap="round"/></svg>
                <div className="flex items-center gap-2">
                  <span className="eyebrow">FLUETAS Nutrition</span>
                  <span className="rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-ink-soft">Coming soon</span>
                </div>
              </div>
              <h2 className="section-heading text-[clamp(2rem,3.5vw,3rem)] text-ink">
                Nutrition,<br />connected to<br />your journey.
              </h2>
            </div>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              FLUETAS superfruit-based drinks and sachets are coming after launch — designed to connect physical nutrition with the FLUETAS digital ecosystem. What you track becomes what you consume.
            </p>
          </div>

          {/* Data → Nutrition flow */}
          <div className="flex flex-col items-center gap-0 mb-12 max-w-[280px] mx-auto">
            {[
              { label: "Your data",              color: "var(--leaf)"   },
              { label: "Your activity",          color: "var(--tide)"   },
              { label: "Your needs",             color: "var(--violet)" },
              { label: "FLUETAS",                color: "var(--leaf)", featured: true },
              { label: "Personalized nutrition", color: "var(--ember)" },
              { label: "Superfruit products",    color: "var(--leaf)"   },
            ].map(({ label, color, featured }, i, arr) => (
              <React.Fragment key={label}>
                <div className={`flex w-full items-center justify-center rounded-lg border py-2.5 px-4 ${featured ? "border-leaf bg-leaf" : "border-rule bg-surface"}`}
                  style={{ borderColor: featured ? undefined : color + "40" }}>
                  <span className={`text-[13px] font-medium ${featured ? "brand text-[#FAFAF6]" : ""}`} style={{ color: featured ? undefined : color }}>
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="h-4 w-px opacity-30" style={{ background: color }} />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { title: "Athlete+", bar: "#D9622B", tag: "Beetroot · Electrolytes · B12",          copy: "For stamina and recovery." },
              { title: "Gut+",     bar: "#2E7D32", tag: "Bael · Amla · Kokum · Ginger · Fennel", copy: "Daily digestive wellness." },
              { title: "Recover+", bar: "#2E6DA4", tag: "Coconut water · Amla · Lemon",           copy: "Rehydration after activity." },
              { title: "Glow+",    bar: "#7A4E9E", tag: "Amla · Pomegranate · Vitamin C",         copy: "Antioxidant skin support." },
            ].map(({ title, bar, tag, copy }) => (
              <div key={title} className="flex flex-col rounded-xl border border-rule bg-surface overflow-hidden">
                <div className="h-1.5 w-full shrink-0" style={{ background: bar }} />
                <div className="flex flex-1 flex-col p-5 gap-3">
                  <span className="self-start rounded-full border border-rule bg-surface-2 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Coming later</span>
                  <p className="text-[11px] uppercase tracking-[0.05em] text-ink-soft">{tag}</p>
                  <h4 className="subhead text-[16px] text-ink">{title}</h4>
                  <p className="text-[13px] text-ink-soft leading-relaxed">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[14px] text-ink-soft max-w-[560px]">
            Nutraceutical drinks and sachets launch roughly 6–12 months after the platform — connecting what you track digitally with what you consume physically.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════
          09 — PRIVACY
      ══════════════════════════════════ */}
      <section className="section-pad border-b border-rule">
        <div className="wrap">
          <div className="mb-12 max-w-[540px]">
            <p className="eyebrow mb-4 !text-leaf">Built around trust</p>
            <h2 className="section-heading text-[clamp(1.8rem,3vw,2.6rem)] text-ink mb-5">
              Your data.<br />Your control.
            </h2>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Your wellness information belongs to you. FLUETAS is being designed around privacy, consent and transparent control — especially for sensitive data like menstrual health and consultation history.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>, title: "Privacy", body: "Sensitive data — including cycle and consultation history — is never used without your knowledge." },
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round"/></svg>, title: "Consent", body: "You choose what is stored, what experts can see, and how your information is shared." },
              { icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2" strokeLinecap="round"/></svg>, title: "Control", body: "Download, update or delete your data at any time. Your profile is yours, not ours." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-xl border border-rule bg-surface-2 p-7">
                <div className="mb-4">{icon}</div>
                <h3 className="subhead text-[16px] text-ink mb-3">{title}</h3>
                <p className="text-[15px] text-ink-soft leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          10 — FINAL CTA
      ══════════════════════════════════ */}
      <section className="section-pad text-center relative overflow-hidden" id="closing">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 700px 500px at 50% 0%, rgba(46,125,50,0.08), transparent 70%)" }} />
        <div className="wrap relative z-10">
          <p className="eyebrow mb-6 !text-leaf">The platform launches 4 September 2026</p>
          <h2 className="section-heading text-[clamp(2.2rem,5vw,4.5rem)] text-ink mb-5">
            Be part of the<br /><span className="brand text-[clamp(2.2rem,5vw,4.5rem)] text-leaf">FLUETAS</span> journey.
          </h2>
          <p className="font-display font-semibold text-ink-soft text-[17px] tracking-[-0.02em] mb-10">
            Your Body. Your Data. Your Formula.
          </p>
          <div className="mb-10 flex justify-center">
            <CountdownRow />
          </div>
          <div className="mx-auto max-w-[500px] text-left mb-4">
            <WaitlistForm />
          </div>
          <p className="text-[13px] text-ink-soft">No spam. We&apos;ll only email you when it matters.</p>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="border-t border-rule py-16">
        <div className="wrap">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <a href="/" className="flex items-center gap-2 mb-3">
                <img src="/assets/image.png" alt="FLUETAS" width={38} height={38} className="rounded-sm" />
                <span className="brand text-[18px]">FLUETAS</span>
              </a>
              <p className="text-[14px] text-ink-soft max-w-[220px] leading-relaxed">
                One platform for training, wellness, AI guidance and expert consultations.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-10 gap-y-4">
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Platform</p>
                {["Train", "Her", "AI Coach", "Experts", "Nutrition"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[14px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Company</p>
                {["How it works", "Privacy", "Launch"].map((l) => (
                  <a key={l} href="#" className="text-[14px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Social</p>
                {["Instagram", "Facebook"].map((l) => (
                  <a key={l} href="#" className="text-[14px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-8 sm:flex-row sm:justify-between">
            <p className="text-[13px] text-ink-soft">Fitness · Wellness · Nutrition · Experts · Technology</p>
            <p className="text-[13px] text-ink-soft"><span className="brand text-[13px]">FLUETAS</span>.IN · Launching 4 September 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
