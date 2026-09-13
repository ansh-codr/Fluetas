"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dumbbell,
  Moon,
  Droplets,
  Activity,
  HeartPulse,
  Brain,
  Stethoscope,
  ArrowRight,
  Check,
  Shield,
  Lock,
  Eye,
  Sparkles,
  Zap,
  Target,
  Menu,
  X,
  Star,
} from "lucide-react";

const NutritionProduct3D = dynamic(() => import("../components/NutritionProduct3D"), { ssr: false });

/* ─────────────────────────────────────────
   ANIMATION HELPERS
───────────────────────────────────────── */
function A({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 20 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
  const [t, setT] = useState(() => ({ ...getDiff(), live: false }));
  useEffect(() => {
    const id = setInterval(() => setT(() => ({ ...getDiff(), live: true })), 1000);
    return () => clearInterval(id);
  }, []);
  const units = [
    { v: t.days, l: "Days" }, { v: t.hours, l: "Hrs" },
    { v: t.minutes, l: "Min" }, { v: t.seconds, l: "Sec" },
  ];
  return (
    <div className="flex gap-3 sm:gap-4">
      {units.map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center rounded-2xl border border-rule bg-card px-4 sm:px-5 py-3 sm:py-4 min-w-[64px] sm:min-w-[80px] shadow-xs">
          <span className="tabular text-[2rem] sm:text-[2.5rem] font-heading font-bold leading-none text-ink" suppressHydrationWarning>
            {t.live ? String(v).padStart(2, "0") : "--"}
          </span>
          <span className="mt-2 eyebrow !text-[9px]">{l}</span>
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
    <div className="flex items-center gap-3 rounded-2xl bg-leaf/5 border border-leaf/20 p-4" role="status">
      <div className="h-8 w-8 rounded-full bg-leaf flex items-center justify-center shrink-0">
        <Check size={16} className="text-white" />
      </div>
      <p className="text-[15px] text-ink">
        You&apos;re on the list — we&apos;ll email <span className="font-semibold">{email}</span> before September 4.
      </p>
    </div>
  );
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setDone(true); }} className="flex w-full flex-col gap-3 sm:flex-row">
      <label htmlFor={id} className="sr-only">Email address</label>
      <input id={id} type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="input-field flex-1 h-[52px]"
      />
      <button type="submit" className="btn-leaf h-[52px] px-8 text-[15px] whitespace-nowrap">
        Notify me
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navLinks = [
    { href: "#train", label: "Train" },
    { href: "#her", label: "Her" },
    { href: "#ai", label: "AI" },
    { href: "#experts", label: "Experts" },
    { href: "#record", label: "Record" },
    { href: "#nutrition", label: "Nutrition" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-surface/80 backdrop-blur-xl border-b border-rule shadow-xs"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="wrap flex h-[68px] items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
            <img src="/assets/image.png" alt="FLUETAS" width={32} height={32} className="transition-transform group-hover:scale-105" />
            <span className="brand text-[17px] text-ink">FLUETAS</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-[13px] font-medium text-ink-soft hover:text-ink rounded-lg hover:bg-surface-2 transition-all uppercase tracking-[0.04em]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/feedback"
              className="px-3.5 py-2 text-[13px] font-medium text-leaf hover:text-leaf-hi rounded-lg hover:bg-leaf-dim transition-all uppercase tracking-[0.04em]"
            >
              Feedback
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex btn-primary text-[13px] px-5 py-2.5"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-[280px] bg-card border-l border-rule shadow-xl p-6 pt-20"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-ink-soft hover:text-ink hover:bg-surface-2 rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/feedback"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-[15px] font-medium text-leaf hover:bg-leaf-dim rounded-xl transition-all"
              >
                Feedback
              </Link>
            </nav>
            <div className="mt-6 pt-6 border-t border-rule">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary w-full text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
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
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--rule)" strokeWidth="5" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s var(--ease-fluetas)" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-[12px] font-bold text-ink leading-none">{value ?? `${pct}%`}</span>
        </div>
      </div>
      <span className="eyebrow !text-[8px] !tracking-[0.06em]">{label}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   01 — HERO
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
    <div className="relative w-full max-w-[360px] mx-auto lg:mx-0 lg:ml-auto select-none">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Phone frame */}
        <div className="rounded-[36px] border-[3px] border-[#1a1f18] bg-[#12160F] shadow-[0_40px_120px_rgba(18,22,15,0.3)] overflow-hidden">
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
                <p className="text-[11px] text-[#8e998a] font-medium">Good morning,</p>
                <p className="brand text-[16px] text-[#FAFAF6]">ANYA</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-leaf-hi" style={{ boxShadow: "0 0 0 4px rgba(61,154,66,0.2)" }} />
                <span className="text-[10px] text-leaf-hi font-semibold">Day 14</span>
              </div>
            </div>
          </div>

          {/* Today card */}
          <div className="px-5 pb-5 bg-[#0d1210] space-y-3">
            {/* Wellness rings */}
            <div className="rounded-2xl bg-[#161d19] border border-[#2a3028] p-4">
              <p className="eyebrow !text-[#8e998a] !text-[9px] mb-3">Today&apos;s wellness</p>
              <div className="flex justify-between items-center">
                <Ring pct={82} color="var(--leaf)"   label="Training" size={62} />
                <Ring pct={76} color="var(--ember)"  label="Recovery" size={62} />
                <Ring pct={91} color="var(--tide)"   label="Sleep" size={62} value="7h42" />
                <Ring pct={68} color="var(--violet)" label="Hydration" size={62} />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-[#161d19] border border-[#2a3028] p-3.5">
                <p className="text-[10px] text-[#8e998a] font-semibold uppercase tracking-wide mb-1">Cycle</p>
                <p className="text-[20px] font-bold text-[#FAFAF6] leading-none">Day 14</p>
                <p className="text-[10px] text-rose font-medium mt-1">Ovulatory ↑ Energy</p>
              </div>
              <div className="rounded-xl bg-[#161d19] border border-[#2a3028] p-3.5">
                <p className="text-[10px] text-[#8e998a] font-semibold uppercase tracking-wide mb-1">Calories</p>
                <p className="text-[20px] font-bold text-[#FAFAF6] leading-none">1,840</p>
                <p className="text-[10px] text-leaf font-medium mt-1">of 2,100 goal</p>
              </div>
            </div>

            {/* AI nudge */}
            <div className="rounded-xl bg-[#1a2b1c] border border-leaf/15 p-3.5 flex gap-3">
              <div className="h-7 w-7 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={13} className="text-leaf-hi" />
              </div>
              <p className="text-[12px] text-[#d3dbcf] leading-snug">
                Your peak training window is now. Recovery at 76% — push hard, then rest well tonight.
              </p>
            </div>

            {/* CTA */}
            <button className="w-full rounded-xl bg-leaf py-3.5 text-[13px] font-bold text-white tracking-wide uppercase hover:bg-leaf-hi transition-colors">
              Start Chest + Biceps
            </button>
          </div>
        </div>
      </motion.div>

      {/* Decorative ambient glow */}
      <div aria-hidden className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-64 h-28 rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(ellipse, rgba(42,125,48,0.5), transparent 70%)" }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   02 — ONE RECORD CONVERGING CARDS
───────────────────────────────────────── */
function OneRecordSection() {
  const cards = [
    { icon: <Dumbbell size={14} />, label: "TRAINING", val: "4 workouts", sub: "This week",  x: "-38%", y: "-38%", rot: "-8deg",  color: "var(--leaf)" },
    { icon: <Moon size={14} />, label: "SLEEP",    val: "7h 42m",     sub: "Last night", x: "32%",  y: "-35%", rot: "5deg",   color: "var(--violet)" },
    { icon: <HeartPulse size={14} />, label: "CYCLE",    val: "Day 14",     sub: "Ovulatory",  x: "-40%", y: "12%",  rot: "-5deg",  color: "var(--rose)" },
    { icon: <Brain size={14} />, label: "AI CHAT", val: "3 insights", sub: "Today",      x: "34%",  y: "15%",  rot: "7deg",   color: "var(--leaf)" },
    { icon: <Stethoscope size={14} />, label: "EXPERT", val: "Consult",   sub: "Aug 28",     x: "20%",  y: "48%",  rot: "4deg",   color: "var(--tide)" },
  ];

  return (
    <section className="py-24 sm:py-32 border-b border-rule bg-surface-2 overflow-hidden">
      <div className="wrap">
        <div className="text-center mb-16 sm:mb-20 max-w-[680px] mx-auto">
          <A>
            <span className="eyebrow mb-4 inline-flex items-center gap-1.5 text-leaf">
              <Target size={12} />
              Unified Health Record
            </span>
          </A>
          <A delay={0.1}>
            <h2 className="section-heading text-[clamp(2rem,4.5vw,3.5rem)] text-ink mb-5">
              Your health lives in<br /><span className="text-leaf">five different apps.</span>
            </h2>
          </A>
          <A delay={0.2}>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              FLUETAS puts it all in one record — so your AI, your experts, and you are always looking at the same picture.
            </p>
          </A>
        </div>

        {/* Visual: scattered → unified */}
        <div className="relative max-w-[900px] mx-auto h-[320px] sm:h-[380px] flex items-center justify-center">
          {cards.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="absolute w-[140px] sm:w-[160px] rounded-2xl border border-rule bg-card shadow-md p-3.5 sm:p-4"
              style={{ left: `calc(50% + ${c.x})`, top: `calc(50% + ${c.y})`, transform: `translate(-50%, -50%) rotate(${c.rot})` }}
            >
              <p className="eyebrow mb-2 flex items-center gap-1.5 !text-[9px]">
                <span style={{ color: c.color }}>{c.icon}</span>
                {c.label}
              </p>
              <p className="text-[16px] sm:text-[17px] font-bold text-ink leading-none mb-0.5">{c.val}</p>
              <p className="text-[11px] text-ink-soft">{c.sub}</p>
            </motion.div>
          ))}

          {/* Connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" aria-hidden>
            <line x1="25%" y1="20%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="75%" y1="20%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="20%" y1="65%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="78%" y1="65%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 5" />
            <line x1="40%" y1="85%" x2="50%" y2="50%" stroke="var(--rule-strong)" strokeWidth="1" strokeDasharray="4 5" />
          </svg>

          {/* Center: Unified Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[180px] sm:w-[200px] rounded-3xl bg-ink border-2 border-leaf/30 overflow-hidden"
            style={{ boxShadow: "0 0 0 8px rgba(42,125,48,0.06), 0 32px 80px rgba(18,22,15,0.3)" }}
          >
            <div className="bg-[#161d19] px-5 py-3.5 border-b border-[#2a3028]">
              <p className="brand text-[10px] text-[#8e998a]">FLUETAS PROFILE</p>
              <p className="text-[15px] font-bold text-white mt-0.5">Anya K.</p>
            </div>
            <div className="px-5 py-4 space-y-2.5">
              {[
                { l: "Training", pct: 82, c: "var(--leaf)" },
                { l: "Recovery", pct: 76, c: "var(--ember)" },
                { l: "Sleep",    pct: 91, c: "var(--tide)" },
              ].map(b => (
                <div key={b.l}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-[#8e998a] font-medium uppercase tracking-wide">{b.l}</span>
                    <span className="text-white font-bold">{b.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#2a3028]">
                    <div className="h-full rounded-full" style={{ width: `${b.pct}%`, background: b.c }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[#2a3028]">
                <p className="text-[10px] font-bold text-leaf-hi">Wellness Score: 84</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   03 — TRAIN SECTION
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8 max-w-[1060px] mx-auto items-start">
      {/* Workout card */}
      <div className="rounded-[24px] border border-rule bg-card shadow-lg overflow-hidden">
        <div className="bg-ink px-6 sm:px-8 py-6 sm:py-7">
          <div className="flex items-center justify-between mb-1">
            <p className="eyebrow !text-[#8e998a] !text-[9px]">TODAY&apos;S SESSION</p>
            <span className="badge badge-leaf !text-[10px]">Day 3 of 4</span>
          </div>
          <h3 className="headline text-[2rem] sm:text-[2.2rem] text-white mt-1">CHEST +<br />BICEPS</h3>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[12px] text-[#8e998a]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              ~50 min
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#8e998a]">
              <Dumbbell size={13} />
              5 exercises
            </span>
          </div>
        </div>

        <div className="divide-y divide-rule">
          {exercises.map((ex, i) => (
            <div key={ex.n} className={`flex items-center gap-4 px-6 sm:px-8 py-4 ${i === 0 ? "bg-leaf/5" : ""}`}>
              <span className="text-[12px] font-bold text-ink-subtle w-5 shrink-0">{ex.n}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] sm:text-[15px] font-semibold text-ink truncate">{ex.name}</p>
                <p className="text-[12px] text-ink-soft mt-0.5">{ex.sets} · {ex.reps}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-ink-subtle">Last</p>
                <p className="text-[13px] font-bold text-ink">{ex.last}</p>
              </div>
              {i === 0 && (
                <div className="h-2 w-2 rounded-full bg-leaf-hi shrink-0" style={{ boxShadow: "0 0 0 3px rgba(61,154,66,0.2)" }} />
              )}
            </div>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          <button className="btn-leaf w-full py-4 text-[13px] font-bold uppercase tracking-widest">
            Begin Workout
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-5">
        {/* Weekly volume chart */}
        <div className="rounded-[20px] border border-rule bg-card p-5 sm:p-6 shadow-xs">
          <p className="eyebrow mb-4">Weekly volume</p>
          <div className="flex items-end gap-2 h-[80px]">
            {bars.map(({ d, h, active }, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-md transition-all" style={{
                  height: `${h}%`,
                  background: active ? "var(--leaf)" : "var(--rule)",
                  minHeight: 4,
                  boxShadow: active ? "0 4px 12px rgba(42,125,48,0.25)" : "none"
                }} />
                <span className={`text-[10px] font-semibold ${active ? "text-leaf" : "text-ink-subtle"}`}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal bests */}
        <div className="rounded-[20px] border border-rule bg-card p-5 sm:p-6 shadow-xs">
          <p className="eyebrow mb-3.5">Personal bests</p>
          <div className="space-y-3">
            {[
              { ex: "Bench Press", pb: "100 kg", date: "Aug 14" },
              { ex: "Incline Press", pb: "30 kg", date: "Aug 21" },
              { ex: "Dumbbell Curl", pb: "18 kg", date: "Jul 30" },
            ].map(p => (
              <div key={p.ex} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{p.ex}</p>
                  <p className="text-[11px] text-ink-subtle">{p.date}</p>
                </div>
                <span className="text-[16px] font-bold text-ink tabular">{p.pb}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI recommendation */}
        <div className="rounded-[20px] border border-leaf/15 bg-leaf/5 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles size={13} className="text-leaf" />
            <span className="eyebrow !text-leaf !text-[9px]">AI Coach</span>
          </div>
          <p className="text-[13px] text-ink leading-relaxed">
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
    <div className="max-w-[960px] mx-auto space-y-6">
      {/* Main tracker card */}
      <div className="rounded-[24px] border border-rule bg-card shadow-lg overflow-hidden">
        <div className="px-6 sm:px-8 py-6 sm:py-8 border-b border-rule flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="eyebrow mb-1.5 !text-rose inline-flex items-center gap-1.5">
              <HeartPulse size={12} />
              FLUETAS HER
            </span>
            <h3 className="section-heading text-[1.75rem] sm:text-[2rem] text-ink">Cycle Tracker</h3>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-rose/15 bg-rose/5 px-5 py-3.5">
            <div>
              <p className="text-[11px] font-semibold text-rose uppercase tracking-wide">Current Phase</p>
              <p className="text-[18px] font-bold text-ink">Ovulatory</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink-subtle">Day</p>
              <p className="tabular text-[2.2rem] font-bold text-rose leading-none">14</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 sm:py-8">
          <p className="eyebrow mb-4">This cycle</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {days.map(day => {
              const color = getColor(day);
              const isToday = day === today;
              const isPast = day < today;
              return (
                <div
                  key={day}
                  className={`relative h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all ${isToday ? "ring-2 ring-offset-1 ring-rose scale-110" : ""}`}
                  style={{
                    background: isPast || isToday ? color : "var(--surface-2)",
                    color: isPast || isToday ? "white" : "var(--ink-subtle)",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-5">
            {phases.map(p => (
              <div key={p.label} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                <span className="text-[11px] text-ink-soft font-medium">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "ENERGY",   val: "High",   icon: <Zap size={18} />, color: "var(--leaf)",   note: "↑ Peak window" },
          { label: "MOOD",     val: "Great",  icon: <Star size={18} />, color: "var(--violet)", note: "Stable" },
          { label: "SYMPTOMS", val: "None",   icon: <Check size={18} />, color: "var(--tide)",   note: "Clear" },
          { label: "LIBIDO",   val: "High",   icon: <HeartPulse size={18} />, color: "var(--rose)",   note: "Ovulatory peak" },
        ].map(m => (
          <div key={m.label} className="rounded-2xl border border-rule bg-card p-5 text-center shadow-xs">
            <div className="flex justify-center mb-2" style={{ color: m.color }}>{m.icon}</div>
            <p className="eyebrow mb-1">{m.label}</p>
            <p className="text-[18px] font-bold text-ink mb-1">{m.val}</p>
            <p className="text-[10px] font-semibold rounded-full px-2 py-0.5 inline-block" style={{ color: m.color, background: `${m.color}10` }}>{m.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   05 — AI CHAT
───────────────────────────────────────── */
function AIChatUI() {
  const [activeChat, setActiveChat] = useState(0);

  const chats = [
    {
      prompt: "I've been sleeping poorly but training more. Should I push through my leg session today?",
      replies: [
        { type: "data" as const, content: "Over the last 3 days, your sleep dropped 18% while your training strain increased 22%." },
        { type: "text" as const, content: "I'd suggest skipping heavy legs today and doing active recovery or mobility instead. Your muscles are adapting but your nervous system needs a break." },
        { type: "action" as const, content: "Switch to: 30-min mobility flow →" },
      ],
      disclaimer: "Not a medical diagnosis — consult a professional for health concerns."
    },
    {
      prompt: "What should I train today?",
      replies: [
        { type: "data" as const, content: "Training readiness: 82% · Recovery: 76% · Last session: Chest + Biceps (yesterday)" },
        { type: "text" as const, content: "Today is optimal for Back + Shoulders. Your posterior chain has had 48h rest — your strongest lifting window." },
        { type: "action" as const, content: "Load Back + Shoulders →" },
      ],
      disclaimer: "Based on your tracked recovery metrics."
    },
    {
      prompt: "How can I improve my recovery score?",
      replies: [
        { type: "data" as const, content: "Current recovery: 76% · Sleep quality: 91% · Hydration: 68% (low)" },
        { type: "text" as const, content: "Your sleep is excellent — the main drag on recovery is hydration. Add 500ml before your session and a 15-min post-workout stretch." },
        { type: "action" as const, content: "View Recovery Plan →" },
      ],
      disclaimer: "Personalised advice. Verify nutrition guidance with your dietitian."
    }
  ];

  const current = chats[activeChat];

  return (
    <div className="w-full max-w-[960px] mx-auto">
      <div className="rounded-[24px] border border-[#2a3028] bg-[#0d1210] overflow-hidden shadow-2xl flex flex-col">
        {/* App bar */}
        <div className="flex items-center gap-3 sm:gap-4 border-b border-[#2a3028] px-5 sm:px-7 py-4 bg-[#0d1210]">
          <div className="h-9 w-9 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center">
            <Brain size={16} className="text-leaf-hi" />
          </div>
          <div>
            <p className="brand text-[13px] sm:text-[14px] text-white">FLUETAS AI</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-leaf-hi" />
              <p className="text-[10px] text-[#8e998a]">Connected to your profile</p>
            </div>
          </div>
          <div className="ml-auto text-right hidden sm:block">
            <p className="text-[10px] text-[#8e998a]">Powered by FLUETAS-approved knowledge</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 sm:p-7 md:p-8 space-y-5 flex-1">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#2a3028] flex items-center justify-center text-[10px] font-bold text-[#8e998a]">A</div>
              <span className="text-[10px] text-[#8e998a] font-semibold uppercase tracking-wide">Anya</span>
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#1e2a21] border border-[#2a3028] px-4 py-3">
              <p className="text-[14px] sm:text-[15px] text-white leading-relaxed">{current.prompt}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-leaf/10 border border-leaf/20 flex items-center justify-center">
                <Sparkles size={12} className="text-leaf-hi" />
              </div>
              <span className="text-[10px] text-leaf-hi font-semibold uppercase tracking-wide">FLUETAS AI</span>
            </div>
            <div className="max-w-[85%] space-y-2.5">
              {current.replies.map((r, i) => (
                r.type === "data" ? (
                  <div key={i} className="rounded-xl bg-[#161d19] border border-[#2a3028] px-4 py-2.5">
                    <p className="text-[12px] text-[#8e998a] font-mono">{r.content}</p>
                  </div>
                ) : r.type === "action" ? (
                  <button key={i} className="flex items-center gap-2 rounded-xl border border-leaf/25 bg-leaf/10 px-4 py-2.5 text-[13px] text-leaf-hi font-semibold hover:bg-leaf/15 transition-colors cursor-pointer">
                    {r.content}
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <div key={i} className="rounded-2xl rounded-tl-sm border border-[#2a3028] bg-[#0d1210] px-4 py-3">
                    <p className="text-[14px] sm:text-[15px] text-[#d3dbcf] leading-relaxed">{r.content}</p>
                  </div>
                )
              ))}
              <p className="text-[10px] text-[#8e998a] italic pl-2">{current.disclaimer}</p>
            </div>
          </div>
        </div>

        {/* Bottom: suggested prompts + input */}
        <div className="border-t border-[#2a3028] px-5 sm:px-7 pb-5 sm:pb-6 pt-4 space-y-3 bg-[#0a0f0c]">
          <div className="flex flex-wrap gap-2">
            {chats.map((c, i) => i !== activeChat && (
              <button key={i} onClick={() => setActiveChat(i)}
                className="rounded-full border border-[#2a3028] bg-[#161d19] px-3 py-1.5 text-[11px] text-[#8e998a] hover:text-white hover:bg-[#1e2621] transition-colors text-left max-w-[260px] truncate cursor-pointer">
                &ldquo;{c.prompt}&rdquo;
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-[#3f4a3c] bg-[#161d19] px-4 py-3">
            <span className="flex-1 text-[14px] text-[#4a5548]">Ask anything about your health...</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-leaf">
              <ArrowRight size={14} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   06 — EXPERTS
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {experts.map((e, i) => (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="rounded-[20px] border border-rule bg-card shadow-xs overflow-hidden flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-md"
          >
            <div className="h-[140px] relative overflow-hidden flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${e.color}12, ${e.color}05)` }}>
              <div className="h-16 w-16 rounded-full border-3 border-card shadow-md flex items-center justify-center text-[22px] font-bold" style={{ background: `${e.color}15`, color: e.color }}>
                {e.initials}
              </div>
              <div className="absolute top-3 right-3">
                <span className="badge bg-card/90 backdrop-blur-sm text-ink-soft !text-[10px] shadow-xs">{e.exp}</span>
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: e.color }}>{e.role}</p>
              <h3 className="font-heading text-[15px] font-bold text-ink mb-1">{e.name}</h3>
              <p className="text-[12px] text-ink-soft mb-2.5">{e.speciality}</p>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Star size={13} className="text-amber-500 fill-amber-500" />
                <span className="text-[13px] font-bold text-ink">{e.rating}</span>
                <span className="text-[11px] text-ink-subtle">({e.reviews})</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 mb-4">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[11px] font-semibold text-ink">{e.slots}</span>
              </div>
              <button className="mt-auto w-full rounded-xl border border-rule py-2.5 text-[12px] font-bold text-ink hover:border-ink-subtle hover:bg-surface-2 transition-all uppercase tracking-wide cursor-pointer">
                View Profile
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Testimonials marquee */}
      <div className="w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
        <div className="flex w-max animate-marquee items-center gap-5">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {[
                { text: "FLUETAS gives me the context I've always been missing before a consultation.", author: "Dr. Sarah Jenkins", role: "Physiotherapist" },
                { text: "Finally, a platform that understands that cycle data and training aren't separate.", author: "Dr. Elena Rostova", role: "Gynecologist" },
                { text: "I can adjust a client's macros based on their actual recovery data, not guesswork.", author: "Marcus Thorne", role: "Sports Nutritionist" },
                { text: "The first tool that brings sleep, strain, and my programming into one view.", author: "David Chen", role: "Performance Coach" },
                { text: "I don't have to explain my whole history every time I see a new specialist.", author: "Anya K.", role: "FLUETAS Athlete" },
              ].map((r, j) => (
                <div key={`${i}-${j}`} className="flex w-[360px] shrink-0 flex-col rounded-[18px] border border-rule bg-card p-6 shadow-xs">
                  <p className="mb-4 text-[14px] italic text-ink leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                  <div className="mt-auto flex items-center gap-3 border-t border-rule pt-4">
                    <div className="h-9 w-9 rounded-full bg-surface-2 shrink-0 flex items-center justify-center text-[12px] font-bold text-ink-subtle border border-rule">{r.author.charAt(0)}</div>
                    <div>
                      <p className="text-[13px] font-bold text-ink">{r.author}</p>
                      <p className="eyebrow !text-[9px]">{r.role}</p>
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
   07 — HEALTH RECORD
───────────────────────────────────────── */
function HealthRecordCard() {
  const metrics = [
    { label: "Training",  pct: 82, color: "var(--leaf)" },
    { label: "Recovery",  pct: 76, color: "var(--ember)" },
    { label: "Sleep",     pct: 91, color: "var(--tide)" },
    { label: "Nutrition", pct: 64, color: "var(--violet)" },
  ];

  const log = [
    { icon: <Dumbbell size={16} />, title: "Chest + Biceps workout logged",  time: "Today, 9:15am",   color: "text-leaf" },
    { icon: <HeartPulse size={16} />, title: "Cycle log updated — Day 14",     time: "Today, 8:00am",   color: "text-rose" },
    { icon: <Brain size={16} />, title: "AI conversation: recovery advice", time: "Yesterday",     color: "text-violet" },
    { icon: <Stethoscope size={16} />, title: "Dr. Elena Rostova consultation",  time: "Aug 28",      color: "text-ember" },
    { icon: <Activity size={16} />, title: "Blood report uploaded",          time: "Aug 25",          color: "text-tide" },
  ];

  return (
    <div className="max-w-[920px] mx-auto rounded-[24px] border border-rule bg-card shadow-lg overflow-hidden">
      {/* Profile header */}
      <div className="flex items-center justify-between flex-wrap gap-4 sm:gap-6 px-6 sm:px-8 py-6 sm:py-8 bg-surface-2 border-b border-rule">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-ink flex items-center justify-center text-[20px] font-bold text-surface border-3 border-surface shadow-sm">A</div>
          <div>
            <h3 className="brand text-[17px] sm:text-[18px] text-ink">ANYA KAPOOR</h3>
            <p className="text-[12px] sm:text-[13px] text-ink-soft">Active since August 2026 · Mumbai, India</p>
            <div className="flex gap-1.5 mt-1.5">
              <span className="badge badge-leaf">FLUETAS MEMBER</span>
              <span className="badge bg-surface text-ink-soft border border-rule">PREMIUM</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="text-center rounded-2xl bg-card border border-rule px-4 sm:px-5 py-3 sm:py-4 shadow-xs">
            <p className="eyebrow mb-1">Wellness</p>
            <p className="tabular text-[2.2rem] sm:text-[2.5rem] font-bold text-leaf leading-none">84</p>
          </div>
          <div className="text-center rounded-2xl bg-card border border-rule px-4 sm:px-5 py-3 sm:py-4 shadow-xs">
            <p className="eyebrow mb-1">Streak</p>
            <p className="tabular text-[2.2rem] sm:text-[2.5rem] font-bold text-ink leading-none">14<span className="text-[1rem] text-ink-subtle">d</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] divide-y md:divide-y-0 md:divide-x divide-rule">
        <div className="p-6 sm:p-8 space-y-5">
          <p className="eyebrow mb-1">Health metrics</p>
          {metrics.map(m => (
            <div key={m.label}>
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-[12px] font-bold text-ink tracking-wider uppercase">{m.label}</span>
                <span className="tabular text-[17px] font-bold text-ink leading-none">{m.pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-surface-2 overflow-hidden border border-rule/50">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8 bg-surface-2">
          <p className="eyebrow mb-5">Recent entries</p>
          <div className="space-y-4">
            {log.map((ev, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-rule mt-0.5" style={{ color: `var(--${ev.color.replace("text-", "")})` }}>
                  {ev.icon}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink leading-tight">{ev.title}</p>
                  <p className={`text-[11px] font-medium mt-0.5 ${ev.color}`}>{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-xl border border-rule py-2.5 text-[12px] font-bold text-ink hover:border-ink-subtle hover:bg-card transition-all uppercase tracking-wide cursor-pointer">
            View Full Record
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
      <Navbar />

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[calc(100vh-68px)] flex items-center pt-[68px]">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 800px 600px at 80% 50%, rgba(42,125,48,0.05) 0%, transparent 65%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: "radial-gradient(var(--ink) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="wrap py-12 sm:py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 gap-12 lg:gap-16 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <A>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-leaf/20 bg-leaf-dim px-4 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf-hi animate-pulse-soft" />
                  <span className="eyebrow !text-leaf !text-[9px] tracking-[0.1em]">LAUNCHING 4 SEPTEMBER 2026</span>
                </div>
              </A>

              <A delay={0.1}>
                <h1 className="headline text-[clamp(2.8rem,5.5vw,5.2rem)] text-ink mb-5 leading-[0.93]">
                  YOUR BODY.<br />
                  YOUR DATA.<br />
                  <span className="text-leaf">YOUR FORMULA.</span>
                </h1>
              </A>

              <A delay={0.2}>
                <p className="mb-8 max-w-[460px] text-[16px] sm:text-[17px] leading-[1.65] text-ink-soft">
                  One platform for training, women&apos;s wellness, AI guidance, expert consultations and personalized nutrition — all in a single health record.
                </p>
              </A>

              <A delay={0.3}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/login" className="btn-primary px-7 py-3.5 text-[14px]">
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                  <a href="#platform" className="btn-ghost px-7 py-3.5 text-[14px]">
                    See how it works
                  </a>
                </div>
              </A>
            </div>

            <div id="platform">
              <HeroAppCard />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          ONE RECORD
      ══════════════════════════════════ */}
      <OneRecordSection />

      {/* ══════════════════════════════════
          STATEMENT 1
      ══════════════════════════════════ */}
      <section className="bg-ink py-28 sm:py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <A>
            <h2 className="headline text-[clamp(2.5rem,6.5vw,6rem)] text-white">
              ONE BODY.<br/>
              MANY SIGNALS.<br/>
              <span className="text-leaf-hi">ONE RECORD.</span>
            </h2>
          </A>
        </div>
      </section>

      {/* ══════════════════════════════════
          TRAIN
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule" id="train">
        <div className="wrap">
          <div className="text-center mb-14 max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-leaf">
                <Dumbbell size={12} />
                FLUETAS Train
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,3.5rem)] text-ink mb-4">
                Train with purpose.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                Structured workouts built around progression — with your recovery data baked in, so every session is the right session.
              </p>
            </A>
          </div>
          <WorkoutScreen />
        </div>
      </section>

      {/* ══════════════════════════════════
          HER
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule bg-surface-2" id="her">
        <div className="wrap">
          <div className="text-center mb-14 max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-rose">
                <HeartPulse size={12} />
                FLUETAS Her
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,3.5rem)] text-ink mb-4">
                Understand your cycle.<br />Understand yourself.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                Your cycle shapes your energy, your mood and your training window. Her tracks it all and connects it to the rest of your FLUETAS profile.
              </p>
            </A>
          </div>
          <CycleTrackerUI />
        </div>
      </section>

      {/* ══════════════════════════════════
          AI
      ══════════════════════════════════ */}
      <section className="bg-[#0d1210] py-24 sm:py-32 border-b border-[#2a3028]" id="ai">
        <div className="wrap">
          <div className="text-center mb-14 max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-violet">
                <Brain size={12} />
                FLUETAS AI
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,4rem)] text-white mb-4">
                Ask FLUETAS AI anything.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-[#8a9482] leading-relaxed">
                An AI coach powered by FLUETAS-approved knowledge — and trained on your actual data, not generic advice.
              </p>
            </A>
          </div>
          <AIChatUI />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 2
      ══════════════════════════════════ */}
      <section className="bg-ink py-28 sm:py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <A>
            <h2 className="headline text-[clamp(2.5rem,5.5vw,5.5rem)] text-white">
              AI WHEN YOU NEED ANSWERS.<br/>
              <span className="text-ember">EXPERTS WHEN YOU NEED PEOPLE.</span>
            </h2>
          </A>
        </div>
      </section>

      {/* ══════════════════════════════════
          EXPERTS
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule bg-surface-2" id="experts">
        <div className="wrap">
          <div className="text-center mb-14 max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-ember">
                <Stethoscope size={12} />
                FLUETAS Experts
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,3.5rem)] text-ink mb-4">
                Human expertise when you need it.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                Book consultations directly through FLUETAS. Your profile is already in their hands before you speak.
              </p>
            </A>
          </div>
          <ExpertsDirectory />
        </div>
      </section>

      {/* ══════════════════════════════════
          HEALTH RECORD
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule bg-surface relative overflow-hidden" id="record">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
          <div className="w-[1100px] h-[1100px] rounded-full border border-ink" />
          <div className="absolute w-[700px] h-[700px] rounded-full border border-ink" />
        </div>

        <div className="wrap relative z-10">
          <div className="text-center mb-14 max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-leaf">
                <Shield size={12} />
                The Centerpiece
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,4rem)] text-ink mb-4">
                Your record builds itself.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[17px] sm:text-[18px] text-ink-soft leading-relaxed">
                Every session, every conversation, every consultation feeds into the most complete picture of your body you&apos;ve ever had.
              </p>
            </A>
          </div>
          <HealthRecordCard />
        </div>
      </section>

      {/* ══════════════════════════════════
          STATEMENT 3
      ══════════════════════════════════ */}
      <section className="bg-ink py-28 sm:py-36 border-b border-[#2a3028]">
        <div className="wrap text-center">
          <A>
            <h2 className="headline text-[clamp(2.5rem,6.5vw,6.5rem)] text-white">
              YOUR DATA<br/>
              <span className="text-tide">DOESN&apos;T RESET.</span>
            </h2>
          </A>
        </div>
      </section>

      {/* ══════════════════════════════════
          NUTRITION
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule bg-surface-2" id="nutrition">
        <div className="wrap">
          <div className="text-center mb-16 max-w-[660px] mx-auto">
            <A>
              <div className="flex items-center justify-center gap-2.5 mb-3">
                <span className="eyebrow text-leaf inline-flex items-center gap-1.5">
                  <Droplets size={12} />
                  FLUETAS Nutrition
                </span>
                <span className="badge bg-surface border border-rule text-ink-soft">Coming soon</span>
              </div>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4.5vw,3.5rem)] text-ink mb-4">
                Nutrition connected to your journey.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                What you track digitally becomes what you consume physically.
              </p>
            </A>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
            {[
              { title: "Athlete+", color: "#D45A20", desc: "Beetroot · Electrolytes · B12" },
              { title: "Gut+",     color: "#2A7D30", desc: "Bael · Amla · Kokum · Ginger" },
              { title: "Recover+", color: "#2565A0", desc: "Coconut water · Amla · Lemon" },
            ].map(({ title, color, desc }) => (
              <div key={title} className="flex flex-col items-center group">
                <div className="w-full h-[380px] sm:h-[420px] rounded-[24px] bg-card border border-rule shadow-md overflow-hidden mb-5 group-hover:-translate-y-1.5 transition-transform duration-500">
                  <NutritionProduct3D color={color} />
                </div>
                <h3 className="section-heading text-[20px] sm:text-[22px] text-ink mb-1.5">{title}</h3>
                <p className="text-[12px] text-ink-subtle uppercase tracking-widest text-center">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          PRIVACY
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule">
        <div className="wrap">
          <div className="mb-14 text-center max-w-[660px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-leaf">
                <Lock size={12} />
                Built around trust
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4vw,3.2rem)] text-ink mb-4">
                Your data. Your control.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                Your profile is yours, not ours. You control what is stored, what experts can see, and how your information is shared.
              </p>
            </A>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: <Eye size={22} />, title: "Privacy", body: "Sensitive data — including cycle and consultation history — is never used without your knowledge." },
              { icon: <Check size={22} />, title: "Consent", body: "You choose what is stored, what experts can see, and how your information is shared." },
              { icon: <Shield size={22} />, title: "Control", body: "Download, update or delete your data at any time. The keys stay with you." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-[20px] border border-rule bg-surface-2 p-8 sm:p-9 text-center shadow-xs hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-leaf-dim text-leaf mb-4">
                  {icon}
                </div>
                <h3 className="section-heading text-[19px] text-ink mb-3">{title}</h3>
                <p className="text-[14px] sm:text-[15px] text-ink-soft leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          COMMUNITY VOICES
      ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 border-b border-rule bg-surface-2" id="feedback">
        <div className="wrap">
          <div className="mb-14 text-center max-w-[680px] mx-auto">
            <A>
              <span className="eyebrow mb-3 inline-flex items-center gap-1.5 text-leaf">
                <Star size={12} />
                Community Voices
              </span>
            </A>
            <A delay={0.1}>
              <h2 className="section-heading text-[clamp(2rem,4vw,3.2rem)] text-ink mb-4">
                Built with our athletes &amp; practitioners.
              </h2>
            </A>
            <A delay={0.2}>
              <p className="text-[16px] sm:text-[17px] text-ink-soft leading-relaxed">
                Real perspectives from individuals transforming how they track human health, training, and holistic recovery.
              </p>
            </A>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 mb-10">
            {[
              {
                name: "Aarav Sharma",
                role: "Marathon Runner & Athlete",
                rating: 5,
                title: "The continuous health record is a game-changer",
                quote: "Having my workout metrics, recovery sleep, and clinical notes in one single unified timeline has completely changed how I train with my physio.",
                tag: "Workout Tracking",
              },
              {
                name: "Dr. Priya Desai",
                role: "Functional Medicine Specialist",
                rating: 5,
                title: "Seamless patient-consent clinical architecture",
                quote: "The granular consent controls give patients complete confidence. Reviewing real-time biomarkers before our telehealth sessions saves 20 minutes per consultation.",
                tag: "Clinical Care",
              },
              {
                name: "Meera Nambiar",
                role: "Triathlete & Product Lead",
                rating: 5,
                title: "Fluetas Her cycle pacing is incredible",
                quote: "Training phase adjustments tailored to hormonal rhythm have eliminated overtraining fatigue during peak training blocks.",
                tag: "Fluetas Her",
              },
            ].map((rev) => (
              <div key={rev.name} className="rounded-[20px] border border-rule bg-card p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} className="text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                  <h3 className="font-heading text-[16px] font-bold text-ink mb-2.5 leading-snug">
                    &ldquo;{rev.title}&rdquo;
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-ink-soft leading-relaxed mb-5">
                    {rev.quote}
                  </p>
                </div>
                <div className="pt-4 border-t border-rule flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-bold text-ink">{rev.name}</p>
                    <p className="text-[11px] text-ink-subtle">{rev.role}</p>
                  </div>
                  <span className="badge badge-leaf">{rev.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/feedback"
              className="inline-flex items-center gap-2 btn-primary"
            >
              Explore Community Feedback
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FINAL CTA
      ══════════════════════════════════ */}
      <section className="py-32 sm:py-40 text-center relative overflow-hidden" id="closing">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 900px 500px at 50% 0%, rgba(42,125,48,0.05), transparent 70%)" }} />
        <div className="wrap relative z-10">
          <A>
            <span className="eyebrow mb-6 inline-flex items-center gap-1.5 text-leaf !text-[11px]">
              <Sparkles size={12} />
              The platform launches 4 September 2026
            </span>
          </A>
          <A delay={0.1}>
            <h2 className="headline text-[clamp(2.5rem,5.5vw,5.5rem)] text-ink mb-6">
              Be part of the<br /><span className="text-leaf">FLUETAS</span> journey.
            </h2>
          </A>
          <A delay={0.15}>
            <p className="font-heading font-semibold text-ink-soft text-[18px] tracking-tight mb-12">
              Your Body. Your Data. Your Formula.
            </p>
          </A>
          <A delay={0.2}>
            <div className="mb-12 flex justify-center">
              <CountdownRow />
            </div>
          </A>
          <A delay={0.3}>
            <div className="mx-auto max-w-[520px] mb-5">
              <WaitlistForm />
            </div>
          </A>
          <p className="text-[13px] text-ink-subtle">No spam. We&apos;ll only email you when it matters.</p>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="border-t border-rule py-16 sm:py-20 bg-surface-2">
        <div className="wrap">
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <img src="/assets/image.png" alt="FLUETAS" width={32} height={32} className="transition-transform group-hover:scale-105" />
                <span className="brand text-[18px]">FLUETAS</span>
              </Link>
              <p className="text-[14px] text-ink-soft max-w-[250px] leading-relaxed">
                One platform for training, wellness, AI guidance and expert consultations.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-14 gap-y-8">
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow mb-1 !text-[10px]">Platform</p>
                {["Train", "Her", "AI Coach", "Experts", "Nutrition"].map((l) => (
                  <a key={l} href={`#${l.toLowerCase().replace(" ", "")}`} className="text-[13px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow mb-1 !text-[10px]">Company</p>
                {["How it works", "Privacy", "Launch"].map((l) => (
                  <a key={l} href="#" className="text-[13px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
                <Link href="/feedback" className="text-[13px] font-medium text-leaf hover:text-ink transition-colors">Feedback &amp; Roadmap</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow mb-1 !text-[10px]">Social</p>
                {["Instagram", "Facebook"].map((l) => (
                  <a key={l} href="#" className="text-[13px] font-medium text-ink-soft hover:text-ink transition-colors">{l}</a>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-rule pt-8 sm:flex-row sm:justify-between">
            <p className="text-[12px] text-ink-subtle">Fitness · Wellness · Nutrition · Experts · Technology</p>
            <p className="text-[12px] text-ink-subtle"><span className="brand text-[12px]">FLUETAS</span>.IN · Launching 4 September 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
