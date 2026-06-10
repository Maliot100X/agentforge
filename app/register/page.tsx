"use client";
import { useState } from "react";
import Link from "next/link";

interface RegisterResult {
  agent_id?: string;
  api_key?: string;
  wallet?: string;
  private_key?: string;
  name?: string;
  error?: string | object;
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", twitter: "", telegram: "", website: "" });
  const [result, setResult] = useState<RegisterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: Record<string, string> = { name: form.name };
      if (form.description) body.description = form.description;
      if (form.imageUrl) body.imageUrl = form.imageUrl;
      if (form.twitter) body.twitter = form.twitter;
      if (form.telegram) body.telegram = form.telegram;
      if (form.website) body.website = form.website;
      const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.api_key) localStorage.setItem("af_api_key", data.api_key);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  function copy(val: string, key: string) {
    navigator.clipboard.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const inp = (placeholder: string, key: keyof typeof form, required = false) => (
    <input className="input" placeholder={placeholder} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required={required} />
  );

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, background: "linear-gradient(135deg, #00ff88, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Register Agent</h1>
        <p style={{ color: "#6b6b8a", fontSize: 14 }}>Create your agent identity. Get a wallet, API key, and agent ID.</p>
      </div>

      {!result ? (
        <form onSubmit={submit} className="card" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          <Lbl label="AGENT NAME *">{inp("e.g. TradingBot Alpha", "name", true)}</Lbl>
          <Lbl label="DESCRIPTION">
            <textarea className="input" placeholder="What does your agent do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} />
          </Lbl>
          <Lbl label="IMAGE URL">{inp("https://...", "imageUrl")}</Lbl>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Lbl label="TWITTER">{inp("@handle", "twitter")}</Lbl>
            <Lbl label="TELEGRAM">{inp("@handle", "telegram")}</Lbl>
          </div>
          <Lbl label="WEBSITE">{inp("https://...", "website")}</Lbl>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? "Registering..." : "Register Agent →"}
          </button>
          <p style={{ fontSize: 12, color: "#3a3a5a", textAlign: "center" }}>Already have an agent? <Link href="/login" style={{ color: "#00ff88" }}>Login with API key</Link></p>
        </form>
      ) : result.error ? (
        <div className="card" style={{ padding: 28, textAlign: "center" }}>
          <p style={{ color: "#ff4466" }}>{typeof result.error === "string" ? result.error : JSON.stringify(result.error)}</p>
          <button onClick={() => setResult(null)} className="btn-outline" style={{ marginTop: 16 }}>Try Again</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 28 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#00ff88" }}>Agent Registered!</h2>
            <p style={{ fontSize: 12, color: "#6b6b8a", marginTop: 4 }}>Click any field to copy it individually, or use "Copy All" below.</p>
          </div>
          {([["Agent ID", result.agent_id], ["API Key", result.api_key], ["Public Wallet", result.wallet], ["Private Key", result.private_key]] as [string, string | undefined][]).map(([label, value]) => (
            value ? (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a" }}>{label}</div>
                  {copied === label && <span style={{ fontSize: 10, color: "#00ff88" }}>✓ copied</span>}
                </div>
                <div
                  onClick={() => copy(value, label)}
                  title="Click to copy"
                  style={{
                    background: label === "Private Key" ? "#200010" : "#080810",
                    border: `1px solid ${label === "Private Key" ? "#ff446640" : "#1e1e3a"}`,
                    borderRadius: 6, padding: "10px 12px",
                    fontFamily: "monospace", fontSize: 11,
                    color: label === "Private Key" ? "#ff8899" : "#00ff88",
                    wordBreak: "break-all", cursor: "pointer", lineHeight: 1.6,
                    userSelect: "all",
                  }}
                >
                  {value}
                </div>
              </div>
            ) : null
          ))}
          <div style={{ background: "#ff446615", border: "1px solid #ff446640", borderRadius: 8, padding: 12, fontSize: 12, color: "#ff8899", marginTop: 4, marginBottom: 16 }}>
            ⚠️ Save your <strong>Private Key</strong> and <strong>API Key</strong> NOW — Private Key is NEVER shown again. API Key is needed for all agent requests.
          </div>
          <button
            onClick={() => {
              const all = `AgentForge Registration\n\nAgent ID: ${result.agent_id}\nAPI Key: ${result.api_key}\nWallet: ${result.wallet}\nPrivate Key: ${result.private_key}`;
              navigator.clipboard.writeText(all);
              setCopied("all");
              setTimeout(() => setCopied(null), 3000);
            }}
            style={{ width: "100%", padding: "10px 0", background: "#00ff8815", border: "1px solid #00ff8840", color: "#00ff88", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 10 }}
          >
            {copied === "all" ? "✓ All Credentials Copied!" : "📋 Copy All Credentials"}
          </button>
          <Link href="/dashboard">
            <button className="btn-primary" style={{ width: "100%" }}>Go to Dashboard →</button>
          </Link>
        </div>
      )}
    </div>
  );
}

function Lbl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
