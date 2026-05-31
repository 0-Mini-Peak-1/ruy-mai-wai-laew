"use client";

import { Purchase, DAILY_LIMIT, MONTHLY_LIMIT, todayKey, monthKey } from "@/lib/store";

interface Props {
  purchases: Purchase[];
  onDelete: (id: string) => void;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${parseInt(y) + 543}`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History({ purchases, onDelete }: Props) {
  const today = todayKey();
  const mk = monthKey();

  // Group by date (desc)
  const grouped: Record<string, Purchase[]> = {};
  [...purchases]
    .sort((a, b) => b.timestamp - a.timestamp)
    .forEach((p) => {
      if (!grouped[p.date]) grouped[p.date] = [];
      grouped[p.date].push(p);
    });

  const dates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  const todayTotal = purchases
    .filter((p) => p.date === today)
    .reduce((s, p) => s + p.govPays, 0);
  const monthTotal = purchases
    .filter((p) => p.monthKey === mk)
    .reduce((s, p) => s + p.govPays, 0);

  if (purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-up">
        <div style={{ fontSize: "3rem", opacity: 0.3 }}>🧾</div>
        <div className="mt-3 font-600" style={{ color: "var(--text-muted)" }}>
          ยังไม่มีรายการ
        </div>
        <div className="text-sm mt-1" style={{ color: "var(--text-muted)", opacity: 0.7 }}>
          ไปคำนวณรายการแรกของคุณกันเลย
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 stagger">
      {/* Summary bar */}
      <div className="card animate-slide-up p-4">
        <div className="text-xs font-700 mb-3" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          สรุปยอดใช้งาน
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>วันนี้</div>
            <div className="font-800 text-lg">฿{todayTotal.toFixed(2)}</div>
            <div className="text-xs mt-0.5" style={{ color: todayTotal >= DAILY_LIMIT ? "var(--accent)" : "var(--text-muted)" }}>
              จาก ฿{DAILY_LIMIT} / วัน
            </div>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>เดือนนี้</div>
            <div className="font-800 text-lg">฿{monthTotal.toFixed(2)}</div>
            <div className="text-xs mt-0.5" style={{ color: monthTotal >= MONTHLY_LIMIT ? "var(--accent)" : "var(--text-muted)" }}>
              จาก ฿{MONTHLY_LIMIT} / เดือน
            </div>
          </div>
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
            className="card animate-slide-up overflow-hidden"
            style={{ animationDelay: `${di * 60}ms` }}
          >
            {/* Date header */}
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2">
                <span className="font-700 text-sm">{formatDate(date)}</span>
                {isToday && (
                  <span
                    className="badge"
                    style={{ background: "var(--gov-soft)", color: "var(--gov)" }}
                  >
                    วันนี้
                  </span>
                )}
              </div>
              <div className="text-xs text-right" style={{ color: "var(--text-muted)" }}>
                <span className="font-600" style={{ color: "var(--gov)" }}>
                  รัฐ ฿{dayGov.toFixed(0)}
                </span>
                {" · "}
                <span>คุณ ฿{dayYou.toFixed(0)}</span>
              </div>
            </div>

            {/* Purchase rows */}
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {dayPurchases.map((p) => (
                <div
                  key={p.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-600 truncate">{p.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {formatTime(p.timestamp)} · ราคาเต็ม ฿{p.totalPrice.toFixed(2)}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <span
                        className="badge"
                        style={{ background: "var(--gov-soft)", color: "var(--gov)" }}
                      >
                        รัฐ ฿{p.govPays.toFixed(2)}
                      </span>
                      <span
                        className="badge"
                        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                      >
                        คุณ ฿{p.youPay.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = "var(--accent-soft)";
                      (e.target as HTMLElement).style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = "transparent";
                      (e.target as HTMLElement).style.color = "var(--text-muted)";
                    }}
                    aria-label="ลบรายการ"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
