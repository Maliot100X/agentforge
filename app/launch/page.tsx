"use client";
import { useState } from "react";

export default function LaunchPage() {
  const [form, setForm] = useState({ name: "", symbol: "", description: "", imageUrl: "", twitter: "", telegram: "", website: "" });
  const [result, setResult] = useState<{ mint?: string; url?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/launch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setResult(await res.json());
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#00ff8810", border: "1px solid #00ff8830", borderRadius: 99, fontSize: 11, color: "#00ff88", fontWeight: 600, marginBottom: 14 }}>⚡ Powered by pump.fun</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 8 }}>Launch Token</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Launch your SPL token on pump.fun. First 3 launches gasless. Earn 65% of trading fees.</p>
      </div>

      {result ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          {result.error ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
              <p style={{ color: "#ff4466" }}>{result.error}</p>
              <button onClick={() => setResult(null)} className="btn-outline" style={{ marginTop: 16 }}>Try Again</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
              <h2 style={{ color: "#00ff88", marginBottom: 8 }}>Token Launched!</h2>
              <p style={{ fontSize: 13, color: "#6b6b8a", marginBottom: 20 }}>Your token is live on pump.fun</p>
              <div style={{ background: "#080810", border: "1px solid #1e1e3a", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "#00d4ff", marginBottom: 16, wordBreak: "break-all" }}>{result.mint}</div>
              <a href={result.url} target="_blank" rel="noopener" className="btn-primary" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 8, textDecoration: "none", color: "#000", fontWeight: 700 }}>View on pump.fun →</a>
            </>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TOKEN NAME *</label>
              <input className="input" placeholder="My Agent Token" value={form.name} onChange={set("name")} required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>SYMBOL *</label>
              <input className="input" placeholder="MAT" value={form.symbol} onChange={set("symbol")} required maxLength={10} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DESCRIPTION</label>
            <textarea className="input" placeholder="Describe your token..." value={form.description} onChange={set("description")} rows={3} style={{ resize: "vertical" }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>IMAGE URL *</label>
            <input className="input" placeholder="https://example.com/image.png" value={form.imageUrl} onChange={set("imageUrl")} required type="url" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TWITTER</label>
              <input className="input" placeholder="@handle" value={form.twitter} onChange={set("twitter")} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TELEGRAM</label>
              <input className="input" placeholder="t.me/..." value={form.telegram} onChange={set("telegram")} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>WEBSITE</label>
              <input className="input" placeholder="https://..." value={form.website} onChange={set("website")} />
            </div>
          </div>
          <div style={{ background: "#00ff8808", border: "1px solid #00ff8820", borderRadius: 8, padding: 12, fontSize: 12, color: "#6b6b8a" }}>
            💡 You earn <strong style={{ color: "#00ff88" }}>65% of all trading fees</strong> from your token forever. No lock-up.
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: 15, padding: "12px 0" }}>
            {loading ? "Launching..." : "🚀 Launch Token"}
          </button>
        </form>
      )}
    </div>
  );
}
