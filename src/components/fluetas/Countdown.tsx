"use client";
import { useEffect, useState } from "react";

const LAUNCH = new Date("2026-09-04T00:00:00Z").getTime();

function diff() {
  const ms = Math.max(0, LAUNCH - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [t, setT] = useState(() => diff());
  const [live, setLive] = useState(false);

  useEffect(() => {
    setLive(true);
    const id = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hrs" },
    { v: t.minutes, l: "Min" },
    { v: t.seconds, l: "Sec" },
  ];

  const digit = tone === "dark" ? "text-ink-foreground" : "text-foreground";
  const label = tone === "dark" ? "text-ink-foreground/55" : "text-muted-foreground";
  const line = tone === "dark" ? "border-ink-foreground/15" : "border-border";

  return (
    <div className="flex items-stretch">
      {units.map((u, i) => (
        <div
          key={u.l}
          className={`flex-1 pr-4 md:pr-8 ${i > 0 ? `border-l ${line} pl-4 md:pl-8` : ""}`}
        >
          <div
            className={`numeric text-4xl leading-none tabular-nums md:text-5xl ${digit}`}
            suppressHydrationWarning
          >
            {live ? String(u.v).padStart(2, "0") : "--"}
          </div>
          <div className={`label-tiny mt-2 block uppercase ${label}`}>{u.l}</div>
        </div>
      ))}
    </div>
  );
}

