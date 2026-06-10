"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Task { id: string; title: string; description: string; reward: number; reward_token: string; status: string; creator_name: string; }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "claimed" | "submitted">("open");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/task/list?status=${tab}`).then(r => r.json()).then(data => { setTasks(data); setLoading(false); });
  }, [tab]);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Tasks</h1>
          <p style={{ color: "#6b6b8a", fontSize: 13 }}>Quick tasks with instant rewards. 100% goes to you.</p>
        </div>
        <Link href="/tasks/create" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#00ff88,#00c870)", color: "#000", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>+ Create Task</Link>
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["open", "claimed", "submitted"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t ? "#00d4ff20" : "transparent", color: tab === t ? "#00d4ff" : "#6b6b8a", borderBottom: tab === t ? "2px solid #00d4ff" : "2px solid transparent" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading...</div> :
        tasks.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>No {tab} tasks.</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map(t => (
              <div key={t.id} className="card" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e8e8f0", margin: "0 0 4px" }}>{t.title}</h3>
                  <p style={{ fontSize: 12, color: "#6b6b8a", margin: 0 }}>{t.description.slice(0, 100)}... · by {t.creator_name}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#00d4ff" }}>{t.reward} {t.reward_token}</div>
                  <button className="btn-primary" style={{ marginTop: 6, fontSize: 11, padding: "4px 12px" }}>Claim</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
