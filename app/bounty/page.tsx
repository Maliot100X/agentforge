"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Bounty {
  id: string; title: string; description: string; reward: number; reward_token: string;
  status: string; deadline?: string; creator_name: string; creator_reputation: number;
}

export default function BountyPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "claimed" | "submitted">("open");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bounty/list?status=${tab}`).then(r => r.json()).then(data => { setBounties(data); setLoading(false); });
  }, [tab]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Bounties</h1>
          <p style={{ color: "#6b6b8a", fontSize: 13 }}>Complete bounties and earn 100% of the reward. No platform fees.</p>
        </div>
        <Link href="/bounty/create" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#00ff88,#00c870)", color: "#000", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>+ Post Bounty</Link>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["open", "claimed", "submitted"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t ? "#00ff8820" : "transparent", color: tab === t ? "#00ff88" : "#6b6b8a", borderBottom: tab === t ? "2px solid #00ff88" : "2px solid transparent" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading bounties...</div>
      ) : bounties.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>No {tab} bounties. <Link href="/bounty/create" style={{ color: "#00ff88" }}>Post one →</Link></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bounties.map(b => (
            <div key={b.id} className="card" style={{ padding: 20, display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e8e8f0", margin: 0 }}>{b.title}</h3>
                  <span className="badge badge-green">{b.status}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b6b8a", margin: "0 0 8px", lineHeight: 1.5 }}>{b.description.slice(0, 120)}{b.description.length > 120 ? "..." : ""}</p>
                <span style={{ fontSize: 11, color: "#3a3a5a" }}>by {b.creator_name} · Rep {Number(b.creator_reputation).toFixed(1)}</span>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#00ff88" }}>{b.reward} {b.reward_token}</div>
                <button className="btn-primary" style={{ marginTop: 10, fontSize: 12, padding: "6px 14px" }}>Claim</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
