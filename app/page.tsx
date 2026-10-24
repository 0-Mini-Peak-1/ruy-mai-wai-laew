"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Purchase,
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  loadPurchases,
  savePurchases,
  computeDayUsed,
  computeMonthUsed,
  todayKey,
  monthKey,
} from "@/lib/store";
import { baht0 } from "@/lib/format";
import Calculator from "@/components/Calculator";
import History from "@/components/History";
import Guide from "@/components/Guide";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/lib/useTheme";

type Tab = "calc" | "history" | "guide";

// ─── Icons ───────────────────────────────────────────────────────────────────

function CalcIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="3" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="10" y2="16" />
      <line x1="14" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h12M3 18h8" />
    </svg>
  );
}

function GuideIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingShell() {
  return (
    <div className="app-bg">
      <div className="app-shell">
        <header className="app-header">
          <div className="header-inner">
            <div>
              <div className="skeleton" style={{ width: 130, height: 20 }} />
              <div className="skeleton mt-2" style={{ width: 100, height: 12 }} />
            </div>
            <div className="skeleton" style={{ width: 120, height: 30 }} />
          </div>
        </header>
        <main className="app-main">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 space-y-2">
                <div className="skeleton" style={{ width: 50, height: 12 }} />
                <div className="skeleton" style={{ width: 90, height: 22 }} />
                <div className="skeleton" style={{ width: "100%", height: 8 }} />
              </div>
              <div className="card p-4 space-y-2">
                <div className="skeleton" style={{ width: 50, height: 12 }} />
                <div className="skeleton" style={{ width: 90, height: 22 }} />
                <div className="skeleton" style={{ width: "100%", height: 8 }} />
              </div>
            </div>
            <div className="card p-5 space-y-3">
              <div className="skeleton" style={{ width: 90, height: 12 }} />
              <div className="skeleton" style={{ width: "100%", height: 48 }} />
              <div className="skeleton" style={{ width: "100%", height: 48 }} />
              <div className="skeleton" style={{ width: "100%", height: 48 }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState<Tab>("calc");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [mounted, setMounted] = useState(false);
  const { mode: themeMode, setTheme, mounted: themeMounted } = useTheme();

  useEffect(() => {
    setPurchases(loadPurchases());
    setMounted(true);

    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested === "calc" || requested === "history" || requested === "guide") {
      setTab(requested);
    }
  }, []);

  const dayUsed = computeDayUsed(purchases, todayKey());
  const monthUsed = computeMonthUsed(purchases, monthKey());
  const dayRemaining = Math.max(0, DAILY_LIMIT - dayUsed);
  const monthRemaining = Math.max(0, MONTHLY_LIMIT - monthUsed);

  const addPurchase = useCallback(
    (p: Omit<Purchase, "id" | "timestamp">) => {
      const newP: Purchase = {
        ...p,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      setPurchases((prev) => {
        const updated = [newP, ...prev];
        savePurchases(updated);
        return updated;
      });
    },
    []
  );

  const deletePurchase = useCallback((id: string) => {
    setPurchases((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePurchases(updated);
      return updated;
    });
  }, []);

  const restorePurchase = useCallback((p: Purchase) => {
    setPurchases((prev) => {
      if (prev.some((item) => item.id === p.id)) return prev;
      const updated = [...prev, p].sort((a, b) => b.timestamp - a.timestamp);
      savePurchases(updated);
      return updated;
    });
  }, []);

  if (!mounted || !themeMounted) {
    return <LoadingShell />;
  }

  const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: "calc", label: "คำนวณ", Icon: CalcIcon },
    { id: "history", label: "ประวัติ", Icon: HistoryIcon },
    { id: "guide", label: "วิธีใช้", Icon: GuideIcon },
  ];

  return (
    <div className="app-bg">
      <div className="app-shell">
        {/* ─── Header ─── */}
        <header className="app-header">
          <div className="header-inner">
            <div className="brand-block">
              <div className="brand-title">🇹🇭 ไทยช่วยไทย</div>
              <div className="brand-sub">คำนวณค่าใช้จ่าย 60:40</div>
            </div>

            {/* Desktop navigation */}
            <nav className="desktop-nav" aria-label="เมนูหลัก">
              <button
                type="button"
                className={tab !== "guide" ? "active" : ""}
                onClick={() => setTab("calc")}
                aria-current={tab !== "guide" ? "page" : undefined}
              >
                หน้าหลัก
              </button>
              <button
                type="button"
                className={tab === "guide" ? "active" : ""}
                onClick={() => setTab("guide")}
                aria-current={tab === "guide" ? "page" : undefined}
              >
                วิธีใช้
              </button>
            </nav>

            {/* Right side: budget chips + theme toggle */}
            <div className="header-right">
              <div className="flex gap-2">
                <div
                  className="badge nums"
                  style={{
                    background:
                      dayRemaining <= 0 ? "var(--accent-soft)" : "var(--gov-soft)",
                    color: dayRemaining <= 0 ? "var(--accent)" : "var(--gov)",
                  }}
                  title="วงเงินรัฐบาลคงเหลือวันนี้"
                >
                  วัน {baht0(dayRemaining)}
                </div>
                <div
                  className="badge nums"
                  style={{
                    background:
                      monthRemaining <= 0 ? "var(--accent-soft)" : "var(--gold-soft)",
                    color: monthRemaining <= 0 ? "var(--accent)" : "var(--gold)",
                  }}
                  title="วงเงินรัฐบาลคงเหลือเดือนนี้"
                >
                  เดือน {baht0(monthRemaining)}
                </div>
              </div>
              <ThemeToggle mode={themeMode} onChange={setTheme} />
            </div>
          </div>
        </header>

        {/* ─── Content ─── */}
        <main className="app-main">
          {tab === "guide" ? (
            <div className="lg:mx-auto lg:max-w-3xl">
              <Guide />
            </div>
          ) : (
            <div className="desktop-grid">
              <div className={tab === "calc" ? "block" : "hidden lg:block"}>
                <Calculator
                  dayUsed={dayUsed}
                  monthUsed={monthUsed}
                  onAdd={addPurchase}
                />
              </div>
              <div className={tab === "history" ? "block" : "hidden lg:block"}>
                <History
                  purchases={purchases}
                  onDelete={deletePurchase}
                  onRestore={restorePurchase}
                  onGoToCalc={() => setTab("calc")}
                />
              </div>
            </div>
          )}
        </main>

        {/* ─── Bottom nav (mobile) ─── */}
        <nav className="bottom-nav" aria-label="เมนูหลัก">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon active={tab === id} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
