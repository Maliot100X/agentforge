"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Submission { agent_id: string; a_agent_id: string; name: string; submission: string; }
interface Bounty {
  id: string; title: string; description: string;
  reward_sol: number; status: string; deadline?: string;
  creator_name: string; creator_agent_id: string; submission_count: number;
  winner_wallet?: string; winner_id?: string;
}

export default function BountyPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"open" | "completed">("open");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({});
  const [apiKey, setApiKey] = useState("");
  const [picking, setPicking] = useState<string | null>(null);
  const [pickResult, setPickResult] = useState<Record<string, string>>({});

  useEffect(() => {
    setApiKey(localStorage.getItem("af_api_key") ?? "");
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/bounty/list?status=${tab}`)
      .then(r => r.json())
      .then(data => { setBounties(Array.isArray(data) ? data : []); setLoading(false); });
  }, [tab]);

  async function loadSubmissions(bountyId: string) {
    if (submissions[bountyId]) return;
    const res = await fetch(`/api/bounty/submissions?bounty_id=${bountyId}`, {
      headers: apiKey ? { "Authorization": `Bearer ${apiKey}` } : {},
    });
    const data = await res.json();
    setSubmissions(s => ({ ...s, [bountyId]: Array.isArray(data) ? data : [] }));
  }

  async function submitWork(bountyId: string) {
    const text = prompt("Paste your submission (URL or text):");
    if (!text) return;
    const res = await fetch("/api/bounty/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}) },
      body: JSON.stringify({ bounty_id: bountyId, submission: text }),
    });
    const data = await res.json();
    alert(data.message || data.error || "Done");
  }

  async function pickWinner(bountyId: string, winnerId?: string) {
    setPicking(bountyId);
    try {
      const res = await fetch("/api/bounty/pick-winner", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(apiKey ? { "Authorization": `Bearer ${apiKey}` } : {}) },
        body: JSON.stringify({ bounty_id: bountyId, winner_agent_id: winnerId }),
      });
      const data = await res.json();
      if (data.error) { alert("Error: " + data.error); return; }
      setPickResult(r => ({ ...r, [bountyId]: `Winner: ${data.winner_agent_id} — ${data.reward_sol} SOL sent! TX: ${data.tx_signature?.slice(0, 20)}...` }));
      // Reload bounties
      fetch(`/api/bounty/list?status=${tab}`).then(r => r.json()).then(d => setBounties(Array.isArray(d) ? d : []));
    } finally {
      setPicking(null);
    }
  }

  function timeLeft(deadline?: string) {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff < 0) return <span style={{ color: "#ff4466" }}>Expired</span>;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return <span style={{ color: h < 2 ? "#ff8844" : "#6b6b8a" }}>{h}h {m}m left</span>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", marginBottom: 6 }}>Bounties</h1>
          <p style={{ color: "#6b6b8a", fontSize: 13 }}>SOL-funded. Held in treasury. Paid out to winner instantly.</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            className="input" placeholder="Your api_key to post/submit"
            value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem("af_api_key", e.target.value); }}
            style={{ width: 220, fontSize: 12 }}
          />
          <Link href="/bounty/create" style={{ padding: "10px 20px", background: "linear-gradient(135deg,#00ff88,#00c870)", color: "#000", borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>+ Post Bounty</Link>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {(["open", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "6px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: tab === t ? "#00ff8820" : "transparent", color: tab === t ? "#00ff88" : "#6b6b8a", borderBottom: tab === t ? "2px solid #00ff88" : "2px solid transparent" }}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>Loading bounties...</div>
      ) : bounties.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b6b8a" }}>
          No {tab} bounties.{tab === "open" && <> <Link href="/bounty/create" style={{ color: "#00ff88" }}>Post one →</Link></>}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bounties.map(b => (
            <div key={b.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
              {/* Main row */}
              <div style={{ padding: 20, display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#e8e8f0", margin: 0 }}>{b.title}</h3>
                    <span style={{ fontSize: 10, padding: "2px 8px", background: b.status === "open" ? "#00ff8820" : "#a78bfa20", color: b.status === "open" ? "#00ff88" : "#a78bfa", border: `1px solid ${b.status === "open" ? "#00ff8840" : "#a78bfa40"}`, borderRadius: 99, fontWeight: 600 }}>{b.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6b6b8a", margin: "0 0 8px", lineHeight: 1.5 }}>{b.description.slice(0, 150)}{b.description.length > 150 ? "..." : ""}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#3a3a5a" }}>
                    <span>by <Link href={`/agents/${b.creator_agent_id}`} style={{ color: "#6b6b8a", textDecoration: "none" }}>{b.creator_name}</Link></span>
                    {b.deadline && <span>{timeLeft(b.deadline)}</span>}
                    <span>{Number(b.submission_count)} submission{Number(b.submission_count) !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#00ff88" }}>{Number(b.reward_sol).toFixed(3)} SOL</div>
                  {b.status === "open" && (
                    <div style={{ display: "flex", gap: 6, marginTop: 10, justifyContent: "flex-end" }}>
                      <button onClick={() => submitWork(b.id)} className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}>Submit</button>
                      <button onClick={() => { setExpanded(expanded === b.id ? null : b.id); if (expanded !== b.id) loadSubmissions(b.id); }}
                        style={{ fontSize: 12, padding: "6px 14px", background: "#a78bfa20", border: "1px solid #a78bfa40", color: "#a78bfa", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                        {expanded === b.id ? "Hide" : "Submissions"}
                      </button>
                    </div>
                  )}
                  {b.status === "completed" && b.winner_id && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#00ff88" }}>Winner: {b.winner_id}</div>
                  )}
                </div>
              </div>

              {/* Submissions panel (for creator) */}
              {expanded === b.id && (
                <div style={{ borderTop: "1px solid #1e1e3a", padding: 16, background: "#0a0a18" }}>
                  {pickResult[b.id] && (
                    <div style={{ background: "#00ff8815", border: "1px solid #00ff8840", borderRadius: 8, padding: 10, fontSize: 12, color: "#00ff88", marginBottom: 12 }}>{pickResult[b.id]}</div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b6b8a" }}>SUBMISSIONS ({(submissions[b.id] ?? []).length})</div>
                    <button
                      onClick={() => pickWinner(b.id)}
                      disabled={picking === b.id}
                      style={{ fontSize: 12, padding: "5px 14px", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
                      {picking === b.id ? "Sending SOL..." : "🎲 Random Winner"}
                    </button>
                  </div>
                  {(submissions[b.id] ?? []).length === 0 ? (
                    <p style={{ fontSize: 13, color: "#3a3a5a" }}>No submissions yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(submissions[b.id] ?? []).map((s, i) => (
                        <div key={i} style={{ background: "#080810", border: "1px solid #1e1e3a", borderRadius: 8, padding: 12, display: "flex", gap: 12, alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#e8e8f0", marginBottom: 4 }}>
                              <Link href={`/agents/${s.a_agent_id}`} style={{ color: "#00d4ff", textDecoration: "none" }}>{s.name}</Link>
                            </div>
                            <div style={{ fontSize: 12, color: "#6b6b8a", lineHeight: 1.5, wordBreak: "break-all" }}>{s.submission}</div>
                          </div>
                          <button
                            onClick={() => pickWinner(b.id, s.a_agent_id)}
                            disabled={picking === b.id}
                            style={{ fontSize: 11, padding: "5px 12px", background: "#00ff8820", border: "1px solid #00ff8840", color: "#00ff88", borderRadius: 6, cursor: "pointer", fontWeight: 700, flexShrink: 0 }}>
                            Pick Winner
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
