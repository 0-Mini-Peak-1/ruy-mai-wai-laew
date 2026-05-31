"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Purchase,
  loadPurchases,
  savePurchases,
  computeDayUsed,
  computeMonthUsed,
  todayKey,
  monthKey,
} from "@/lib/store";
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState<Tab>("calc");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [mounted, setMounted] = useState(false);
  const { mode: themeMode, setTheme, mounted: themeMounted } = useTheme();

  useEffect(() => {
    setPurchases(loadPurchases());
    setMounted(true);
  }, []);

  const dayUsed = computeDayUsed(purchases, todayKey());
  const monthUsed = computeMonthUsed(purchases, monthKey());

  const addPurchase = useCallback(
    (p: Omit<Purchase, "id" | "timestamp">) => {
      const newP: Purchase = {
        ...p,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      const updated = [newP, ...purchases];
      setPurchases(updated);
      savePurchases(updated);
    },
    [purchases]
  );

  const deletePurchase = useCallback(
    (id: string) => {
      const updated = purchases.filter((p) => p.id !== id);
      setPurchases(updated);
      savePurchases(updated);
    },
    [purchases]
  );

  if (!mounted || !themeMounted) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>กำลังโหลด...</div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
    { id: "calc", label: "คำนวณ", Icon: CalcIcon },
    { id: "history", label: "ประวัติ", Icon: HistoryIcon },
    { id: "guide", label: "วิธีใช้", Icon: GuideIcon },
  ];

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* App wrapper — mobile width */}
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* ─── Header ─── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "var(--header-bg)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border)",
            padding: "14px 20px 12px",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "1.15rem",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                }}
              >
                🇹🇭 ไทยช่วยไทย
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "1px" }}>
                คำนวณค่าใช้จ่าย 60:40
              </div>
            </div>

            {/* Right side: budget chips + theme toggle */}
            <div className="flex flex-col items-end gap-2">
              {/* Budget chips */}
              <div className="flex gap-2">
                <div
                  className="badge"
                  style={{
                    background: dayUsed >= 200 ? "var(--accent-soft)" : "var(--gov-soft)",
                    color: dayUsed >= 200 ? "var(--accent)" : "var(--gov)",
                  }}
                >
                  วัน ฿{(200 - dayUsed).toFixed(0)}
                </div>
                <div
                  className="badge"
                  style={{
                    background: monthUsed >= 1000 ? "var(--accent-soft)" : "var(--gold-soft)",
                    color: monthUsed >= 1000 ? "var(--accent)" : "var(--gold)",
                  }}
                >
                  เดือน ฿{(1000 - monthUsed).toFixed(0)}
                </div>
              </div>
              {/* Theme toggle */}
              <ThemeToggle mode={themeMode} onChange={setTheme} />
            </div>
          </div>
        </header>

        {/* ─── Content ─── */}
        <main
          style={{
            flex: 1,
            padding: "16px 16px 90px",
            overflowY: "auto",
          }}
        >
          {tab === "calc" && (
            <Calculator
              dayUsed={dayUsed}
              monthUsed={monthUsed}
              onAdd={addPurchase}
            />
          )}
          {tab === "history" && (
            <History purchases={purchases} onDelete={deletePurchase} />
          )}
          {tab === "guide" && <Guide />}
        </main>

        {/* ─── Bottom nav ─── */}
        <nav className="bottom-nav">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
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
