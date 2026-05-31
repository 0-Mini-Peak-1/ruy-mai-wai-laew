"use client";

import { useState } from "react";
import {
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  GOV_RATIO,
  calcSplit,
  todayKey,
  monthKey,
  Purchase,
} from "@/lib/store";

interface Props {
  dayUsed: number;
  monthUsed: number;
  onAdd: (p: Omit<Purchase, "id" | "timestamp">) => void;
}

export default function Calculator({ dayUsed, monthUsed, onAdd }: Props) {
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<{
    govPays: number;
    youPay: number;
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const dayRemaining = Math.max(0, DAILY_LIMIT - dayUsed);
  const monthRemaining = Math.max(0, MONTHLY_LIMIT - monthUsed);

  const handleCalc = () => {
    const p = parseFloat(price);
    if (!p || p <= 0) return;
    const split = calcSplit(p, dayRemaining, monthRemaining);
    setResult(split);
    setSaved(false);
  };

  const handleSave = () => {
    if (!result) return;
    const p = parseFloat(price);
    const today = todayKey();
    const mk = monthKey();
    onAdd({
      name: name.trim() || "รายการซื้อ",
      totalPrice: p,
      govPays: result.govPays,
      youPay: result.youPay,
      date: today,
      monthKey: mk,
    });
    setSaved(true);
    setTimeout(() => {
      setPrice("");
      setName("");
      setResult(null);
      setSaved(false);
    }, 1400);
  };

  const pct = (used: number, limit: number) =>
    Math.min(100, (used / limit) * 100);

  const dayPct = pct(dayUsed, DAILY_LIMIT);
  const monthPct = pct(monthUsed, MONTHLY_LIMIT);

  const dayOver = dayUsed >= DAILY_LIMIT;
  const monthOver = monthUsed >= MONTHLY_LIMIT;
  const anyOver = dayOver || monthOver;

  return (
    <div className="space-y-4 stagger">
      {/* ─── Limit cards ─── */}
      <div className="animate-slide-up grid grid-cols-2 gap-3">
        {/* Daily */}
        <div
          className="card p-4 space-y-2"
          style={{ borderColor: dayOver ? "var(--accent)" : undefined }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-700"
              style={{ color: "var(--text-muted)" }}
            >
              วันนี้
            </span>
            {dayOver && (
              <span
                className="badge"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                เต็มแล้ว
              </span>
            )}
          </div>
          <div
            className="font-800 text-lg leading-tight"
            style={{ color: dayOver ? "var(--accent)" : "var(--text)" }}
          >
            ฿{dayUsed.toFixed(0)}
            <span
              className="text-xs font-500 ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              / {DAILY_LIMIT}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${dayPct}%`,
                background: dayOver
                  ? "var(--accent)"
                  : "linear-gradient(90deg, var(--gov), #4a80d4)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            เหลือ ฿{dayRemaining.toFixed(0)}
          </div>
        </div>

        {/* Monthly */}
        <div
          className="card p-4 space-y-2"
          style={{ borderColor: monthOver ? "var(--accent)" : undefined }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-700"
              style={{ color: "var(--text-muted)" }}
            >
              เดือนนี้
            </span>
            {monthOver && (
              <span
                className="badge"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                เต็มแล้ว
              </span>
            )}
          </div>
          <div
            className="font-800 text-lg leading-tight"
            style={{ color: monthOver ? "var(--accent)" : "var(--text)" }}
          >
            ฿{monthUsed.toFixed(0)}
            <span
              className="text-xs font-500 ml-1"
              style={{ color: "var(--text-muted)" }}
            >
              / {MONTHLY_LIMIT}
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${monthPct}%`,
                background: monthOver
                  ? "var(--accent)"
                  : "linear-gradient(90deg, var(--gold), #e8b84b)",
              }}
            />
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            เหลือ ฿{monthRemaining.toFixed(0)}
          </div>
        </div>
      </div>

      {/* ─── Exceeded banner ─── */}
      {anyOver && (
        <div
          className="card animate-pop p-3 flex items-start gap-3"
          style={{
            background: "var(--accent-soft)",
            borderColor: "var(--accent)",
          }}
        >
          <span style={{ fontSize: "1.3rem" }}>⚠️</span>
          <div>
            <div
              className="font-700 text-sm"
              style={{ color: "var(--accent)" }}
            >
              {dayOver && monthOver
                ? "วงเงินรายวันและรายเดือนเต็มแล้ว"
                : dayOver
                ? "วงเงินรายวันเต็มแล้ว"
                : "วงเงินรายเดือนเต็มแล้ว"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#c0392b" }}>
              คุณจะต้องจ่ายเองทั้งหมดสำหรับรายการถัดไป
            </div>
          </div>
        </div>
      )}

      {/* ─── Calculator form ─── */}
      <div className="card animate-slide-up p-5 space-y-4">
        <div className="text-sm font-700" style={{ color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          คำนวณรายการ
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-600 mb-1.5">
              ราคาสินค้า (฿)
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="input-field"
              placeholder="0.00"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setResult(null);
                setSaved(false);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-600 mb-1.5">
              ชื่อรายการ <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="เช่น ข้าวมันไก่, ชานมไข่มุก..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" onClick={handleCalc}>
          คำนวณ
        </button>
      </div>

      {/* ─── Result ─── */}
      {result && !saved && (
        <div className="card animate-pop p-5 space-y-4" style={{ borderColor: "var(--gov)", borderWidth: "1.5px" }}>
          <div className="text-sm font-700 text-center" style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}>
            ผลการคำนวณ
          </div>

          {/* Big split display */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--gov-soft)" }}
            >
              <div
                className="text-xs font-700 mb-1"
                style={{ color: "var(--gov)", letterSpacing: "0.05em" }}
              >
                รัฐบาลจ่าย
              </div>
              <div
                className="text-2xl font-800"
                style={{ color: "var(--gov)" }}
              >
                ฿{result.govPays.toFixed(2)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--gov)", opacity: 0.7 }}>
                {((result.govPays / parseFloat(price)) * 100).toFixed(0)}%
              </div>
            </div>
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--accent-soft)" }}
            >
              <div
                className="text-xs font-700 mb-1"
                style={{ color: "var(--accent)", letterSpacing: "0.05em" }}
              >
                คุณจ่าย
              </div>
              <div
                className="text-2xl font-800"
                style={{ color: "var(--accent)" }}
              >
                ฿{result.youPay.toFixed(2)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--accent)", opacity: 0.7 }}>
                {((result.youPay / parseFloat(price)) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Detail row */}
          <div
            className="flex justify-between text-sm py-2 px-3 rounded-lg"
            style={{ background: "var(--surface2)" }}
          >
            <span style={{ color: "var(--text-muted)" }}>ราคาเต็ม</span>
            <span className="font-700">฿{parseFloat(price).toFixed(2)}</span>
          </div>

          {/* Warning if gov pays less than 60% */}
          {result.govPays < parseFloat(price) * GOV_RATIO - 0.01 && (
            <div
              className="text-xs text-center rounded-lg py-2 px-3"
              style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
            >
              ⚡ รัฐฯ จ่ายน้อยกว่า 60% เพราะวงเงิน{dayUsed + result.govPays > DAILY_LIMIT ? "รายวัน" : "รายเดือน"}ใกล้เต็ม
            </div>
          )}

          <button className="btn-primary" onClick={handleSave}>
            บันทึกรายการ
          </button>
          <button className="btn-ghost" onClick={() => setResult(null)}>
            ยกเลิก
          </button>
        </div>
      )}

      {/* ─── Saved confirmation ─── */}
      {saved && (
        <div
          className="card animate-pop p-5 text-center"
          style={{ background: "var(--green-soft)", borderColor: "var(--green)" }}
        >
          <div style={{ fontSize: "2rem" }}>✓</div>
          <div className="font-700 mt-1" style={{ color: "var(--green)" }}>
            บันทึกรายการแล้ว
          </div>
        </div>
      )}
    </div>
  );
}
