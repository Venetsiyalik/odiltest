import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Montserrat, Nunito } from "next/font/google";
import { saytUrliniOl } from "@/lib/utils/site-url";
import { theme } from "@/lib/theme";
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

// Faqat logotip yonidagi "ODIL SCHOOL" yozuvi uchun (components/ui/Logo.tsx).
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600"],
});

const TAVSIF = "5-11-sinflar uchun o'quv materiallari, ma'ruzalar, prezentatsiyalar va testlar";

export const metadata: Metadata = {
  metadataBase: new URL(saytUrliniOl()),
  title: {
    default: "Odil School — bilim platformasi",
    template: "%s · Odil School",
  },
  description: TAVSIF,
  manifest: "/manifest.json",
  icons: { icon: "/favicon.ico", apple: "/logo-180.png" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    siteName: "Odil School",
    title: "Odil School — bilim platformasi",
    description: TAVSIF,
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Odil School — bilim platformasi",
    description: TAVSIF,
  },
};

export const viewport: Viewport = {
  themeColor: theme.colors.primary,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${nunito.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
