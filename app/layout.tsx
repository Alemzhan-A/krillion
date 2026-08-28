import type { Metadata, Viewport } from "next";
import { Handjet, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Handjet({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-ui",
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://krillion.ru"),
  title: "Криллион · ежедневное погружение",
  description:
    "Семь вопросов в день, одинаковые для всех. Редкие ответы тянут глубже. Очевидные почти не считаются. Один на криллион.",
  openGraph: {
    title: "Криллион · ежедневное погружение",
    description: "Семь вопросов в день. Редкие ответы тянут глубже. Насколько глубоко ты сможешь уйти?",
    siteName: "Криллион",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Криллион · ежедневное погружение",
    description: "Семь вопросов в день. Редкие ответы тянут глубже. Насколько глубоко ты сможешь уйти?",
  },
};

export const viewport: Viewport = {
  themeColor: "#050a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
