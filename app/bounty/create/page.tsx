"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLATFORM_WALLET = "B8cE8BcjVHTNppf7PdRLwAXhMZHrRMnn2RmRHFYVB23R";

export default function CreateBountyPage() {
  const [rewardSol, setRewardSol] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", depositTx: "" });
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("af_api_key") ?? "";
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set(k: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  }

  function copyWallet() {
    navigator.clipboard.writeText(PLATFORM_WALLET).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const key = apiKey.trim();
      if (key) { headers["Authorization"] = `Bearer ${key}`; localStorage.setItem("af_api_key", key); }

      const res = await fetch("/api/bounty/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          rewardSol: Number(rewardSol),
          deadline: new Date(form.deadline).toISOString(),
          depositTx: form.depositTx.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? JSON.stringify(data)); return; }
      router.push("/bounty");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  const hasReward = Number(rewardSol) > 0;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/bounty" style={{ fontSize: 13, color: "#6b6b8a", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← Back to Bounties</Link>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Post a Bounty</h1>
      <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 32 }}>SOL is locked in the treasury. Paid to the winner instantly.</p>

      {/* ── STEP 1 ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00ff88", color: "#000", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0" }}>Enter reward amount</div>
        </div>
        <div style={{ marginLeft: 38 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>REWARD IN SOL *</label>
          <input
            className="input" type="number" placeholder="0.5" min="0.001" step="0.001"
            value={rewardSol} onChange={e => setRewardSol(e.target.value)}
            style={{ fontSize: 20, fontWeight: 800, color: "#00ff88", maxWidth: 200 }}
          />
          {hasReward && <div style={{ marginTop: 6, fontSize: 12, color: "#6b6b8a" }}>You will send exactly <strong style={{ color: "#00ff88" }}>{rewardSol} SOL</strong> to the platform wallet.</div>}
        </div>
      </div>

      {/* ── STEP 2 ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: hasReward ? "#00ff88" : "#1e1e3a", color: hasReward ? "#000" : "#6b6b8a", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: hasReward ? "#e8e8f0" : "#3a3a5a" }}>Send {hasReward ? <span style={{ color: "#00ff88" }}>{rewardSol} SOL</span> : "the SOL"} to the platform wallet</div>
        </div>
        <div style={{ marginLeft: 38 }}>
          <div style={{ background: "#0e0e1a", border: "1px solid #a78bfa30", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", marginBottom: 8 }}>PLATFORM WALLET — send SOL here</div>
            <div style={{ position: "relative" }}>
              <div style={{ background: "#080810", border: "1px solid #a78bfa40", borderRadius: 8, padding: "12px 52px 12px 14px", fontFamily: "monospace", fontSize: 12, color: "#a78bfa", wordBreak: "break-all", lineHeight: 1.5 }}>
                {PLATFORM_WALLET}
              </div>
              <button onClick={copyWallet} type="button" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#a78bfa30", border: "1px solid #a78bfa50", color: "#a78bfa", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 10 }}>Use Phantom, Backpack, Solflare, or any Solana wallet. After sending, copy the transaction signature.</p>
          </div>
        </div>
      </div>

      {/* ── STEP 3 ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#00d4ff", color: "#000", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0" }}>Paste the transaction signature</div>
        </div>
        <div style={{ marginLeft: 38 }}>
          <div style={{ background: "#00d4ff08", border: "2px solid #00d4ff40", borderRadius: 10, padding: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#00d4ff", display: "block", marginBottom: 8 }}>TRANSACTION SIGNATURE *</label>
            <input
              className="input"
              placeholder="Paste the Solana tx signature here (e.g. 5xAB3...)"
              value={form.depositTx}
              onChange={set("depositTx")}
              style={{ fontFamily: "monospace", fontSize: 12, borderColor: form.depositTx ? "#00d4ff60" : undefined }}
            />
            <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 6 }}>In Phantom: go to Activity → click the transaction → copy the signature. In Explorer/Solscan: copy from the URL.</p>
          </div>
        </div>
      </div>

      {/* ── FORM ── */}
      <form onSubmit={submit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#00ff88", letterSpacing: "0.08em", marginBottom: -4 }}>BOUNTY DETAILS</div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TITLE *</label>
          <input className="input" placeholder="Build a Solana trading strategy..." value={form.title} onChange={set("title")} required />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DESCRIPTION & REQUIREMENTS *</label>
          <textarea className="input" placeholder="What exactly do you need? What counts as a successful submission? Be specific." value={form.description} onChange={set("description")} rows={5} required style={{ resize: "vertical" }} />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DEADLINE *</label>
          <input className="input" type="datetime-local" value={form.deadline} onChange={set("deadline")} required />
          <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 4 }}>If you don't pick a winner before this, a random submitter is automatically paid.</p>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>YOUR API KEY *</label>
          <input className="input" placeholder="af_..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 4 }}>From registration. <Link href="/login" style={{ color: "#00ff88" }}>Login here</Link> to get your API key.</p>
        </div>

        {/* Summary before submit */}
        {hasReward && form.depositTx && (
          <div style={{ background: "#00ff8808", border: "1px solid #00ff8820", borderRadius: 8, padding: 12, fontSize: 12, color: "#6b6b8a", lineHeight: 1.7 }}>
            ✅ Reward: <strong style={{ color: "#00ff88" }}>{rewardSol} SOL</strong><br />
            ✅ Deposit TX: <span style={{ fontFamily: "monospace", color: "#00d4ff" }}>{form.depositTx.slice(0, 20)}...</span><br />
            Platform will verify this transaction on-chain before creating the bounty.
          </div>
        )}

        {error && (
          <div style={{ background: "#ff446615", border: "1px solid #ff446640", borderRadius: 8, padding: 12, fontSize: 13, color: "#ff8899" }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading || !form.depositTx || !hasReward} style={{ fontSize: 15, padding: "13px 0" }}>
          {loading ? "Verifying deposit on-chain..." : `🏆 Post Bounty — ${rewardSol || "0"} SOL`}
        </button>
      </form>
    </div>
  );
}
