"use client";
import React, { useEffect, useState } from "react";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   COUNTDOWN
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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
  useEffect(() => { setLive(true); const id = setInterval(() => setT(getDiff()), 1000); return () => clearInterval(id); }, []);
  const units = [{ v: t.days, l: "Days" }, { v: t.hours, l: "Hrs" }, { v: t.minutes, l: "Min" }, { v: t.seconds, l: "Sec" }];
  return (
    <div className="flex gap-3">
      {units.map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center rounded-lg border border-rule bg-surface px-4 py-3 min-w-[64px]">
          <span className="tabular text-[2rem] font-normal leading-none text-ink" suppressHydrationWarning>
            {live ? String(v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-1 eyebrow">{l}</span>
        </div>
      ))}
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   WAITLIST FORM
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function WaitlistForm({ id = "wl-email" }: { id?: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  if (done) return (
    <p className="text-base text-ink" role="status">
      You&apos;re on the list â€” we&apos;ll email <span className="font-semibold">{email}</span> before the doors open on 4 September.
    </p>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
        className="h-13 flex-1 rounded-sm border border-rule bg-surface px-4 py-3.5 text-base text-ink placeholder:text-ink-soft focus:border-leaf focus:outline-none transition-colors" />
      <button type="submit" className="rounded-sm bg-leaf px-7 py-3.5 text-base font-bold text-[#FAFAF6] transition-colors hover:bg-leaf-hi">
        Notify me
      </button>
    </form>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   RING PROGRESS (SVG)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Ring({ pct, color, size = 72, label }: { pct: number; color: string; size?: number; label: string }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rule)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="font-display text-[18px] text-ink leading-none">{pct}%</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   DASHBOARD MOCKUP
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DashboardMockup() {
  const bars = [
    { d: "M", h: 55 }, { d: "T", h: 78 }, { d: "W", h: 90 }, { d: "T", h: 62 },
    { d: "F", h: 40 }, { d: "S", h: 83 }, { d: "S", h: 70 },
  ];
  return (
    <div className="rounded-2xl border border-rule bg-surface shadow-[0_8px_40px_rgba(18,22,15,0.08)] overflow-hidden">
      {/* App bar */}
      <div className="flex items-center justify-between border-b border-rule px-5 py-4">
        <div className="flex items-center gap-2">
          <img src="/assets/image.png" alt="" aria-hidden width={22} height={22} className="rounded-sm" />
          <span className="font-expanded text-[13px] font-bold text-ink tracking-[0.02em]">FLUETAS</span>
        </div>
        <div className="text-right">
          <p className="text-[12px] text-ink-soft">Good evening, Anya</p>
          <p className="text-[11px] font-semibold text-leaf">Day 14 of cycle</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Rings row */}
        <div>
          <p className="eyebrow mb-4">Your Wellness Today</p>
          <div className="flex justify-between">
            <Ring pct={82} color="var(--leaf)"   label="Training"  />
            <Ring pct={76} color="var(--ember)"  label="Recovery"  />
            <Ring pct={68} color="var(--tide)"   label="Hydration" />
            <Ring pct={91} color="var(--violet)" label="Sleep"     />
          </div>
        </div>

        {/* Activity bars */}
        <div>
          <p className="eyebrow mb-3">Weekly Activity</p>
          <div className="flex items-end gap-1.5 h-[60px]">
            {bars.map(({ d, h }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-sm transition-all" style={{ height: `${h}%`, background: i === 2 ? "var(--leaf)" : "var(--rule)", minHeight: 4 }} />
                <span className="text-[10px] text-ink-soft">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight */}
        <div className="rounded-xl border border-leaf/20 bg-leaf/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
            <span className="eyebrow !text-leaf">AI Insight</span>
          </div>
          <p className="text-[13px] text-ink leading-[1.55]">
            Your training load increased 14% this week. Consider prioritizing recovery and hydration before your next session.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex justify-around border-t border-rule pt-4">
          {["Train", "Her", "AI", "Experts", "Record"].map((tab) => (
            <button key={tab} className={`text-[11px] font-semibold ${tab === "Train" ? "text-leaf" : "text-ink-soft"}`}>{tab}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   AI CHAT CARD
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function AIChatCard() {
  return (
    <div className="rounded-2xl border border-rule bg-surface shadow-[0_8px_40px_rgba(18,22,15,0.06)] overflow-hidden max-w-[520px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-rule px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden bg-surface-2">
          <img src="/assets/image.png" alt="" aria-hidden width={32} height={32} className="" />
        </div>
        <div>
          <p className="font-expanded text-[13px] font-bold text-ink">FLUETAS AI</p>
          <p className="text-[11px] text-ink-soft">FLUETAS-approved knowledge</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
          <span className="text-[11px] text-ink-soft">Active</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* User bubble */}
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-3">
            <p className="text-[13px] text-[#FAFAF6] leading-[1.55]">
              I&apos;ve trained legs twice this week and my sleep has been poor. Should I train tomorrow?
            </p>
          </div>
        </div>

        {/* AI bubble */}
        <div className="flex justify-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full overflow-hidden bg-surface-2 mt-1">
            <img src="/assets/image.png" alt="" aria-hidden width={28} height={28} className="" />
          </div>
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-surface-2 border border-rule px-4 py-3">
            <p className="text-[13px] text-ink leading-[1.55]">
              Based on what you&apos;ve shared, recovery may be worth prioritizing tomorrow. Consider reducing training intensity and focusing on sleep quality and hydration instead.
            </p>
            <p className="mt-2 text-[11px] text-ink-soft italic">Not a medical diagnosis â€” always consult a professional for health concerns.</p>
          </div>
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-3 rounded-xl border border-rule bg-surface-2 px-4 py-3">
          <span className="flex-1 text-[13px] text-ink-soft">Ask FLUETAS AI anything about training, nutrition or recoveryâ€¦</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#FAFAF6" strokeWidth="1.8" strokeLinecap="round"><path d="M1 6h10M7 2l4 4-4 4"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN PAGE
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-ink font-sans">

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NAV
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-rule">
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <a href="/" className="flex shrink-0 items-center gap-2 font-expanded font-bold text-[19px] tracking-[0.02em] text-ink">
            {/* Actual FLUETAS panther logo mark â€” cropped to square so just mark shows in nav */}
            <img
              src="/assets/image.png"
              alt="FLUETAS"
              width={36}
              height={36}
              className="rounded-sm"
             
            />
            FLUETAS
          </a>

          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-ink-soft uppercase tracking-[0.04em]">
            <a href="#train"     className="hover:text-ink transition-colors">Train</a>
            <a href="#her"       className="hover:text-ink transition-colors">Her</a>
            <a href="#ai"        className="hover:text-ink transition-colors">AI</a>
            <a href="#experts"   className="hover:text-ink transition-colors">Experts</a>
            <a href="#nutrition" className="hover:text-ink transition-colors">Nutrition</a>
            <a href="#journey"   className="hover:text-ink transition-colors">How it works</a>
          </nav>

          <a href="#closing" className="shrink-0 rounded-sm bg-leaf px-5 py-2.5 text-sm font-bold text-[#FAFAF6] transition-colors hover:bg-leaf-hi">
            Join FLUETAS
          </a>
        </div>
      </header>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          01 â€” HERO
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative overflow-hidden border-b border-rule">
        <div aria-hidden className="pointer-events-none absolute -top-48 right-0 h-[700px] w-[600px]" style={{ background: "radial-gradient(circle, rgba(46,125,50,0.12) 0%, transparent 68%)" }} />
        <div aria-hidden className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[500px]" style={{ background: "radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 68%)" }} />

        <div className="wrap py-24 lg:py-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1fr] lg:items-center">

            {/* Copy */}
            <div>
              {/* Thread tagline at top */}
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/5 px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi" style={{ boxShadow: "0 0 0 3px rgba(76,168,79,0.2)" }} />
                <span className="eyebrow !text-leaf !text-[11px]">FLUETAS PLATFORM Â· LIVE 4 SEPTEMBER 2026</span>
              </div>

              <h1 className="headline mb-6 text-[clamp(44px,6vw,80px)] text-ink leading-[0.93]">
                Your Body.<br />Your Data.<br /><span className="text-leaf">Your Formula.</span>
              </h1>

              <p className="mb-10 max-w-[500px] text-[18px] leading-[1.65] text-ink-soft">
                One platform for training, women&apos;s wellness, AI guidance, expert consultations and personalized nutrition.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a href="#closing" className="rounded-sm bg-ink px-8 py-4 text-[15px] font-bold text-surface hover:-translate-y-px transition-transform">
                  Join FLUETAS
                </a>
                <a href="#platform" className="rounded-sm border border-rule px-7 py-4 text-[15px] font-semibold text-ink hover:border-ink-soft transition-colors">
                  Explore the Platform
                </a>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div id="platform" className="w-full max-w-[420px] mx-auto lg:mx-0 lg:ml-auto">
              <DashboardMockup />
            </div>

          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          02 â€” FRAGMENTATION â†’ UNITY
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule bg-surface-2">
        <div className="wrap">
          <div className="mb-14 max-w-[640px]">
            <p className="eyebrow mb-3 !text-leaf">The problem we&apos;re solving</p>
            <h2 className="headline text-[clamp(28px,3.4vw,46px)] text-ink mb-5">
              Your health shouldn&apos;t live in five different places.
            </h2>
            <p className="text-[16px] text-ink-soft leading-[1.65]">
              Most people already track their body â€” across half a dozen apps that never talk to each other. FLUETAS brings it all together.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch">

            {/* Left: Fragmented */}
            <div className="rounded-2xl border border-rule bg-surface p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/10 text-rose text-[16px]">âœ•</span>
                <span className="font-expanded text-[14px] font-bold uppercase tracking-[0.04em] text-ink-soft">Fragmented today</span>
              </div>
              <div className="flex flex-col gap-2">
                {["Workout App", "Sleep Tracker", "Nutrition App", "Doctor Reports", "Period Tracker", "AI Chatbot", "Coach"].map((app, i) => (
                  <div key={app} className="flex items-center gap-3">
                    <div className="flex h-9 flex-1 items-center rounded-md border border-rule bg-surface-2 px-3">
                      <span className="text-[13px] text-ink-soft">{app}</span>
                    </div>
                    {i < 6 && <div className="h-4 w-px bg-rule mx-auto" style={{ marginLeft: "50%", transform: "translateX(-50%)" }} />}
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-2 rounded-md bg-rose/10 border border-rose/20 px-3 py-2">
                  <span className="text-rose text-[13px] font-bold">No shared picture. No real insight.</span>
                </div>
              </div>
            </div>

            {/* Right: Unified */}
            <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf/15 text-[16px]">âœ“</span>
                <span className="font-expanded text-[14px] font-bold uppercase tracking-[0.04em] text-leaf">FLUETAS brings it together</span>
              </div>

              {/* Hub diagram */}
              <div className="flex flex-col items-center gap-2">
                {[
                  { label: "TRAIN",    color: "var(--leaf)"   },
                  { label: "HER",      color: "var(--rose)"   },
                ].map(({ label, color }) => (
                  <React.Fragment key={label}>
                    <div className="flex h-9 w-40 items-center justify-center rounded-md border" style={{ borderColor: color, color }}>
                      <span className="font-expanded text-[12px] font-bold tracking-[0.04em]">{label}</span>
                    </div>
                    <div className="h-3 w-px" style={{ background: color, opacity: 0.4 }} />
                  </React.Fragment>
                ))}

                {/* Central hub */}
                <div className="flex w-48 items-center justify-center rounded-xl border-2 border-leaf bg-leaf py-4">
                  <span className="font-expanded text-[15px] font-bold tracking-[0.04em] text-[#FAFAF6]">FLUETAS</span>
                </div>

                {[
                  { label: "AI COACH",  color: "var(--violet)" },
                  { label: "EXPERTS",   color: "var(--ember)"  },
                  { label: "PROFILE",   color: "var(--tide)"   },
                ].map(({ label, color }) => (
                  <React.Fragment key={label}>
                    <div className="h-3 w-px" style={{ background: color, opacity: 0.4 }} />
                    <div className="flex h-9 w-40 items-center justify-center rounded-md border" style={{ borderColor: color, color }}>
                      <span className="font-expanded text-[12px] font-bold tracking-[0.04em]">{label}</span>
                    </div>
                  </React.Fragment>
                ))}

                <div className="mt-3 text-center">
                  <p className="text-[12px] font-semibold text-leaf">Every interaction contributes to a more complete picture of you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          03 â€” TRAIN PILLAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule" id="train">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.8"><path d="M4 12h2M18 12h2M6 8v8M18 8v8M8 12h8" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-leaf">01 â€” Train</span>
              </div>
              <h2 className="headline mb-5 text-[clamp(28px,3.4vw,44px)] text-ink">
                Structured workouts<br />for real progression.
              </h2>
              <p className="mb-8 text-[16px] text-ink-soft leading-[1.65]">
                Not just a log. FLUETAS gives you purpose-built workout programs with exercise instructions, sets, reps and video demonstrations â€” structured for how your body actually adapts.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Chest + Biceps", "Back + Shoulders", "Legs + Core", "Abs", "Full Body", "Custom splits"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[14px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-leaf shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {/* Visual */}
            <div className="rounded-2xl border border-rule bg-surface-2 p-6 space-y-3">
              <p className="eyebrow mb-2">Today&apos;s session Â· Chest + Biceps</p>
              {[
                { name: "Bench Press",    sets: "4Ã—8",  rest: "90s" },
                { name: "Incline DB",     sets: "3Ã—10", rest: "60s" },
                { name: "Cable Flyes",    sets: "3Ã—12", rest: "45s" },
                { name: "Barbell Curl",   sets: "3Ã—10", rest: "60s" },
                { name: "Hammer Curl",    sets: "3Ã—12", rest: "45s" },
              ].map((ex, i) => (
                <div key={ex.name} className="flex items-center gap-4 rounded-lg border border-rule bg-surface px-4 py-3">
                  <span className="font-display text-[13px] text-leaf w-5">{i + 1}</span>
                  <span className="flex-1 text-[14px] font-semibold text-ink">{ex.name}</span>
                  <span className="text-[12px] text-ink-soft">{ex.sets}</span>
                  <span className="text-[11px] eyebrow">{ex.rest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          04 â€” HER PILLAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule bg-surface-2" id="her">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Visual first on desktop */}
            <div className="order-2 lg:order-1 rounded-2xl border border-rose/20 bg-rose/5 p-6 space-y-4">
              <p className="eyebrow mb-2">Cycle Â· Day 14 of 28</p>
              {/* Cycle bar */}
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
                    <p className="eyebrow mb-1">{l}</p>
                    <div className="h-1.5 rounded-full bg-rule overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: c }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="mb-4 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--rose)" strokeWidth="1.8"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-rose">02 â€” Her</span>
              </div>
              <h2 className="headline mb-5 text-[clamp(28px,3.4vw,44px)] text-ink">
                Understand your cycle.<br />Understand yourself.
              </h2>
              <p className="mb-8 text-[16px] text-ink-soft leading-[1.65]">
                Your cycle shapes your energy, your mood and your training. HER tracks it all and connects it to the rest of your FLUETAS profile â€” so nothing happens in isolation.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Period dates", "Cycle phase", "Symptoms", "Mood", "Energy levels", "Wellness patterns"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[14px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose shrink-0" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          05 â€” AI PILLAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule" id="ai">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" strokeWidth="1.8"><rect x="4" y="7" width="16" height="12" rx="2"/><path d="M9 7V5a3 3 0 0 1 6 0v2M9 13h.01M15 13h.01" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-violet">03 â€” AI Coach</span>
              </div>
              <h2 className="headline mb-5 text-[clamp(28px,3.4vw,44px)] text-ink">
                Ask. Understand.<br />Improve.
              </h2>
              <p className="mb-6 text-[16px] text-ink-soft leading-[1.65]">
                An AI assistant powered by FLUETAS-approved knowledge â€” not a generic chatbot. Ask about training, nutrition, recovery, or women&apos;s wellness. Get real, responsible guidance.
              </p>
              <div className="rounded-xl border border-violet/20 bg-violet/5 px-5 py-4 mb-8">
                <p className="text-[13px] font-semibold text-violet mb-1">Why FLUETAS-approved matters</p>
                <p className="text-[13px] text-ink-soft leading-[1.55]">
                  Our AI answers from curated, vetted knowledge â€” not the open internet. That&apos;s the difference between guidance and guesswork.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Training advice", "Nutrition guidance", "Recovery tips", "Fitness tracking", "Women&apos;s wellness", "Hydration goals"].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[14px] text-ink">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: s }} />
                  </div>
                ))}
              </div>
            </div>
            <AIChatCard />
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          06 â€” EXPERTS PILLAR
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule bg-surface-2" id="experts">
        <div className="wrap">
          <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ember)" strokeWidth="1.8"><circle cx="9" cy="7" r="3"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M16 4.5a3 3 0 0 1 0 5.8M22 20c0-2.8-2-5-5-5.7" strokeLinecap="round"/></svg>
                <span className="eyebrow !text-ember">04 â€” Experts</span>
              </div>
              <h2 className="headline text-[clamp(28px,3.4vw,44px)] text-ink">
                Human expertise<br />when you need it.
              </h2>
            </div>
            <div>
              <p className="text-[16px] text-ink-soft leading-[1.65] mb-4">
                AI can guide you. Experts can <em>know</em> you.
              </p>
              <p className="text-[16px] text-ink-soft leading-[1.65]">
                Book consultations directly through FLUETAS. Your profile â€” workouts, cycle data, AI conversations â€” is already in their hands before you speak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { title: "Physiotherapist", tags: ["Recovery", "Injury", "Mobility"], color: "var(--ember)" },
              { title: "Gynecologist",    tags: ["Women's Wellness", "Hormonal Health", "Reproductive Care"], color: "var(--rose)" },
              { title: "Nutritionist",    tags: ["Diet Planning", "Gut Health", "Meal Guidance"], color: "var(--leaf)" },
              { title: "Trainer",         tags: ["Strength", "Programming", "Form & Technique"], color: "var(--tide)" },
            ].map(({ title, tags, color }) => (
              <div key={title} className="rounded-xl border border-rule bg-surface p-5 hover:shadow-sm transition-shadow group">
                <div className="mb-4 h-1 rounded-full" style={{ background: color }} />
                <h3 className="font-expanded text-[14px] font-bold text-ink mb-3 uppercase tracking-[0.03em]">{title}</h3>
                <div className="space-y-1.5">
                  {tags.map((t) => (
                    <p key={t} className="text-[12px] text-ink-soft flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full shrink-0" style={{ background: color }} />
                      {t}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 text-[13px] text-ink-soft italic">
            Consultation information becomes part of your ongoing FLUETAS profile, subject to your consent and full privacy control.
          </p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          07 â€” EVOLVING PROFILE / HOW IT WORKS
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule" id="journey">
        <div className="wrap">
          <div className="mb-16 max-w-[640px]">
            <p className="eyebrow mb-3 !text-leaf">Your profile gets richer over time</p>
            <h2 className="headline text-[clamp(28px,3.4vw,46px)] text-ink mb-5">
              How your record<br />builds itself.
            </h2>
            <p className="text-[16px] text-ink-soft leading-[1.65]">
              Your history doesn&apos;t disappear after one workout or one consultation. It keeps building â€” becoming the most complete picture of your body you&apos;ve ever had.
            </p>
          </div>

          {/* Vertical rail */}
          <div className="flex flex-col gap-0 max-w-[660px]">
            {[
              {
                n: "01", title: "Train & Track",
                sub: "Your workouts, meals, sleep and cycle data become part of your ongoing history â€” logged automatically as you use FLUETAS.",
                accent: "var(--leaf)",
              },
              {
                n: "02", title: "Ask AI",
                sub: "Get guidance from FLUETAS-approved knowledge. Every conversation adds context to your profile.",
                accent: "var(--violet)",
              },
              {
                n: "03", title: "Consult an Expert",
                sub: "Connect with the right professional when you need a real opinion â€” with your complete record already available to them.",
                accent: "var(--ember)",
              },
              {
                n: "04", title: "Report & Follow-up",
                sub: "Consultation notes, tests and recommendations can be saved to your record, with appropriate consent. Nothing is lost.",
                accent: "var(--tide)",
              },
              {
                n: "05", title: "Updated Profile",
                sub: "Your history never disappears. Every training session, every conversation, every consultation â€” building toward Your Formula.",
                accent: "var(--leaf)",
              },
            ].map(({ n, title, sub, accent }, i, arr) => (
              <div key={n} className="flex gap-8 items-stretch">
                {/* Rail */}
                <div className="flex flex-col items-center" style={{ width: 48, flexShrink: 0 }}>
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-surface" style={{ borderColor: accent }}>
                    <span className="font-display text-[16px] leading-none" style={{ color: accent }}>{n}</span>
                  </div>
                  {i < arr.length - 1 && <div className="flex-1 w-px my-1 opacity-30" style={{ background: accent }} />}
                </div>
                {/* Content */}
                <div className={`flex-1 ${i < arr.length - 1 ? "pb-10" : ""}`}>
                  <h3 className="font-expanded text-[15px] font-bold uppercase tracking-[0.03em] text-ink mb-2 mt-2">{title}</h3>
                  <p className="text-[14px] text-ink-soft leading-[1.65]">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thread line */}
          <div className="mt-14 border-t border-rule pt-8">
            <p className="font-expanded text-[18px] font-bold text-leaf">Your Body. Your Data. Your Formula.</p>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          08 â€” NUTRITION (FUTURE VISION)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule bg-surface-2" id="nutrition">
        <div className="wrap">
          <div className="mb-14 grid grid-cols-1 gap-6 md:grid-cols-2 md:items-end">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.8"><path d="M12 3c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-4-3-5-4-8z"/><path d="M12 21v-6" strokeLinecap="round"/></svg>
                <div className="flex items-center gap-2">
                  <span className="eyebrow">05 â€” Nutrition</span>
                  <span className="rounded-full border border-rule bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] text-ink-soft">Coming soon</span>
                </div>
              </div>
              <h2 className="headline text-[clamp(28px,3.4vw,44px)] text-ink">
                Nutrition,<br />connected to<br />your journey.
              </h2>
            </div>
            <p className="text-[16px] text-ink-soft leading-[1.65]">
              FLUETAS superfruit-based drinks and sachets are coming after platform launch â€” designed to connect physical nutrition with the FLUETAS digital ecosystem. What you track becomes what you drink.
            </p>
          </div>

          {/* Data â†’ Nutrition flow */}
          <div className="flex flex-col items-center gap-0 mb-12 max-w-[280px] mx-auto">
            {[
              { label: "YOUR DATA",            color: "var(--leaf)"   },
              { label: "YOUR ACTIVITY",        color: "var(--tide)"   },
              { label: "YOUR NEEDS",           color: "var(--violet)" },
              { label: "FLUETAS",              color: "var(--leaf)", featured: true },
              { label: "PERSONALIZED NUTRITION", color: "var(--ember)" },
              { label: "SUPERFRUIT PRODUCTS", color: "var(--leaf)"   },
            ].map(({ label, color, featured }, i, arr) => (
              <React.Fragment key={label}>
                <div className={`flex w-full items-center justify-center rounded-lg border py-2.5 px-4 ${featured ? "border-leaf bg-leaf" : "border-rule bg-surface"}`} style={{ borderColor: featured ? undefined : color + "40" }}>
                  <span className={`font-expanded text-[12px] font-bold tracking-[0.04em] ${featured ? "text-[#FAFAF6]" : ""}`} style={{ color: featured ? undefined : color }}>
                    {label}
                  </span>
                </div>
                {i < arr.length - 1 && <div className="h-4 w-px opacity-30" style={{ background: color }} />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { title: "Athlete+", bar: "#D9622B", tag: "Beetroot Â· Electrolytes Â· B12",          copy: "For stamina and recovery." },
              { title: "Gut+",     bar: "#2E7D32", tag: "Bael Â· Amla Â· Kokum Â· Ginger Â· Fennel", copy: "Daily digestive wellness." },
              { title: "Recover+", bar: "#2E6DA4", tag: "Coconut water Â· Amla Â· Lemon",           copy: "Rehydration after activity." },
              { title: "Glow+",    bar: "#7A4E9E", tag: "Amla Â· Pomegranate Â· Vitamin C",         copy: "Antioxidant skin support." },
            ].map(({ title, bar, tag, copy }) => (
              <div key={title} className="flex flex-col rounded-xl border border-rule bg-surface overflow-hidden">
                <div className="h-1.5 w-full shrink-0" style={{ background: bar }} />
                <div className="flex flex-1 flex-col p-5 gap-3">
                  <span className="self-start rounded-full border border-rule bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-ink-soft">Coming later</span>
                  <p className="text-[10px] uppercase tracking-[0.05em] text-ink-soft">{tag}</p>
                  <h4 className="font-expanded text-[16px] font-bold text-ink">{title}</h4>
                  <p className="text-[12.5px] text-ink-soft leading-[1.6]">{copy}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-ink-soft max-w-[560px]">
            Nutraceutical drinks and sachets launch roughly 6â€“12 months after the platform â€” connecting what you track digitally with what you consume physically.
          </p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          09 â€” PRIVACY
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad border-b border-rule">
        <div className="wrap">
          <div className="mb-12 max-w-[540px]">
            <p className="eyebrow mb-3 !text-leaf">Built around trust</p>
            <h2 className="headline text-[clamp(26px,3vw,40px)] text-ink mb-5">
              Your data. Your control.
            </h2>
            <p className="text-[16px] text-ink-soft leading-[1.65]">
              Your wellness information belongs to you. FLUETAS is being designed around privacy, consent and transparent control over how your personal information is used â€” especially for sensitive data like menstrual health and consultation history.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/></svg>, title: "Privacy", body: "Sensitive data â€” including cycle and consultation history â€” is never used without your knowledge." },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round"/></svg>, title: "Consent", body: "You choose what is stored, what experts can see, and how your information is shared." },
              { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 2" strokeLinecap="round"/></svg>, title: "Control", body: "Download, update or delete your data at any time. Your profile is yours, not ours." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-xl border border-rule bg-surface-2 p-7">
                <div className="mb-4">{icon}</div>
                <h3 className="font-expanded text-[15px] font-bold text-ink mb-3">{title}</h3>
                <p className="text-[14px] text-ink-soft leading-[1.6]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          10 â€” FINAL CTA + COUNTDOWN
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="section-pad text-center relative overflow-hidden" id="closing">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 700px 500px at 50% 0%, rgba(46,125,50,0.08), transparent 70%)" }} />
        <div className="wrap relative z-10">
          <p className="eyebrow mb-6 !text-leaf">The platform launches 4 September 2026</p>
          <h2 className="headline mb-5 text-[clamp(36px,5vw,68px)] text-ink">
            Be part of the<br />FLUETAS journey.
          </h2>
          <p className="font-expanded font-semibold text-leaf text-[15px] tracking-[0.03em] mb-10">
            Your Body. Your Data. Your Formula.
          </p>

          <div className="mb-10 flex justify-center">
            <CountdownRow />
          </div>

          <div className="mx-auto max-w-[500px] text-left mb-4">
            <WaitlistForm />
          </div>
          <p className="text-[12px] text-ink-soft">No spam. We&apos;ll only email you when it matters.</p>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="border-t border-rule py-16">
        <div className="wrap">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <a href="/" className="flex items-center gap-2 font-expanded font-bold text-[18px] text-ink mb-3">
                <img
                  src="/assets/image.png"
                  alt="FLUETAS"
                  width={40}
                  height={40}
                  className="rounded-sm"
                 
                />
                FLUETAS
              </a>
              <p className="text-[13px] text-ink-soft max-w-[220px] leading-[1.6]">One platform for training, wellness, AI guidance and expert consultations.</p>
            </div>

            <nav className="flex flex-wrap gap-x-10 gap-y-4">
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Platform</p>
                {["Train", "Her", "AI Coach", "Experts", "Nutrition"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[13px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Company</p>
                {["How it works", "Privacy", "Launch"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[13px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <p className="eyebrow mb-1">Social</p>
                {["Instagram", "Facebook"].map((l) => (
                  <a key={l} href="#" className="text-[13px] text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-8 sm:flex-row sm:justify-between">
            <p className="text-[12px] text-ink-soft">Fitness Â· Wellness Â· Nutrition Â· Experts Â· Technology</p>
            <p className="text-[12px] text-ink-soft">FLUETAS.IN Â· Launching 4 September 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}




