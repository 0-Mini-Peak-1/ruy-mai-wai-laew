"use client";

import { useEffect, useRef, useState } from "react";
import {
  Purchase,
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  todayKey,
  monthKey,
  lastNDays,
  computeStreak,
} from "@/lib/store";
import {
  baht,
  baht0,
  formatDateTH,
  formatMonthTH,
  formatTimeTH,
  weekdayShortTH,
} from "@/lib/format";
import { SharePayload } from "@/lib/shareCard";
import ShareCard from "@/components/ShareCard";

interface Props {
  purchases: Purchase[];
  onDelete: (id: string) => void;
  onRestore: (p: Purchase) => void;
  onGoToCalc: () => void;
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="10.51" x2="15.42" y2="6.49" />
      <line x1="8.59" y1="13.49" x2="15.42" y2="17.51" />
    </svg>
  );
}

export default function History({
  purchases,
  onDelete,
  onRestore,
  onGoToCalc,
}: Props) {
  const today = todayKey();
  const mk = monthKey();
  const [sharePayload, setSharePayload] = useState<SharePayload | null>(null);
  const [undoItem, setUndoItem] = useState<Purchase | null>(null);
  const undoTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
    };
  }, []);

  // Group by date (desc)
  const grouped: Record<string, Purchase[]> = {};
  [...purchases]
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((p) => {
      if (!grouped[p.date]) grouped[p.date] = [];
      grouped[p.date].push(p);
    });

  const dates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  const todayGov = purchases
    .filter((p) => p.date === today)
    .reduce((s, p) => s + p.govPays, 0);
  const monthPurchases = purchases.filter((p) => p.monthKey === mk);
  const monthGov = monthPurchases.reduce((s, p) => s + p.govPays, 0);
  const monthTotal = monthPurchases.reduce((s, p) => s + p.totalPrice, 0);
  const monthYou = monthPurchases.reduce((s, p) => s + p.youPay, 0);
  const lifetimeGov = purchases.reduce((s, p) => s + p.govPays, 0);
  const streak = computeStreak(purchases);

  const week = lastNDays(7).map((date) => ({
    date,
    amount: purchases
      .filter((p) => p.date === date)
      .reduce((s, p) => s + p.govPays, 0),
  }));
  const weekMax = Math.max(1, ...week.map((d) => d.amount));

  const handleDelete = (p: Purchase) => {
    onDelete(p.id);
    setUndoItem(p);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => {
      setUndoItem(null);
      undoTimer.current = null;
    }, 5000);
  };

  const handleUndo = () => {
    if (!undoItem) return;
    onRestore(undoItem);
    setUndoItem(null);
    if (undoTimer.current) {
      window.clearTimeout(undoTimer.current);
      undoTimer.current = null;
    }
  };

  const shareSummary = () => {
    setSharePayload({
      kind: "summary",
      title: "สรุปการใช้สิทธิ์",
      subtitle: formatMonthTH(mk),
      totalPrice: monthTotal,
      govPays: monthGov,
      youPay: monthYou,
    });
  };

  const sharePurchase = (p: Purchase) => {
    setSharePayload({
      kind: "purchase",
      title: p.name,
      subtitle: `${formatDateTH(p.date)} · ${formatTimeTH(p.timestamp)}`,
      totalPrice: p.totalPrice,
      govPays: p.govPays,
      youPay: p.youPay,
    });
  };

  const undoToast = undoItem ? (
    <div className="undo-toast animate-pop" role="status">
      <span className="truncate">ลบ “{undoItem.name}” แล้ว</span>
      <button type="button" onClick={handleUndo}>
        เลิกทำ
      </button>
    </div>
  ) : null;

  if (purchases.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up desktop-grow">
          <div style={{ fontSize: "3rem", opacity: 0.3 }}>🧾</div>
          <div className="mt-3 font-600" style={{ color: "var(--text-muted)" }}>
            ยังไม่มีรายการ
          </div>
          <div
            className="text-sm mt-1"
            style={{ color: "var(--text-muted)", opacity: 0.8 }}
          >
            ไปคำนวณรายการแรกของคุณกันเลย
          </div>
          <button
            type="button"
            className="btn-primary mt-5"
            style={{ width: "auto", padding: "12px 28px" }}
            onClick={onGoToCalc}
          >
            ไปคำนวณรายการแรก
          </button>
        </div>
        {undoToast}
        <ShareCard payload={sharePayload} onClose={() => setSharePayload(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-4 stagger">
      {/* Summary bar */}
      <div className="card animate-slide-up p-4">
        <div className="flex items-center justify-between mb-3">
          <div
            className="text-xs font-700"
            style={{
              color: "var(--text-muted)",
              letterSpacing: "0.01em",
            }}
          >
            สรุปยอดใช้งาน
          </div>
          {monthGov > 0 && (
            <button
              type="button"
              className="btn-mini"
              onClick={shareSummary}
              aria-label="แชร์สรุปการใช้สิทธิ์เดือนนี้"
            >
              <ShareIcon />
              แชร์สรุป
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              วันนี้
            </div>
            <div className="font-800 text-lg nums">{baht0(todayGov)}</div>
            <div
              className="text-xs mt-0.5 nums"
              style={{
                color:
                  todayGov >= DAILY_LIMIT ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              จาก ฿{DAILY_LIMIT} / วัน
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
              เดือนนี้
            </div>
            <div className="font-800 text-lg nums">{baht0(monthGov)}</div>
            <div
              className="text-xs mt-0.5 nums"
              style={{
                color:
                  monthGov >= MONTHLY_LIMIT
                    ? "var(--accent)"
                    : "var(--text-muted)",
              }}
            >
              จาก ฿{MONTHLY_LIMIT} / เดือน
            </div>
          </div>
        </div>

        {/* 7-day chart */}
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-600" style={{ color: "var(--text-muted)" }}>
              7 วันล่าสุด
            </span>
            <span className="text-xs nums" style={{ color: "var(--text-muted)" }}>
              รวม {baht0(week.reduce((s, d) => s + d.amount, 0))}
            </span>
          </div>
          <div className="week-chart">
            {week.map((d) => (
              <div className="week-col" key={d.date}>
                <div
                  className="week-bar-track"
                  title={`${formatDateTH(d.date)} · ${baht(d.amount)}`}
                >
                  <div
                    className={`week-bar ${d.date === today ? "today" : ""}`}
                    style={{
                      height: `${d.amount > 0 ? Math.max(8, (d.amount / weekMax) * 100) : 2}%`,
                    }}
                  />
                </div>
                <span
                  className={`week-label ${d.date === today ? "today" : ""}`}
                >
                  {weekdayShortTH(d.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifetime + streak */}
        <div
          className="flex items-center justify-between mt-3 pt-3 text-xs"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span style={{ color: "var(--text-muted)" }}>
            รัฐช่วยไปแล้วทั้งหมด{" "}
            <strong className="nums" style={{ color: "var(--gov)" }}>
              {baht0(lifetimeGov)}
            </strong>
          </span>
          {streak >= 2 && (
            <span className="badge" style={{ background: "var(--warn-soft)", color: "var(--warn)" }}>
              🔥 {streak} วันติด
            </span>
          )}
        </div>
      </div>

      {/* Grouped list */}
      {dates.map((date, di) => {
        const dayPurchases = grouped[date];
        const dayGov = dayPurchases.reduce((s, p) => s + p.govPays, 0);
        const dayYou = dayPurchases.reduce((s, p) => s + p.youPay, 0);
        const isToday = date === today;

        return (
          <div
            key={date}
            className="card animate-slide-up overflow-hidden desktop-grow"
            style={{ animationDelay: `${Math.min(di, 5) * 60}ms` }}
          >
            {/* Date header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: "var(--surface2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="font-700 text-sm">{formatDateTH(date)}</span>
                {isToday && (
                  <span
                    className="badge"
                    style={{ background: "var(--gov-soft)", color: "var(--gov)" }}
                  >
                    วันนี้
                  </span>
                )}
              </div>
              <div
                className="text-xs text-right nums"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="font-600" style={{ color: "var(--gov)" }}>
                  รัฐ {baht0(dayGov)}
                </span>
                {" · "}
                <span>คุณ {baht0(dayYou)}</span>
              </div>
            </div>

            {/* Purchase rows */}
            <div className="list-divide">
              {dayPurchases.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-600 truncate">{p.name}</div>
                    <div
                      className="text-xs mt-0.5 nums"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {formatTimeTH(p.timestamp)} · ราคาเต็ม {baht(p.totalPrice)}
                    </div>
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <span
                        className="badge nums"
                        style={{ background: "var(--gov-soft)", color: "var(--gov)" }}
                      >
                        รัฐ {baht(p.govPays)}
                      </span>
                      <span
                        className="badge nums"
                        style={{
                          background: "var(--accent-soft)",
                          color: "var(--accent)",
                        }}
                      >
                        คุณ {baht(p.youPay)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => sharePurchase(p)}
                    className="icon-btn"
                    aria-label={`แชร์รายการ ${p.name}`}
                  >
                    <ShareIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p)}
                    className="icon-btn icon-btn-danger"
                    aria-label={`ลบรายการ ${p.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="h-2" />

      {/* Undo toast */}
      {undoToast}

      <ShareCard payload={sharePayload} onClose={() => setSharePayload(null)} />
    </div>
  );
}
