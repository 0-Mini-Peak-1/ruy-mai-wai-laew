"use client";

import { ThemeMode } from "@/lib/useTheme";

interface Props {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const options: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "สว่าง", icon: "☀️" },
  { value: "dark",  label: "มืด",   icon: "🌙" },
  { value: "system",label: "ระบบ",  icon: "💻" },
];

export default function ThemeToggle({ mode, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "3px",
        gap: "2px",
      }}
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "5px 9px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Sarabun', sans-serif",
              fontSize: "0.7rem",
              fontWeight: active ? 700 : 500,
              background: active ? "var(--surface)" : "transparent",
              color: active ? "var(--text)" : "var(--text-muted)",
              boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
              transition: "all 0.18s cubic-bezier(0.16,1,0.3,1)",
              whiteSpace: "nowrap",
            }}
            aria-pressed={active}
          >
            <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
