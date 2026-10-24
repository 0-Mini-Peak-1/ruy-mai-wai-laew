"use client";

import { useEffect, useRef, useState } from "react";

/** Smoothly animates a number when it changes. Respects reduced motion. */
export function useCountUp(value: number, duration = 450): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);

  useEffect(() => {
    if (typeof window === "undefined") {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const from = displayRef.current;
    if (Math.abs(value - from) < 0.005) {
      displayRef.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (value - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}
