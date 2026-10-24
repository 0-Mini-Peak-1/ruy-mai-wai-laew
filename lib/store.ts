// ─── Types ────────────────────────────────────────────────────────────────────

export interface Purchase {
  id: string;
  name: string;
  totalPrice: number;        // Full price of item
  govPays: number;           // 60% (capped)
  youPay: number;            // Remainder
  timestamp: number;         // Unix ms
  date: string;              // "YYYY-MM-DD" (local time)
  monthKey: string;          // "YYYY-MM" (local time)
}

export interface DayState {
  date: string;
  govUsed: number;           // Gov portion spent today
}

export interface MonthState {
  monthKey: string;
  govUsed: number;           // Gov portion spent this month
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DAILY_LIMIT = 200;    // Baht — gov pays up to this per day
export const MONTHLY_LIMIT = 1000; // Baht — gov pays up to this per month
export const GOV_RATIO = 0.6;      // 60%

// ─── Date helpers (local time — Thailand is UTC+7) ────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Local calendar date key, e.g. "2026-10-24". Never UTC. */
export function localDateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Local month key, e.g. "2026-10". */
export function localMonthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function todayKey(): string {
  return localDateKey();
}

export function monthKey(): string {
  return localMonthKey();
}

/** Last `n` local date keys, oldest → newest, ending today. */
export function lastNDays(n: number, end: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i);
    out.push(localDateKey(d));
  }
  return out;
}

/** Consecutive days with at least one purchase, ending today or yesterday. */
export function computeStreak(purchases: Purchase[], end: Date = new Date()): number {
  if (purchases.length === 0) return 0;
  const days = new Set(purchases.map((p) => p.date));
  const cursor = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (!days.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Calculate what gov actually pays given remaining caps */
export function calcSplit(
  price: number,
  dayRemaining: number,
  monthRemaining: number
): { govPays: number; youPay: number } {
  const desired = price * GOV_RATIO;
  const govPays = Math.min(desired, dayRemaining, monthRemaining, price);
  const youPay = price - govPays;
  return { govPays: round2(govPays), youPay: round2(youPay) };
}

// ─── Price input helpers ──────────────────────────────────────────────────────

/** Keep only digits and one decimal point, max 6 integer digits / 2 decimals. */
export function sanitizePriceInput(raw: string): string {
  let value = raw.replace(/[^\d.]/g, "");
  const firstDot = value.indexOf(".");
  if (firstDot !== -1) {
    value =
      value.slice(0, firstDot + 1) +
      value.slice(firstDot + 1).replace(/\./g, "");
  }
  const [intPart = "", decPart] = value.split(".");
  const int = intPart.slice(0, 6);
  if (decPart === undefined) return int;
  return `${int}.${decPart.slice(0, 2)}`;
}

export function parsePrice(raw: string): number | null {
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// ─── LocalStorage persistence ─────────────────────────────────────────────────

export const STORAGE_KEY = "thai-chuay-thai-purchases";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/**
 * Validate + normalize a persisted record. Dates are always recomputed from
 * the timestamp so old records written with UTC keys are corrected on load.
 */
function normalizePurchase(value: unknown): Purchase | null {
  if (!isRecord(value)) return null;
  const id = value.id;
  const timestamp = value.timestamp;
  if (typeof id !== "string" || typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    return null;
  }
  const totalPrice = toFiniteNumber(value.totalPrice, -1);
  const govPays = toFiniteNumber(value.govPays, -1);
  const youPay = toFiniteNumber(value.youPay, -1);
  if (totalPrice < 0 || govPays < 0 || youPay < 0) return null;

  const date = new Date(timestamp);
  return {
    id,
    name: typeof value.name === "string" && value.name.trim() ? value.name : "รายการซื้อ",
    totalPrice: round2(totalPrice),
    govPays: round2(govPays),
    youPay: round2(youPay),
    timestamp,
    date: localDateKey(date),
    monthKey: localMonthKey(date),
  };
}

export function loadPurchases(): Purchase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizePurchase)
      .filter((p): p is Purchase => p !== null)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function savePurchases(purchases: Purchase[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
  } catch {
    // Storage full / private mode — the app keeps working for this session.
  }
}

export function computeDayUsed(purchases: Purchase[], date: string): number {
  return round2(
    purchases
      .filter((p) => p.date === date)
      .reduce((sum, p) => sum + p.govPays, 0)
  );
}

export function computeMonthUsed(purchases: Purchase[], mk: string): number {
  return round2(
    purchases
      .filter((p) => p.monthKey === mk)
      .reduce((sum, p) => sum + p.govPays, 0)
  );
}
