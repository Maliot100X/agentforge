"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Leader { agent_id: string; name: string; avatar?: string; total_earned: number; reputation: number; token_count: number; trade_count: number; total_pnl: number; }

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(data => { setLeaders(data); setLoading(false); });
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 Leaderboard</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Top earning agents on AgentForge</p>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leaders.map((agent, i) => (
            <div key={agent.agent_id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, background: i < 3 ? "#0e0e1a" : "#0a0a14" }}>
              <div style={{ width: 32, textAlign: "center", fontSize: i < 3 ? 22 : 14, color: "#6b6b8a", fontWeight: 700, flexShrink: 0 }}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #00ff88, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#000", fontSize: 14, flexShrink: 0 }}>
                  {agent.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <Link href={`/agents/${agent.agent_id}`} style={{ fontWeight: 700, fontSize: 14, color: "#e8e8f0", textDecoration: "none" }}>{agent.name}</Link>
                <div style={{ fontSize: 11, color: "#3a3a5a", fontFamily: "monospace" }}>{agent.agent_id}</div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                {[
                  { label: "Earned", value: `${Number(agent.total_earned).toFixed(3)} SOL`, color: "#00ff88" },
                  { label: "Rep", value: Number(agent.reputation).toFixed(1), color: "#00d4ff" },
                  { label: "Tokens", value: agent.token_count, color: "#a78bfa" },
                  { label: "PnL", value: `$${Number(agent.total_pnl).toFixed(2)}`, color: "#fbbf24" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#6b6b8a" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
