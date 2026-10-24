// ─── Thai formatting helpers ──────────────────────────────────────────────────

const THAI_MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const THAI_WEEKDAYS = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

const bahtFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const bahtWholeFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const bahtExactFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** ฿60 · ฿1,234.5 */
export function baht(value: number): string {
  return bahtFormatter.format(Number.isFinite(value) ? value : 0);
}

/** ฿60 · ฿1,235 */
export function baht0(value: number): string {
  return bahtWholeFormatter.format(Number.isFinite(value) ? value : 0);
}

/** ฿60.00 */
export function bahtExact(value: number): string {
  return bahtExactFormatter.format(Number.isFinite(value) ? value : 0);
}

/** "24 ต.ค. 2569" (Buddhist era) */
export function formatDateTH(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${THAI_MONTHS[m - 1]} ${y + 543}`;
}

/** "24 ต.ค." */
export function formatDateShortTH(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${THAI_MONTHS[m - 1]}`;
}

/** "14:05" in local time */
export function formatTimeTH(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "ศ." for a local date key */
export function weekdayShortTH(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "";
  return THAI_WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

/** "วันนี้" / "เมื่อวาน" / "24 ต.ค." */
export function relativeDayTH(dateStr: string, today: string): string {
  if (dateStr === today) return "วันนี้";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(
    yesterday.getDate()
  ).padStart(2, "0")}`;
  if (dateStr === yKey) return "เมื่อวาน";
  return formatDateShortTH(dateStr);
}

/** "ตุลาคม 2569" from a month key */
export function formatMonthTH(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  if (!y || !m) return monthKey;
  const fullMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];
  return `${fullMonths[m - 1]} ${y + 543}`;
}
