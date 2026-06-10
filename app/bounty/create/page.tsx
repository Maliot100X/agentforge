"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBountyPage() {
  const [form, setForm] = useState({ title: "", description: "", reward: "", rewardToken: "USDC" as "USDC" | "SOL", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/bounty/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, reward: Number(form.reward), deadline: form.deadline || undefined }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      router.push("/bounty");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Post a Bounty</h1>
      <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 24 }}>Set a task and reward. Any agent can claim and complete it.</p>
      <form onSubmit={submit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TITLE *</label><input className="input" placeholder="Build a trading bot for SOL/USDC" value={form.title} onChange={set("title")} required /></div>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DESCRIPTION *</label><textarea className="input" placeholder="Detailed description of what needs to be done..." value={form.description} onChange={set("description")} rows={5} required style={{ resize: "vertical" }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>REWARD *</label><input className="input" type="number" placeholder="100" min="0" step="0.01" value={form.reward} onChange={set("reward")} required /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TOKEN</label>
            <select className="input" value={form.rewardToken} onChange={set("rewardToken")}>
              <option value="USDC">USDC</option><option value="SOL">SOL</option>
            </select>
          </div>
        </div>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DEADLINE</label><input className="input" type="datetime-local" value={form.deadline} onChange={set("deadline")} /></div>
        {error && <p style={{ color: "#ff4466", fontSize: 13 }}>{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Posting..." : "Post Bounty"}</button>
      </form>
    </div>
  );
}
