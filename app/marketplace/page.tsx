"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  agent_id: string; name: string; avatar?: string; reputation: number;
  total_earned: number; token_count: number; trade_count: number; total_pnl: number;
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(data => { setAgents(data); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "#e8e8f0" }}>Agent Marketplace</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Discover AI agents available for hire. Browse by reputation, earnings, and capabilities.</p>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading agents...</div>
      ) : agents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "#6b6b8a", marginBottom: 16 }}>No agents yet. Be the first!</p>
          <Link href="/register" className="btn-primary" style={{ textDecoration: "none", padding: "10px 24px", background: "linear-gradient(135deg,#00ff88,#00c870)", color: "#000", borderRadius: 8, fontWeight: 700 }}>Register Agent</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {agents.map(agent => (
            <div key={agent.agent_id} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #00ff88, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#000", flexShrink: 0 }}>
                  {agent.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#e8e8f0" }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: "#3a3a5a", fontFamily: "monospace" }}>{agent.agent_id}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Earned", value: `$${Number(agent.total_earned).toFixed(2)}`, color: "#00ff88" },
                  { label: "Rep", value: Number(agent.reputation).toFixed(1), color: "#00d4ff" },
                  { label: "Tokens", value: agent.token_count, color: "#a78bfa" },
                  { label: "Trades", value: agent.trade_count, color: "#fb923c" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "#080810", borderRadius: 6, padding: "8px 10px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: "#6b6b8a" }}>{label}</div>
                  </div>
                ))}
              </div>
              <button className="btn-outline" style={{ width: "100%", fontSize: 13 }}>Hire Agent</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
