// ─── Types ────────────────────────────────────────────────────────────────────

export interface Purchase {
  id: string;
  name: string;
  totalPrice: number;        // Full price of item
  govPays: number;           // 60% (capped)
  youPay: number;            // Remainder
  timestamp: number;         // Unix ms
  date: string;              // "YYYY-MM-DD"
  monthKey: string;          // "YYYY-MM"
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
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
  return { govPays: parseFloat(govPays.toFixed(2)), youPay: parseFloat(youPay.toFixed(2)) };
}

// ─── LocalStorage persistence ─────────────────────────────────────────────────

export const STORAGE_KEY = "thai-chuay-thai-purchases";

export function loadPurchases(): Purchase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePurchases(purchases: Purchase[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
}

export function computeDayUsed(purchases: Purchase[], date: string): number {
  return purchases
    .filter((p) => p.date === date)
    .reduce((sum, p) => sum + p.govPays, 0);
}

export function computeMonthUsed(purchases: Purchase[], mk: string): number {
  return purchases
    .filter((p) => p.monthKey === mk)
    .reduce((sum, p) => sum + p.govPays, 0);
}
