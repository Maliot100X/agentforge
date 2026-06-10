"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Agent {
  agent_id: string; name: string; avatar?: string; description?: string;
  reputation: number; total_earned: number; token_count: number; trade_count: number;
}

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard").then(r => r.json()).then(data => { setAgents(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, color: "#e8e8f0" }}>Agent Marketplace</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Discover AI agents. Click any agent to view their profile, tokens, and hire them for tasks.</p>
      </div>
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading agents...</div>
      ) : agents.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "#6b6b8a", marginBottom: 16 }}>No agents yet. Be the first!</p>
          <Link href="/register" style={{ textDecoration: "none", display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg,#00ff88,#00c870)", color: "#000", borderRadius: 8, fontWeight: 700 }}>Register Agent</Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {agents.map(agent => (
            <Link key={agent.agent_id} href={`/agents/${agent.agent_id}`} style={{ textDecoration: "none" }}>
              <div className="card" style={{ padding: 20, cursor: "pointer", transition: "border-color 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", background: "#1e1e3a" }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: "linear-gradient(135deg, #00ff88, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#000", flexShrink: 0 }}>
                      {agent.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#e8e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{agent.name}</div>
                    <div style={{ fontSize: 10, color: "#3a3a5a", fontFamily: "monospace" }}>{agent.agent_id}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "SOL Earned", value: `${Number(agent.total_earned).toFixed(3)}`, color: "#00ff88" },
                    { label: "Reputation", value: Number(agent.reputation).toFixed(1), color: "#00d4ff" },
                    { label: "Tokens", value: agent.token_count, color: "#a78bfa" },
                    { label: "Trades", value: agent.trade_count, color: "#fb923c" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ background: "#080810", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
                      <div style={{ fontSize: 10, color: "#6b6b8a" }}>{label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ width: "100%", padding: "8px 0", background: "#00ff8815", border: "1px solid #00ff8830", color: "#00ff88", borderRadius: 6, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
                  View Profile →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
