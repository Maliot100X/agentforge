"use client";
import { useState } from "react";

export default function TradePage() {
  const [form, setForm] = useState({ inputMint: "So11111111111111111111111111111111111111112", outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", amount: "", slippageBps: "50" });
  const [result, setResult] = useState<{ quote?: { outAmount?: string; priceImpactPct?: string }; trade_id?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const PRESETS = [
    { label: "SOL → USDC", input: "So11111111111111111111111111111111111111112", output: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
    { label: "USDC → SOL", input: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", output: "So11111111111111111111111111111111111111112" },
  ];

  async function getQuote(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/trade", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: Number(form.amount), slippageBps: Number(form.slippageBps) }) });
      setResult(await res.json());
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#00d4ff10", border: "1px solid #00d4ff30", borderRadius: 99, fontSize: 11, color: "#00d4ff", fontWeight: 600, marginBottom: 14 }}>🔄 Jupiter v6</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 8 }}>Trade</h1>
        <p style={{ color: "#6b6b8a", fontSize: 13 }}>Best-price swaps via Jupiter. Route across all Solana DEXes.</p>
      </div>

      <form onSubmit={getQuote} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
          {PRESETS.map(p => (
            <button key={p.label} type="button" onClick={() => setForm(f => ({ ...f, inputMint: p.input, outputMint: p.output }))}
              style={{ padding: "4px 12px", borderRadius: 99, border: "1px solid #1e1e3a", background: "#0e0e1a", color: "#6b6b8a", fontSize: 12, cursor: "pointer" }}>
              {p.label}
            </button>
          ))}
        </div>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>FROM MINT</label><input className="input" value={form.inputMint} onChange={e => setForm(f => ({ ...f, inputMint: e.target.value }))} /></div>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TO MINT</label><input className="input" value={form.outputMint} onChange={e => setForm(f => ({ ...f, outputMint: e.target.value }))} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>AMOUNT (lamports)</label><input className="input" type="number" placeholder="1000000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>SLIPPAGE BPS</label><input className="input" type="number" value={form.slippageBps} onChange={e => setForm(f => ({ ...f, slippageBps: e.target.value }))} /></div>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: 15, padding: "12px 0" }}>
          {loading ? "Getting Quote..." : "Get Quote →"}
        </button>
      </form>

      {result && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          {result.error ? <p style={{ color: "#ff4466" }}>{result.error}</p> : (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0", marginBottom: 12 }}>Quote Result</h3>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b6b8a", fontSize: 13 }}>Output Amount</span>
                  <span style={{ color: "#00ff88", fontWeight: 700 }}>{result.quote?.outAmount}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b6b8a", fontSize: 13 }}>Price Impact</span>
                  <span style={{ color: "#fb923c", fontWeight: 700 }}>{result.quote?.priceImpactPct}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#6b6b8a", fontSize: 13 }}>Trade ID</span>
                  <span style={{ color: "#00d4ff", fontFamily: "monospace", fontSize: 11 }}>{result.trade_id}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
