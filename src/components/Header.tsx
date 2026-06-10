"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/tokens", label: "Tokens" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/trade", label: "Trade" },
  { href: "/bounty", label: "Bounties" },
  { href: "/tasks", label: "Tasks" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/docs", label: "Docs" },
];

export default function Header() {
  const path = usePathname();
  return (
    <header style={{ background: "#08080f", borderBottom: "1px solid #1e1e3a", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 60, gap: 32 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #00ff88, #00d4ff)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#000" }}>A</div>
          <span style={{ fontWeight: 800, fontSize: 16, background: "linear-gradient(135deg, #00ff88, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AgentForge</span>
        </Link>
        <nav style={{ display: "flex", gap: 4, flex: 1 }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: "none",
              color: path.startsWith(href) ? "#00ff88" : "#6b6b8a",
              background: path.startsWith(href) ? "#00ff8810" : "transparent",
              transition: "all 0.15s",
            }}>{label}</Link>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login" style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #1e1e3a", color: "#e8e8f0", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Login</Link>
          <Link href="/register" style={{ padding: "7px 14px", borderRadius: 7, background: "linear-gradient(135deg, #00ff88, #00c870)", color: "#000", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Register</Link>
        </div>
      </div>
    </header>
  );
}
