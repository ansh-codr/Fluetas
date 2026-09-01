"use client";
import { useState } from "react";

export function WaitlistForm({
  tone = "dark",
  id = "waitlist-email",
}: {
  tone?: "light" | "dark";
  id?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const dark = tone === "dark";

  if (done) {
    return (
      <p
        className={`text-base ${dark ? "text-ink-foreground" : "text-foreground"}`}
        role="status"
      >
        You're on the list. We'll email <span className="font-semibold">{email}</span> before
        the doors open on 4 September.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className={
          dark
            ? "h-13 flex-1 rounded-sm border border-ink-foreground/20 bg-transparent px-4 py-3.5 text-base text-ink-foreground placeholder:text-ink-foreground/40 focus:border-primary-hover focus:outline-none"
            : "h-13 flex-1 rounded-sm border border-border bg-background px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        }
      />
      <button
        type="submit"
        className="rounded-sm bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-hover"
      >
        Request early access
      </button>
    </form>
  );
}

