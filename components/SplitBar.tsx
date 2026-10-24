"use client";

import { useEffect, useState } from "react";
import { baht } from "@/lib/format";

interface Props {
  total: number;
  govPays: number;
  youPay: number;
}

/**
 * One-glance visual of the 60/40 split. The government segment fills first so
 * the exact ratio is understandable before reading any numbers.
 */
export default function SplitBar({ total, govPays, youPay }: Props) {
  const [ready, setReady] = useState(false);
  const safeTotal = total > 0 ? total : 1;
  const govPct = Math.max(0, Math.min(100, (govPays / safeTotal) * 100));
  const youPct = Math.max(0, 100 - govPct);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full">
      <div
        className="split-bar"
        role="img"
        aria-label={`ราคาเต็ม ${baht(total)} รัฐบาลจ่าย ${baht(govPays)} คุณจ่าย ${baht(youPay)}`}
      >
        <div
          className="split-seg split-seg-gov"
          style={{ width: `${ready ? govPct : 0}%` }}
        />
        <div
          className="split-seg split-seg-you"
          style={{ width: `${ready ? youPct : 0}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2 text-xs">
        <span className="flex items-center gap-1.5" style={{ color: "var(--gov)" }}>
          <span className="split-dot" style={{ background: "var(--gov)" }} />
          รัฐบาล {govPct.toFixed(0)}%
        </span>
        <span className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
          คุณ {youPct.toFixed(0)}%
          <span className="split-dot" style={{ background: "var(--accent)" }} />
        </span>
      </div>
    </div>
  );
}
