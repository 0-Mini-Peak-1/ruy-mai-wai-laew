# 🇹🇭 ไทยช่วยไทย — เครื่องคำนวณค่าใช้จ่าย

A mobile-first Next.js app for calculating and tracking personal spending under Thailand's **ไทยช่วยไทย** government subsidy programme, which splits purchases 60% (government) / 40% (individual) via the เป๋าตังค์ e-wallet.

**Live:** https://ruy-mai-wai-laew.vercel.app/

---

## Features

- **Live split calculator** — Type a price and instantly see how much the government pays vs. how much you pay, accounting for remaining daily and monthly caps (no "calculate" button needed)
- **Visual 60/40 split bar** — A single animated bar makes the ratio understandable at a glance
- **Limit tracking** — Visual progress bars for your ฿200/day and ฿1,000/month government allowance with real-time remaining balance shown in the header
- **Smart cap hint** — Tells you the maximum price that still gets the full 60% given your remaining allowance
`- **Purchase history** — All records persisted in `localStorage`, grouped by date, with per-day summaries, delete + undo, and a 7-day spend chart
`- **Share cards** — Generate a 1080×1080 PNG for any purchase or a monthly summary, then share it to LINE or download it (Web Share API with download fallback)
- **Streaks & lifetime totals** — See how many consecutive days you've used the programme and how much the government has contributed overall
- **Theme toggle** — Light / Dark / System (follows OS preference) with a flash-free first paint
- **Guide tab** — In-app explainer covering the programme rules, payment ratio, limits, and examples
- **Installable PWA** — Add to home screen, offline support via a service worker, and app shortcuts
- **Desktop dashboard** — Calculator and history sit side by side on wide screens; mobile keeps the bottom-tab layout
- **Shareable link previews** — Dynamic OpenGraph/Twitter images with Thai typography

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Font | Sarabun via `next/font` (self-hosted, Thai/Latin) |
| State | React `useState` / `useCallback` |
| Persistence | Browser `localStorage` |
| Sharing | Canvas 2D + Web Share API |
| Offline | Hand-rolled service worker + web manifest |
| Icons | Inline SVG |

No external UI library, no database, no auth — intentionally lightweight and self-contained.

---

## Project Structure

```
thai-chuay-thai/
├── app/
│   ├── globals.css               # CSS variables (light + dark), utilities, desktop layout
│   ├── globals.d.ts              # TypeScript declaration for CSS imports
│   ├── layout.tsx                # Root layout — metadata, viewport, theme script, font
│   ├── page.tsx                  # App shell — tabs, state, responsive dashboard
│   ├── opengraph-image.tsx       # 1200×630 social preview (next/og)
│   ├── twitter-image.tsx         # Twitter card (reuses the OG image)
│   ├── robots.ts                 # robots.txt
│   ├── sitemap.ts                # sitemap.xml
│   └── fonts/Sarabun-Bold.ttf    # Font used to render the OG image
│
├── components/
│   ├── Calculator.tsx            # Live price input, split result, save flow
│   ├── History.tsx               # Purchase log, 7-day chart, undo, share buttons
│   ├── Guide.tsx                 # Programme explainer
│   ├── SplitBar.tsx              # Animated 60/40 bar
│   ├── ShareCard.tsx             # Share-card modal (preview / share / download)
│   ├── ThemeToggle.tsx           # Light / Dark / System segmented control
│   └── ServiceWorkerRegister.tsx # Registers the offline worker in production
│
├── lib/
│   ├── store.ts                  # Types, limits, local-date helpers, calc + storage
│   ├── format.ts                 # Thai currency/date/time formatting
│   ├── shareCard.ts              # Canvas renderer + Web Share/download helpers
│   ├── useTheme.ts               # Theme hook — reads/writes preference
│   └── useCountUp.ts             # Animated number hook (reduced-motion aware)
│
├── public/
│   ├── manifest.json             # PWA manifest + shortcuts
│   ├── sw.js                     # Offline cache (production only)
│   └── icon-*.png                # App icons
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

## Share Cards

Every purchase row and the monthly summary have a share button. The card is rendered locally on a `<canvas>` (no image service), so it works offline and includes Thai typography. On mobile, `navigator.share()` opens the native share sheet with the PNG attached; on desktop it falls back to a download.

---

## PWA & Offline

- `public/manifest.json` declares standalone display, icons, and app shortcuts (`/?tab=calc`, `/?tab=history`)
- `public/sw.js` caches the app shell and hashed Next.js bundles on install, then uses network-first for navigations and stale-while-revalidate for static assets
- The worker is registered only in production builds (`components/ServiceWorkerRegister.tsx`)
- After the first visit, the app reloads and works without a network connection

To invalidate the cache after a deploy, bump `CACHE` in `public/sw.js` (e.g. `thai-chuay-thai-v2`).

---

## Deploy

The app is deployed on Vercel at https://ruy-mai-wai-laew.vercel.app/.

`metadataBase` is set in `app/layout.tsx`; update it if you deploy to a different domain. The OpenGraph image is generated at build time with `next/og` and a bundled Sarabun font.

---

## Data & Privacy

All data (purchases, theme preference) is stored entirely in the browser's `localStorage`. Nothing is sent to any server. Clearing site data in your browser will erase all records.

---

## Disclaimer

This app is an unofficial personal finance tool and is not affiliated with or endorsed by the Thai government, Krungthai Bank, or the เป๋าตังค์ platform. Actual subsidy amounts depend on the official เป๋าตังค์ system.
