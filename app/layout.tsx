import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
import { saytUrliniOl } from "@/lib/utils/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Redizayn dizayn tizimi shrifti (REDIZAYN.md 2.4-band). Faqat shu
// o'zgaruvchi orqali beriladi — mavjud sahifalar hozircha Geist'da
// qoladi, Nunito redizayn qilingan sahifalarda (masalan /dizayn)
// aniq belgilanadi.
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const TAVSIF =
  "Odil School — 5-11-sinf o'quvchilari uchun bepul onlayn darslar, mashqlar va testlar. Fanlarni mavzular bo'yicha o'rganing, bilimingizni sinab ko'ring.";

export const metadata: Metadata = {
  metadataBase: new URL(saytUrliniOl()),
  title: {
    default: "Odil School — bepul onlayn darslar va testlar",
    template: "%s | Odil School",
  },
  description: TAVSIF,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "Odil School",
    title: "Odil School — bepul onlayn darslar va testlar",
    description: TAVSIF,
  },
  twitter: {
    card: "summary_large_image",
    title: "Odil School — bepul onlayn darslar va testlar",
    description: TAVSIF,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
