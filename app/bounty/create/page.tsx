"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PLATFORM_WALLET = "B8cE8BcjVHTNppf7PdRLwAXhMZHrRMnn2RmRHFYVB23R";

export default function CreateBountyPage() {
  const [form, setForm] = useState({ title: "", description: "", rewardSol: "", deadline: "", depositTx: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const router = useRouter();

  // Load stored api key from localStorage if available
  useEffect(() => {
    const stored = localStorage.getItem("af_api_key") ?? "";
    setApiKey(stored);
  }, []);

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
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const res = await fetch("/api/bounty/create", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          rewardSol: Number(form.rewardSol),
          deadline: new Date(form.deadline).toISOString(),
          depositTx: form.depositTx,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create bounty"); return; }
      router.push("/bounty");
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/bounty" style={{ fontSize: 13, color: "#6b6b8a", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← Back to Bounties</Link>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Post a Bounty</h1>
      <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 28 }}>Fund it upfront in SOL. Held in treasury. Paid to winner instantly when you pick one.</p>

      {/* Step 1: Send SOL first */}
      <div style={{ background: "#0e0e1a", border: "1px solid #a78bfa30", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em", marginBottom: 12 }}>STEP 1 — FUND THE BOUNTY FIRST</div>
        <p style={{ fontSize: 13, color: "#6b6b8a", marginBottom: 12, lineHeight: 1.6 }}>
          Send the exact SOL amount you want to reward to the platform wallet. Then paste the transaction signature below.
        </p>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 6 }}>PLATFORM WALLET</div>
        <div style={{ position: "relative" }}>
          <div style={{ background: "#080810", border: "1px solid #a78bfa30", borderRadius: 8, padding: "10px 50px 10px 14px", fontFamily: "monospace", fontSize: 11, color: "#a78bfa", wordBreak: "break-all" }}>
            {PLATFORM_WALLET}
          </div>
          <button onClick={copyWallet} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "#a78bfa20", border: "1px solid #a78bfa40", color: "#a78bfa", borderRadius: 5, padding: "3px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            {copied ? "✓" : "Copy"}
          </button>
        </div>
        <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 10 }}>
          Use any Solana wallet (Phantom, Backpack, CLI). Save the transaction signature — you'll need it below.
        </p>
      </div>

      {/* Auth: API key */}
      <div style={{ background: "#0e0e1a", border: "1px solid #1e1e3a", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a", marginBottom: 6 }}>YOUR API KEY (from registration)</div>
        <input
          className="input" placeholder="af_..."
          value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem("af_api_key", e.target.value); }}
        />
        <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 6 }}>Required to post bounties. <Link href="/login" style={{ color: "#00ff88" }}>Login here</Link> or paste your api_key directly.</p>
      </div>

      {/* Step 2: Fill out the form */}
      <form onSubmit={submit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#00ff88", letterSpacing: "0.08em", marginBottom: -4 }}>STEP 2 — BOUNTY DETAILS</div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TITLE *</label>
          <input className="input" placeholder="Build a Solana trading strategy" value={form.title} onChange={set("title")} required />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DESCRIPTION *</label>
          <textarea className="input" placeholder="Detailed requirements, expected deliverable, acceptance criteria..." value={form.description} onChange={set("description")} rows={5} required style={{ resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>REWARD (SOL) *</label>
            <input className="input" type="number" placeholder="0.5" min="0.001" step="0.001" value={form.rewardSol} onChange={set("rewardSol")} required />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DEADLINE *</label>
            <input className="input" type="datetime-local" value={form.deadline} onChange={set("deadline")} required />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DEPOSIT TX SIGNATURE *</label>
          <input className="input" placeholder="Paste your Solana transaction signature here" value={form.depositTx} onChange={set("depositTx")} required />
          <p style={{ fontSize: 11, color: "#3a3a5a", marginTop: 4 }}>Must be a transaction sending exactly {form.rewardSol || "your reward"} SOL to the platform wallet above.</p>
        </div>

        {error && (
          <div style={{ background: "#ff446615", border: "1px solid #ff446640", borderRadius: 8, padding: 12, fontSize: 13, color: "#ff8899" }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading} style={{ fontSize: 15, padding: "12px 0" }}>
          {loading ? "Verifying deposit & posting..." : "🏆 Post Bounty"}
        </button>
      </form>
    </div>
  );
}
