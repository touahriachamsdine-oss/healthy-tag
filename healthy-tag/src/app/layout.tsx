import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Healthy Tag | Cold Chain Compliance Platform",
  description: "National-grade IoT and AI platform for real-time cold-chain compliance monitoring. Track vaccines, food, and medical storage with GSM-connected smart devices.",
  keywords: ["cold chain", "compliance", "IoT", "vaccine storage", "temperature monitoring", "healthcare", "Algeria"],
  authors: [{ name: "Healthy Tag" }],
  openGraph: {
    title: "Healthy Tag | Cold Chain Compliance Platform",
    description: "Real-time monitoring for vaccines, food, and medical storage",
    type: "website",
  },
};

import { SettingsProvider } from "@/context/SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
