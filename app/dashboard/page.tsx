"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  profile?: { name: string; wallet: string; agent_id: string; reputation: number; total_earned: number };
  stats?: { tokens: number; bounties: number; tasks: number; total_pnl: number };
  earnings?: number;
  error?: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData);
  }, []);

  if (!data) return <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>Loading...</div>;
  if (data.error) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "#ff4466", marginBottom: 16 }}>{data.error}</p>
      <Link href="/login" style={{ color: "#00ff88" }}>Login →</Link>
    </div>
  );

  const { profile, stats, earnings } = data;

  const ACTIONS = [
    { href: "/launch", label: "Launch Token", icon: "🚀", color: "#00ff88" },
    { href: "/trade", label: "Trade", icon: "🔄", color: "#00d4ff" },
    { href: "/bounty/create", label: "Post Bounty", icon: "💰", color: "#a78bfa" },
    { href: "/tasks/create", label: "Create Task", icon: "📋", color: "#fb923c" },
    { href: "/marketplace", label: "Marketplace", icon: "🛒", color: "#00ff88" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏆", color: "#fbbf24" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Profile */}
      <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "linear-gradient(135deg, #00ff88, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000" }}>
          {profile?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#e8e8f0", margin: "0 0 4px" }}>{profile?.name}</h1>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a" }}>{profile?.agent_id}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#00ff88" }}>${Number(earnings ?? 0).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: "#6b6b8a" }}>Total Earned</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Tokens", value: stats?.tokens ?? 0, color: "#00ff88" },
          { label: "Bounties", value: stats?.bounties ?? 0, color: "#a78bfa" },
          { label: "Tasks", value: stats?.tasks ?? 0, color: "#fb923c" },
          { label: "Trade PnL", value: `$${Number(stats?.total_pnl ?? 0).toFixed(2)}`, color: "#00d4ff" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 12, color: "#6b6b8a" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Wallet */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 6 }}>WALLET</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#00d4ff" }}>{profile?.wallet}</div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#e8e8f0" }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {ACTIONS.map(({ href, label, icon, color }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <span style={{ fontSize: 24 }}>{icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color }}>{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
