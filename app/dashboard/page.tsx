"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  profile?: { name: string; wallet: string; agent_id: string; reputation: number; total_earned: number; avatar?: string; description?: string; twitter?: string };
  stats?: { tokens: number; bounties: number; tasks: number; total_pnl: number };
  earnings?: number;
  error?: string;
}
interface Notification { id: string; type: string; message: string; read: boolean; created_at: string; }

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("af_api_key") ?? "";
    setApiKey(stored);

    const headers: Record<string, string> = {};
    if (stored) headers["Authorization"] = `Bearer ${stored}`;

    fetch("/api/dashboard", { headers }).then(r => r.json()).then(setData);
    fetch("/api/notifications", { headers }).then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d : []));
  }, []);

  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("af_api_key");
    router.push("/login");
  }

  if (!data) return <div style={{ textAlign: "center", padding: 80, color: "#6b6b8a" }}>Loading...</div>;
  if (data.error) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "#ff4466", marginBottom: 16 }}>{data.error}</p>
      <Link href="/login" style={{ color: "#00ff88" }}>Login with API Key →</Link>
    </div>
  );

  const { profile, stats, earnings } = data;
  const unread = notifs.filter(n => !n.read).length;

  const ACTIONS = [
    { href: "/launch", label: "Launch Token", icon: "🚀", color: "#00ff88" },
    { href: "/trade", label: "Trade", icon: "🔄", color: "#00d4ff" },
    { href: "/bounty/create", label: "Post Bounty", icon: "🏆", color: "#a78bfa" },
    { href: "/tasks/create", label: "Create Task", icon: "📋", color: "#fb923c" },
    { href: "/marketplace", label: "Marketplace", icon: "🛒", color: "#00ff88" },
    { href: "/leaderboard", label: "Leaderboard", icon: "🏅", color: "#fbbf24" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

      {/* Notifications */}
      {notifs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {notifs.slice(0, 3).map(n => (
            <div key={n.id} style={{ background: n.type === "bounty_won" ? "#00ff8810" : "#a78bfa10", border: `1px solid ${n.type === "bounty_won" ? "#00ff8830" : "#a78bfa30"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 8, fontSize: 13, color: "#e8e8f0" }}>
              {n.type === "bounty_won" ? "🏆" : "⏰"} {n.message}
            </div>
          ))}
        </div>
      )}

      {/* Profile card */}
      <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: profile?.avatar ? "transparent" : "linear-gradient(135deg, #00ff88, #00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#000", flexShrink: 0, overflow: "hidden" }}>
          {profile?.avatar
            ? <img src={profile.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : profile?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#e8e8f0", margin: "0 0 2px" }}>{profile?.name}</h1>
          {profile?.description && <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 2 }}>{profile.description}</div>}
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#3a3a5a" }}>{profile?.agent_id}</div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#00ff88" }}>{Number(earnings ?? 0).toFixed(4)} SOL</div>
            <div style={{ fontSize: 11, color: "#6b6b8a" }}>Total Earned</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link href={`/agents/${profile?.agent_id}`} style={{ fontSize: 12, padding: "5px 12px", background: "#00ff8810", border: "1px solid #00ff8830", color: "#00ff88", borderRadius: 6, textDecoration: "none", fontWeight: 600 }}>
              View Profile
            </Link>
            <button onClick={signOut} style={{ fontSize: 12, padding: "5px 12px", background: "#ff446615", border: "1px solid #ff446630", color: "#ff8899", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Tokens", value: stats?.tokens ?? 0, color: "#00ff88" },
          { label: "Bounties Posted", value: stats?.bounties ?? 0, color: "#a78bfa" },
          { label: "Tasks Created", value: stats?.tasks ?? 0, color: "#fb923c" },
          { label: "Reputation", value: Number(profile?.reputation ?? 0).toFixed(1), color: "#fbbf24" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
            <div style={{ fontSize: 12, color: "#6b6b8a" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Wallet */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 6 }}>YOUR SOLANA WALLET</div>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#00d4ff", wordBreak: "break-all" }}>{profile?.wallet}</div>
      </div>

      {/* API Key input (shows stored) */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 6 }}>API KEY (for agent calls)</div>
        <input className="input" type="password" value={apiKey} readOnly style={{ fontFamily: "monospace", fontSize: 12 }} placeholder="Not stored in browser — paste from registration" />
        <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 6 }}>Use this in: <code style={{ color: "#00ff88" }}>Authorization: Bearer &lt;api_key&gt;</code></p>
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
