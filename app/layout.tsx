import type { Metadata, Viewport } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sarabun",
  display: "swap",
});

const SITE_URL = "https://ruy-mai-wai-laew.vercel.app";
const TITLE = "ไทยช่วยไทย — คำนวณค่าใช้จ่าย 60:40";
const DESCRIPTION =
  "คำนวณส่วนที่รัฐบาลช่วยจ่าย 60% และคุณจ่าย 40% พร้อมติดตามวงเงิน ฿200/วัน และ ฿1,000/เดือน บันทึกประวัติ และแชร์การ์ดสวย ๆ";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "ไทยช่วยไทย",
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon-32.png"],
  },
  appleWebApp: {
    capable: true,
    title: "ไทยช่วยไทย",
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: "/",
    siteName: "ไทยช่วยไทย",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  formatDetection: { telephone: false },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0d" },
  ],
};

// Runs before first paint so dark-mode users never see a white flash.
const themeScript = `(function(){try{var m=localStorage.getItem('thai-chuay-thai-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={sarabun.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
