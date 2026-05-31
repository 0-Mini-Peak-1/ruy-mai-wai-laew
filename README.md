# 🇹🇭 ไทยช่วยไทย — เครื่องคำนวณค่าใช้จ่าย

A mobile-first Next.js app for calculating and tracking personal spending under Thailand's **ไทยช่วยไทย** government subsidy programme, which splits purchases 60% (government) / 40% (individual) via the เป๋าตังค์ e-wallet.

---

## Features

- **Split calculator** — Enter any price and instantly see how much the government pays vs. how much you pay, accounting for remaining daily and monthly caps
- **Limit tracking** — Visual progress bars for your ฿200/day and ฿1,000/month government allowance with real-time remaining balance shown in the header
- **Exceeded alerts** — Clear banners when you've hit your daily or monthly cap, and an explanation when the government pays less than 60% due to a cap
- **Purchase history** — All records persisted in `localStorage`, grouped by date, with per-day summaries and individual delete
- **Theme toggle** — Light / Dark / System (follows OS preference) with smooth transition, preference saved across sessions
- **Guide tab** — In-app explainer covering the programme rules, payment ratio, limits, and examples

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Font | Sarabun (Google Fonts) — Thai/Latin |
| State | React `useState` / `useCallback` |
| Persistence | Browser `localStorage` |
| Icons | Inline SVG |

No external UI library, no database, no auth — intentionally lightweight and self-contained.

---

## Project Structure

```
thai-chuay-thai/
├── app/
│   ├── globals.css          # CSS variables (light + dark), utility classes, animations
│   ├── globals.d.ts         # TypeScript declaration for CSS imports
│   ├── layout.tsx           # Root layout — metadata, viewport, font
│   └── page.tsx             # Main shell — tab state, purchase state, header, bottom nav
│
├── components/
│   ├── Calculator.tsx       # Tab 1: price input, split result, save flow
│   ├── History.tsx          # Tab 2: purchase log grouped by date
│   ├── Guide.tsx            # Tab 3: programme explainer
│   └── ThemeToggle.tsx      # Light / Dark / System segmented control
│
├── lib/
│   ├── store.ts             # Types, constants (limits/ratio), calc logic, localStorage helpers
│   └── useTheme.ts          # Theme hook — reads/writes preference, applies .dark class
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

### Install & Run

```bash
# 1. Unzip or clone the project
unzip thai-chuay-thai.zip
cd thai-chuay-thai

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## Configuration

All programme constants live in **`lib/store.ts`** — change them in one place and the whole app updates:

```ts
export const DAILY_LIMIT   = 200;   // ฿ government pays per day (max)
export const MONTHLY_LIMIT = 1000;  // ฿ government pays per month (max)
export const GOV_RATIO     = 0.6;   // 60% government share
```

---

## How the Calculation Works

Given a purchase price `P` and remaining caps `dayRem` / `monthRem`:

```
govPays = min(P × 0.6,  dayRem,  monthRem,  P)
youPay  = P − govPays
```

This means:
- If you have plenty of allowance left → government pays exactly 60%
- If your daily cap is nearly exhausted → government pays whatever remains (could be less than 60%)
- If either cap is at ฿0 → government pays nothing, you pay 100%

The app shows a warning when the government pays less than the full 60% so you know why.

---

## Dark Mode

The theme toggle (top-right of the header) cycles between three modes:

| Mode | Behaviour |
|---|---|
| ☀️ สว่าง | Always light |
| 🌙 มืด | Always dark |
| 💻 ระบบ | Follows OS `prefers-color-scheme` (default) |

Preference is saved to `localStorage` under the key `thai-chuay-thai-theme` and applied immediately on page load with no flash.

---

## Data & Privacy

All data (purchases, theme preference) is stored entirely in the browser's `localStorage`. Nothing is sent to any server. Clearing site data in your browser will erase all records.

---

## Disclaimer

This app is an unofficial personal finance tool and is not affiliated with or endorsed by the Thai government, Krungthai Bank, or the เป๋าตังค์ platform. Actual subsidy amounts depend on the official เป๋าตังค์ system.
