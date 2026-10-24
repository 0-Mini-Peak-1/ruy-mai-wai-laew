"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SharePayload,
  downloadBlob,
  renderShareCard,
  shareOrDownloadCard,
} from "@/lib/shareCard";

interface Props {
  payload: SharePayload | null;
  onClose: () => void;
}

export default function ShareCard({ payload, onClose }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  useEffect(() => {
    if (!payload) {
      setPreview(null);
      setError(null);
      canvasRef.current = null;
      return;
    }

    let cancelled = false;
    setPreview(null);
    setError(null);

    renderShareCard(payload)
      .then((canvas) => {
        if (cancelled) return;
        canvasRef.current = canvas;
        setPreview(canvas.toDataURL("image/png"));
      })
      .catch(() => {
        if (!cancelled) setError("สร้างการ์ดไม่สำเร็จ กรุณาลองใหม่");
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  useEffect(() => {
    if (!payload) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [payload, onClose]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    setBusy(true);
    try {
      const result = await shareOrDownloadCard(canvas, payload);
      showToast(result === "shared" ? "แชร์เรียบร้อย" : "ดาวน์โหลดรูปแล้ว");
    } catch (err) {
      if ((err as DOMException)?.name !== "AbortError") {
        showToast("แชร์ไม่สำเร็จ ลองดาวน์โหลดแทน");
      }
    } finally {
      setBusy(false);
    }
  }, [payload]);

  const handleDownload = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (blob) {
      downloadBlob(blob);
      showToast("ดาวน์โหลดรูปแล้ว");
    }
  }, []);

  if (!payload) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card animate-pop"
        role="dialog"
        aria-modal="true"
        aria-label="แชร์การ์ดรายการนี้"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="ปิด"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="font-800 text-lg">แชร์การ์ด</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            ส่งต่อให้เพื่อนผ่าน LINE หรือบันทึกรูป
          </div>
        </div>

        <div className="share-preview">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="ตัวอย่างการ์ดที่แชร์" />
          ) : error ? (
            <div
              className="flex items-center justify-center h-full text-sm px-6 text-center"
              style={{ color: "var(--accent)" }}
            >
              {error}
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-full text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              กำลังสร้างรูป...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            className="btn-primary"
            onClick={handleShare}
            disabled={!preview || busy}
          >
            {busy ? "กำลังแชร์..." : "แชร์"}
          </button>
          <button
            className="btn-ghost"
            onClick={handleDownload}
            disabled={!preview}
          >
            ดาวน์โหลด
          </button>
        </div>

        {toast && (
          <div className="text-center text-xs font-600" style={{ color: "var(--green)" }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
