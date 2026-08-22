"use client";

import { useEffect, useMemo, useState } from "react";

function parts(target: Date) {
  const remaining = Math.max(0, target.getTime() - Date.now());
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return [hours, minutes, seconds].map((value) => value.toString().padStart(2, "0"));
}

export function Countdown({ target, label = "Battle ends" }: { target: string | Date; label?: string }) {
  const targetDate = useMemo(() => new Date(target), [target]);
  const [time, setTime] = useState(() => parts(targetDate));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(parts(targetDate)), 1000);
    return () => window.clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 text-sm font-bold text-[var(--muted)]">
      <span>{label}</span>
      <span className="rounded-lg bg-[var(--foreground)] px-2.5 py-1.5 font-mono text-sm font-black tracking-widest text-white">
        {time.join(":")}
      </span>
    </div>
  );
}
