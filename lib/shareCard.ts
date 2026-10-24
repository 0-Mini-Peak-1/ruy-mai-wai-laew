// ─── Share card renderer (Canvas 2D, no dependencies) ─────────────────────────

import { baht } from "@/lib/format";

export interface SharePayload {
  kind: "purchase" | "summary";
  title: string;
  subtitle?: string;
  totalPrice: number;
  govPays: number;
  youPay: number;
}

const C = {
  bg: "#f7f6f2",
  surface: "#ffffff",
  border: "#e2ddd6",
  text: "#1a1814",
  muted: "#6b665f",
  gov: "#1a4fa0",
  govSoft: "#e8eef8",
  accent: "#e63329",
  accentSoft: "#fde8e7",
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.trim()}…`;
}

function drawThaiFlagBar(ctx: CanvasRenderingContext2D, width: number) {
  const heights = [12, 12, 24, 12, 12];
  const colors = ["#a51931", "#f4f5f8", "#2d2a4a", "#f4f5f8", "#a51931"];
  let y = 0;
  colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, y, width, heights[i]);
    y += heights[i];
  });
}

export async function renderShareCard(
  payload: SharePayload
): Promise<HTMLCanvasElement> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-fatal — fall back to system fonts.
    }
  }

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");

  const family =
    getComputedStyle(document.body).fontFamily || "'Sarabun', sans-serif";
  const font = (weight: number, size: number) => `${weight} ${size}px ${family}`;
  const total = payload.totalPrice > 0 ? payload.totalPrice : 1;
  const govPct = Math.max(0, Math.min(100, (payload.govPays / total) * 100));

  // Background + soft brand glow
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);

  const govGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 720);
  govGlow.addColorStop(0, "rgba(26,79,160,0.16)");
  govGlow.addColorStop(1, "rgba(26,79,160,0)");
  ctx.fillStyle = govGlow;
  ctx.fillRect(0, 0, W, H);

  const redGlow = ctx.createRadialGradient(W, 0, 0, W, 0, 720);
  redGlow.addColorStop(0, "rgba(230,51,41,0.14)");
  redGlow.addColorStop(1, "rgba(230,51,41,0)");
  ctx.fillStyle = redGlow;
  ctx.fillRect(0, 0, W, H);

  drawThaiFlagBar(ctx, W);

  // Main card
  const cardX = 64;
  const cardY = 132;
  const cardW = W - cardX * 2;
  const cardH = H - cardY - 76;
  ctx.save();
  ctx.shadowColor = "rgba(26,24,20,0.12)";
  ctx.shadowBlur = 48;
  ctx.shadowOffsetY = 18;
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fillStyle = C.surface;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  const left = cardX + 64;
  const innerW = cardW - 128;

  // Brand line
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = C.accent;
  ctx.font = font(800, 30);
  ctx.fillText("ไทยช่วยไทย", left, cardY + 78);

  ctx.fillStyle = C.muted;
  ctx.font = font(600, 26);
  const kindLabel =
    payload.kind === "summary" ? "สรุปการใช้สิทธิ์" : "รายการซื้อ";
  const kindWidth = ctx.measureText(kindLabel).width;
  ctx.fillText(kindLabel, cardX + cardW - 64 - kindWidth, cardY + 78);

  // Title
  ctx.fillStyle = C.text;
  ctx.font = font(800, 58);
  ctx.fillText(fitText(ctx, payload.title, innerW), left, cardY + 172);

  // Subtitle
  if (payload.subtitle) {
    ctx.fillStyle = C.muted;
    ctx.font = font(400, 30);
    ctx.fillText(fitText(ctx, payload.subtitle, innerW), left, cardY + 224);
  }

  // Divider
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(left, cardY + 268);
  ctx.lineTo(left + innerW, cardY + 268);
  ctx.stroke();

  // Total
  ctx.fillStyle = C.muted;
  ctx.font = font(600, 28);
  ctx.fillText("ราคาเต็ม", left, cardY + 330);

  ctx.fillStyle = C.text;
  ctx.font = font(800, 92);
  ctx.fillText(baht(payload.totalPrice), left, cardY + 428);

  // Split bar
  const barY = cardY + 470;
  const barH = 26;
  roundRect(ctx, left, barY, innerW, barH, barH / 2);
  ctx.fillStyle = "#efece5";
  ctx.fill();

  const govW = Math.max(0, (innerW * govPct) / 100);
  if (govW > 0) {
    ctx.save();
    roundRect(ctx, left, barY, innerW, barH, barH / 2);
    ctx.clip();
    ctx.fillStyle = C.gov;
    ctx.fillRect(left, barY, govW, barH);
    ctx.fillStyle = C.accent;
    ctx.fillRect(left + govW, barY, innerW - govW, barH);
    ctx.restore();
  }

  // Two columns
  const boxY = cardY + 540;
  const boxH = 190;
  const gap = 26;
  const boxW = (innerW - gap) / 2;

  const boxes = [
    {
      x: left,
      bg: C.govSoft,
      color: C.gov,
      label: "รัฐบาลช่วยจ่าย",
      value: payload.govPays,
      pct: govPct,
    },
    {
      x: left + boxW + gap,
      bg: C.accentSoft,
      color: C.accent,
      label: "คุณจ่าย",
      value: payload.youPay,
      pct: 100 - govPct,
    },
  ];

  boxes.forEach((box) => {
    roundRect(ctx, box.x, boxY, boxW, boxH, 32);
    ctx.fillStyle = box.bg;
    ctx.fill();

    ctx.fillStyle = box.color;
    ctx.font = font(700, 28);
    ctx.fillText(box.label, box.x + 36, boxY + 62);

    ctx.font = font(800, 64);
    ctx.fillText(baht(box.value), box.x + 36, boxY + 138);

    ctx.font = font(600, 24);
    ctx.globalAlpha = 0.75;
    ctx.fillText(`${box.pct.toFixed(0)}%`, box.x + 36, boxY + 170);
    ctx.globalAlpha = 1;
  });

  // Footer
  ctx.fillStyle = C.muted;
  ctx.font = font(600, 26);
  ctx.fillText("คำนวณ 60:40 · ruy-mai-wai-laew.vercel.app", left, cardY + cardH - 48);

  ctx.fillStyle = C.accent;
  ctx.font = font(800, 26);
  const badge = "ไทยช่วยไทย";
  const badgeWidth = ctx.measureText(badge).width;
  ctx.fillText(badge, cardX + cardW - 64 - badgeWidth, cardY + cardH - 48);

  return canvas;
}

export async function shareOrDownloadCard(
  canvas: HTMLCanvasElement,
  payload: SharePayload
): Promise<"shared" | "downloaded"> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("สร้างรูปไม่สำเร็จ");

  const file = new File([blob], "thai-chuay-thai.png", { type: "image/png" });
  const text = `${payload.title} — รัฐช่วย ${baht(payload.govPays)} · คุณจ่าย ${baht(
    payload.youPay
  )}`;

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      files: [file],
      title: "ไทยช่วยไทย",
      text,
    });
    return "shared";
  }

  downloadBlob(blob);
  return "downloaded";
}

export function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `thai-chuay-thai-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
