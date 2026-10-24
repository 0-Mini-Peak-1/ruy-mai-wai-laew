"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DAILY_LIMIT,
  MONTHLY_LIMIT,
  GOV_RATIO,
  calcSplit,
  localDateKey,
  localMonthKey,
  parsePrice,
  sanitizePriceInput,
  Purchase,
} from "@/lib/store";
import { baht, baht0 } from "@/lib/format";
import { useCountUp } from "@/lib/useCountUp";
import SplitBar from "@/components/SplitBar";

interface Props {
  dayUsed: number;
  monthUsed: number;
  onAdd: (p: Omit<Purchase, "id" | "timestamp">) => void;
}

const PRESETS = [40, 60, 80, 100, 200];

export default function Calculator({ dayUsed, monthUsed, onAdd }: Props) {
  const [priceInput, setPriceInput] = useState("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const resetTimer = useRef<number | null>(null);

  const price = parsePrice(priceInput);
  const dayRemaining = Math.max(0, DAILY_LIMIT - dayUsed);
  const monthRemaining = Math.max(0, MONTHLY_LIMIT - monthUsed);

  const result = useMemo(() => {
    if (!price) return null;
    return calcSplit(price, dayRemaining, monthRemaining);
  }, [price, dayRemaining, monthRemaining]);

  const animatedGov = useCountUp(result?.govPays ?? 0);
  const animatedYou = useCountUp(result?.youPay ?? 0);
  const animatedDay = useCountUp(dayUsed);
  const animatedMonth = useCountUp(monthUsed);

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const cancelPendingReset = () => {
    if (resetTimer.current) {
      window.clearTimeout(resetTimer.current);
      resetTimer.current = null;
    }
  };

  const updatePrice = (raw: string) => {
    cancelPendingReset();
    setSaved(false);
    setPriceInput(sanitizePriceInput(raw));
  };

  const stepPrice = (delta: number) => {
    const base = price ?? 0;
    const next = Math.min(
      999999,
      Math.max(0, Math.round((base + delta) * 100) / 100)
    );
    updatePrice(next > 0 ? String(next) : "");
  };

  const handleSave = () => {
    if (!result || !price) return;
    const now = new Date();
    onAdd({
      name: name.trim() || "รายการซื้อ",
      totalPrice: price,
      govPays: result.govPays,
      youPay: result.youPay,
      date: localDateKey(now),
      monthKey: localMonthKey(now),
    });
    setSaved(true);
    cancelPendingReset();
    resetTimer.current = window.setTimeout(() => {
      setPriceInput("");
      setName("");
      setSaved(false);
      resetTimer.current = null;
    }, 1600);
  };

  const pct = (used: number, limit: number) =>
    Math.min(100, Math.max(0, (used / limit) * 100));

  const dayPct = pct(dayUsed, DAILY_LIMIT);
  const monthPct = pct(monthUsed, MONTHLY_LIMIT);

  const dayOver = dayUsed >= DAILY_LIMIT;
  const monthOver = monthUsed >= MONTHLY_LIMIT;
  const anyOver = dayOver || monthOver;

  const fullPriceCap = Math.min(dayRemaining, monthRemaining) / GOV_RATIO;
  const shortChanged =
    !!result && !!price && result.govPays < price * GOV_RATIO - 0.01;

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
            className="font-800 text-lg leading-tight nums"
            style={{ color: dayOver ? "var(--accent)" : "var(--text)" }}
          >
            {baht0(animatedDay)}
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
          <div className="text-xs nums" style={{ color: "var(--text-muted)" }}>
            เหลือ {baht0(dayRemaining)}
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
            className="font-800 text-lg leading-tight nums"
            style={{ color: monthOver ? "var(--accent)" : "var(--text)" }}
          >
            {baht0(animatedMonth)}
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
          <div className="text-xs nums" style={{ color: "var(--text-muted)" }}>
            เหลือ {baht0(monthRemaining)}
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
            <div className="text-xs mt-0.5" style={{ color: "var(--accent)" }}>
              คุณจะต้องจ่ายเองทั้งหมดสำหรับรายการถัดไป
            </div>
          </div>
        </div>
      )}

      {/* ─── Calculator form ─── */}
      <div className="card animate-slide-up p-5 space-y-4 desktop-grow">
        <div
          className="text-sm font-700"
          style={{
            color: "var(--text-muted)",
            letterSpacing: "0.01em",
          }}
        >
          คำนวณรายการ
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-600 mb-1.5" htmlFor="price">
              ราคาสินค้า (฿)
            </label>
            <div className="price-row">
              <button
                type="button"
                className="stepper"
                onClick={() => stepPrice(-10)}
                aria-label="ลดราคา 10 บาท"
              >
                −
              </button>
              <div className="price-input-wrap">
                <span className="price-prefix" aria-hidden="true">
                  ฿
                </span>
                <input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className="input-field price-input"
                  placeholder="0.00"
                  value={priceInput}
                  onChange={(e) => updatePrice(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="stepper"
                onClick={() => stepPrice(10)}
                aria-label="เพิ่มราคา 10 บาท"
              >
                +
              </button>
            </div>
            <div className="chip-row mt-2.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`quick-chip ${price === preset ? "active" : ""}`}
                  onClick={() => updatePrice(String(preset))}
                >
                  ฿{preset}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-600 mb-1.5" htmlFor="item-name">
              ชื่อรายการ{" "}
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                (ไม่บังคับ)
              </span>
            </label>
            <input
              id="item-name"
              type="text"
              className="input-field"
              placeholder="เช่น ข้าวมันไก่, ชานมไข่มุก..."
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {!result && (
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            ผลลัพธ์จะแสดงทันทีเมื่อกรอกราคา
          </p>
        )}
      </div>

      {/* ─── Result ─── */}
      <div aria-live="polite">
        {result && !saved && (
          <div
            className="card animate-pop p-5 space-y-4"
            style={{ borderColor: "var(--gov)", borderWidth: "1.5px" }}
          >
            <div className="text-center">
              <div
                className="text-sm font-700"
                style={{ color: "var(--text-muted)", letterSpacing: "0.01em" }}
              >
                ผลการคำนวณ
              </div>
              <div className="text-2xl font-800 mt-1 nums">
                {baht(price ?? 0)}
              </div>
              {name.trim() && (
                <div
                  className="text-sm font-600 mt-0.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {name.trim()}
                </div>
              )}
            </div>

            <SplitBar
              total={price ?? 0}
              govPays={result.govPays}
              youPay={result.youPay}
            />

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
                  className="text-2xl font-800 nums"
                  style={{ color: "var(--gov)" }}
                >
                  {baht(animatedGov)}
                </div>
                <div
                  className="text-xs mt-0.5 nums"
                  style={{ color: "var(--gov)", opacity: 0.8 }}
                >
                  {(((result.govPays / (price || 1)) * 100) || 0).toFixed(0)}%
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
                  className="text-2xl font-800 nums"
                  style={{ color: "var(--accent)" }}
                >
                  {baht(animatedYou)}
                </div>
                <div
                  className="text-xs mt-0.5 nums"
                  style={{ color: "var(--accent)", opacity: 0.8 }}
                >
                  {(((result.youPay / (price || 1)) * 100) || 0).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Detail row */}
            <div
              className="flex justify-between text-sm py-2 px-3 rounded-lg nums"
              style={{ background: "var(--surface2)" }}
            >
              <span style={{ color: "var(--text-muted)" }}>ราคาเต็ม</span>
              <span className="font-700">{bahtExactOrPlain(price ?? 0)}</span>
            </div>

            {/* Explanation when the cap limits the government share */}
            {shortChanged && (
              <div
                className="text-xs text-center rounded-lg py-2 px-3"
                style={{ background: "var(--warn-soft)", color: "var(--warn)" }}
              >
                {fullPriceCap > 0 ? (
                  <>
                    ⚡ ซื้อไม่เกิน <strong>{baht0(fullPriceCap)}</strong>{" "}
                    รัฐจะช่วยเต็ม 60% (วงเงินเหลือจำกัด)
                  </>
                ) : (
                  <>⚡ วงเงินรัฐหมดแล้ว รายการนี้คุณจ่ายเองทั้งหมด</>
                )}
              </div>
            )}

            <button className="btn-primary desktop-pin" onClick={handleSave}>
              บันทึกรายการ
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                updatePrice("");
                setName("");
              }}
            >
              ล้างรายการ
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
    </div>
  );
}

/** ฿60 for whole amounts, ฿60.50 otherwise. */
function bahtExactOrPlain(value: number): string {
  return Number.isInteger(value) ? baht0(value) : baht(value);
}
