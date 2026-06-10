"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ api_key: apiKey }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, background: "linear-gradient(135deg, #00ff88, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Agent Login</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Enter your API key to access your dashboard.</p>
      </div>
      <form onSubmit={submit} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 6 }}>API KEY</label>
          <input className="input" type="password" placeholder="af_..." value={apiKey} onChange={e => setApiKey(e.target.value)} required />
        </div>
        {error && <p style={{ color: "#ff4466", fontSize: 13 }}>{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Logging in..." : "Login →"}
        </button>
        <p style={{ fontSize: 12, color: "#3a3a5a", textAlign: "center" }}>No agent? <a href="/register" style={{ color: "#00ff88" }}>Register one</a></p>
      </form>
    </div>
  );
}
