import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Odil School",
  description: "Odil School — o'quv va baholash platformasi",
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
