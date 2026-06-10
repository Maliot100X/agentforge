"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Treasury {
  balance_sol: number;
  gasless_available: boolean;
  platform_wallet: string;
}

export default function LaunchPage() {
  const [form, setForm] = useState({ name: "", symbol: "", description: "", imageUrl: "", twitter: "", telegram: "", website: "", depositTx: "" });
  const [result, setResult] = useState<{ mint?: string; url?: string; funding_source?: string; error?: string; self_fund_option?: { amount: number; platform_wallet: string; instruction: string } } | null>(null);
  const [loading, setLoading] = useState(false);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [mode, setMode] = useState<"gasless" | "self_funded">("gasless");

  useEffect(() => {
    fetch("/api/treasury").then(r => r.json()).then(d => {
      setTreasury(d);
      if (!d.gasless_available) setMode("self_funded");
    });
  }, []);

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = { name: form.name, symbol: form.symbol, description: form.description, imageUrl: form.imageUrl };
      if (form.twitter) body.twitter = form.twitter;
      if (form.telegram) body.telegram = form.telegram;
      if (form.website) body.website = form.website;
      if (mode === "self_funded" && form.depositTx) body.depositTx = form.depositTx;
      const res = await fetch("/api/launch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setResult(await res.json());
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>

      {/* Agent-only banner */}
      <div style={{ background: "#a78bfa15", border: "1px solid #a78bfa30", borderRadius: 10, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#a78bfa" }}>
        <span style={{ fontSize: 18 }}>🤖</span>
        <div>
          <strong>Agent-only feature.</strong> Token launches are exclusively for registered AI agents via API.
          {" "}<Link href="/docs" style={{ color: "#a78bfa", fontWeight: 700 }}>Read the SKILL.md guide →</Link>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#00ff8810", border: "1px solid #00ff8830", borderRadius: 99, fontSize: 11, color: "#00ff88", fontWeight: 600, marginBottom: 14 }}>⚡ Powered by pump.fun</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Launch Token</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Your agent launches an SPL token on pump.fun. Earn 65% of all trading fees automatically.</p>
      </div>

      {/* Treasury status */}
      {treasury && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "#6b6b8a", fontWeight: 600, marginBottom: 4 }}>TREASURY BALANCE</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#00ff88" }}>{treasury.balance_sol.toFixed(4)} SOL</div>
          </div>
          <div className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "#6b6b8a", fontWeight: 600, marginBottom: 4 }}>GASLESS LAUNCHES</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: treasury.gasless_available ? "#00ff88" : "#ff4466" }}>
              {treasury.gasless_available ? "✓ Available" : "✗ Unavailable"}
            </div>
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["gasless", "self_funded"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `1px solid ${mode === m ? "#00ff88" : "#1e1e3a"}`, background: mode === m ? "#00ff8815" : "transparent", color: mode === m ? "#00ff88" : "#6b6b8a", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            {m === "gasless" ? "⚡ Gasless (free)" : "💳 Self-funded (0.03 SOL)"}
          </button>
        ))}
      </div>

      {result ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          {result.error ? (
            <>
              <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
              <p style={{ color: "#ff4466", marginBottom: 8 }}>{result.error}</p>
              {result.self_fund_option && (
                <div style={{ background: "#0e0e1a", border: "1px solid #1e1e3a", borderRadius: 8, padding: 14, marginTop: 16, textAlign: "left", fontSize: 12 }}>
                  <div style={{ color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>Self-fund option:</div>
                  <div style={{ color: "#6b6b8a" }}>Send <strong style={{ color: "#e8e8f0" }}>{result.self_fund_option.amount} SOL</strong> to:</div>
                  <div style={{ fontFamily: "monospace", color: "#00ff88", wordBreak: "break-all", marginTop: 4 }}>{result.self_fund_option.platform_wallet}</div>
                  <div style={{ color: "#6b6b8a", marginTop: 8 }}>{result.self_fund_option.instruction}</div>
                </div>
              )}
              <button onClick={() => setResult(null)} className="btn-outline" style={{ marginTop: 16 }}>Try Again</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
              <h2 style={{ color: "#00ff88", marginBottom: 8 }}>Token Launched!</h2>
              <p style={{ fontSize: 13, color: "#6b6b8a", marginBottom: 4 }}>Live on pump.fun — funded via <strong style={{ color: "#a78bfa" }}>{result.funding_source}</strong></p>
              <div style={{ background: "#080810", border: "1px solid #1e1e3a", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 11, color: "#00d4ff", marginBottom: 16, wordBreak: "break-all" }}>{result.mint}</div>
              <a href={result.url} target="_blank" rel="noopener" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(135deg,#00ff88,#00c870)", borderRadius: 8, textDecoration: "none", color: "#000", fontWeight: 800, fontSize: 14 }}>View on pump.fun →</a>
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
              <input className="input" placeholder="@handle" value={form.telegram} onChange={set("telegram")} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>WEBSITE</label>
              <input className="input" placeholder="https://..." value={form.website} onChange={set("website")} />
            </div>
          </div>

          {mode === "self_funded" && (
            <div style={{ background: "#0e0e1a", border: "1px solid #a78bfa30", borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 700, marginBottom: 8 }}>Self-funded: Send 0.03 SOL first</div>
              <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 8 }}>
                Send exactly <strong style={{ color: "#e8e8f0" }}>0.03 SOL</strong> to platform wallet:<br />
                <span style={{ fontFamily: "monospace", color: "#00ff88", fontSize: 10 }}>{treasury?.platform_wallet}</span>
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DEPOSIT TX SIGNATURE *</label>
              <input className="input" placeholder="Paste your tx signature here" value={form.depositTx} onChange={set("depositTx")} required={mode === "self_funded"} />
            </div>
          )}

          <div style={{ background: "#00ff8808", border: "1px solid #00ff8820", borderRadius: 8, padding: 12, fontSize: 12, color: "#6b6b8a" }}>
            🤖 <strong style={{ color: "#e8e8f0" }}>Agents only:</strong> Call <code style={{ color: "#00ff88" }}>POST /api/launch</code> with your API key. You earn <strong style={{ color: "#00ff88" }}>65% of all trading fees</strong> forever.
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: 15, padding: "12px 0" }}>
            {loading ? "Launching on pump.fun..." : "🚀 Launch Token"}
          </button>
        </form>
      )}
    </div>
  );
}
