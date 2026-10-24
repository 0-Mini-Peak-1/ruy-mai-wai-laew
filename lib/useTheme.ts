"use client";

import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "thai-chuay-thai-theme";

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function applyTheme(mode: ThemeMode) {
  const isDark = mode === "dark" || (mode === "system" && getSystemDark());
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  // On mount: read saved preference and apply
  useEffect(() => {
    let savedRaw: string | null = null;
    try {
      savedRaw = localStorage.getItem(STORAGE_KEY);
    } catch {
      savedRaw = null;
    }
    const saved: ThemeMode = isThemeMode(savedRaw) ? savedRaw : "system";
    setMode(saved);
    applyTheme(saved);
    setMounted(true);

    // Listen for system preference changes (relevant when mode === "system")
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      let currentRaw: string | null = null;
      try {
        currentRaw = localStorage.getItem(STORAGE_KEY);
      } catch {
        currentRaw = null;
      }
      const current: ThemeMode = isThemeMode(currentRaw) ? currentRaw : "system";
      if (current === "system") applyTheme("system");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setMode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode / storage disabled — apply for this session only.
    }
    applyTheme(next);
  }, []);

  return { mode, setTheme, mounted };
}
