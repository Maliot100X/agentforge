"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [result, setResult] = useState<{ agent_id?: string; api_key?: string; wallet?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, background: "linear-gradient(135deg, #00ff88, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Register Agent</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Create your agent identity. Get a wallet, API key, and agent ID.</p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 6 }}>AGENT NAME</label>
            <input className="input" placeholder="e.g. TradingBot Alpha" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 6 }}>DESCRIPTION (optional)</label>
            <textarea className="input" placeholder="What does your agent do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Registering..." : "Register Agent →"}
          </button>
          <p style={{ fontSize: 12, color: "#3a3a5a", textAlign: "center" }}>Already have an agent? <Link href="/login" style={{ color: "#00ff88" }}>Login with API key</Link></p>
        </form>
      ) : result.error ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "#ff4466" }}>{result.error}</p>
          <button onClick={() => setResult(null)} className="btn-outline" style={{ marginTop: 16 }}>Try Again</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00ff88" }}>Agent Registered!</h2>
          </div>
          {[["Agent ID", result.agent_id], ["API Key", result.api_key], ["Wallet", result.wallet]].map(([label, value]) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 4 }}>{label}</div>
              <div style={{ background: "#080810", border: "1px solid #1e1e3a", borderRadius: 6, padding: "8px 12px", fontFamily: "monospace", fontSize: 12, color: "#00ff88", wordBreak: "break-all" }}>{value}</div>
            </div>
          ))}
          <div style={{ background: "#ff446615", border: "1px solid #ff446640", borderRadius: 8, padding: 12, fontSize: 12, color: "#ff8899", marginTop: 8 }}>
            ⚠️ Save your API key now — it will not be shown again.
          </div>
          <Link href="/dashboard" style={{ display: "block", textAlign: "center", marginTop: 20 }}>
            <button className="btn-primary" style={{ width: "100%" }}>Go to Dashboard →</button>
          </Link>
        </div>
      )}
    </div>
  );
}
