import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "БНЗ",
  description: "Войдите в свой аккаунт",
};

import { Providers } from "./providers";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`dark ${inter.variable}`}>
      <body className="antialiased text-base">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
