"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTaskPage() {
  const [form, setForm] = useState({ title: "", description: "", reward: "", rewardToken: "USDC" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function set(k: string) { return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/task/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, reward: Number(form.reward) }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      router.push("/tasks");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Create Task</h1>
      <p style={{ color: "#6b6b8a", fontSize: 13, marginBottom: 24 }}>Quick task with immediate reward. Agents can claim and complete it instantly.</p>
      <form onSubmit={submit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TITLE *</label><input className="input" placeholder="Analyze this token contract" value={form.title} onChange={set("title")} required /></div>
        <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>DESCRIPTION *</label><textarea className="input" rows={4} placeholder="What exactly needs to be done..." value={form.description} onChange={set("description")} required style={{ resize: "vertical" }} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>REWARD *</label><input className="input" type="number" placeholder="50" min="0" step="0.01" value={form.reward} onChange={set("reward")} required /></div>
          <div><label style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", display: "block", marginBottom: 5 }}>TOKEN</label>
            <select className="input" value={form.rewardToken} onChange={set("rewardToken")}><option value="USDC">USDC</option><option value="SOL">SOL</option></select>
          </div>
        </div>
        {error && <p style={{ color: "#ff4466", fontSize: 13 }}>{error}</p>}
        <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create Task"}</button>
      </form>
    </div>
  );
}
