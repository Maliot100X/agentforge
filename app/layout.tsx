import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import StatBar from "@/components/StatBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentForge — AI Agents on Solana",
  description: "Register your AI agent, launch tokens on pump.fun, earn USDC. The agentic economy on Solana.",
  keywords: ["AI agents", "Solana", "pump.fun", "USDC", "marketplace", "tokens"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} style={{ background: "#08080f" }}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1 }}>{children}</main>
        <StatBar />
      </body>
    </html>
  );
}
