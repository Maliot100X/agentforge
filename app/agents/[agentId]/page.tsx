import Link from "next/link";
import Image from "next/image";
import sql from "@/lib/db";
import { notFound } from "next/navigation";

async function getAgent(agentId: string) {
  try {
    const [agent] = await sql`
      SELECT agent_id, name, description, avatar, twitter, telegram, website,
             wallet, reputation, total_earned, created_at
      FROM agents WHERE agent_id = ${agentId} LIMIT 1
    `;
    if (!agent) return null;

    const [tokens, feeTotal] = await Promise.all([
      sql`
        SELECT mint, name, symbol, image_url, pump_url, mcap, funding_source, created_at
        FROM tokens
        WHERE agent_id = (SELECT id FROM agents WHERE agent_id = ${agentId})
        AND status != 'failed'
        ORDER BY created_at DESC
      `,
      sql`
        SELECT COALESCE(SUM(amount_sol), 0) as total
        FROM fee_distributions
        WHERE agent_id = (SELECT id FROM agents WHERE agent_id = ${agentId})
      `,
    ]);

    return { agent, tokens, feesEarned: Number(feeTotal[0]?.total ?? 0) };
  } catch {
    return null;
  }
}

export default async function AgentProfilePage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  const data = await getAgent(agentId);
  if (!data) notFound();

  const { agent, tokens, feesEarned } = data;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Profile Header */}
      <div className="card" style={{ padding: 32, display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24 }}>
        {agent.avatar ? (
          <Image src={agent.avatar as string} alt={agent.name as string} width={80} height={80} style={{ borderRadius: 12, objectFit: "cover" }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: 12, background: "linear-gradient(135deg, #00ff8830, #00d4ff30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>🤖</div>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#e8e8f0", margin: "0 0 6px" }}>{agent.name as string}</h1>
          <div style={{ fontSize: 12, color: "#6b6b8a", fontFamily: "monospace", marginBottom: 12 }}>{agent.agent_id as string}</div>
          {agent.description && <p style={{ color: "#a0a0b8", fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>{agent.description as string}</p>}

          {/* Social links */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {agent.twitter && (
              <a href={`https://twitter.com/${(agent.twitter as string).replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "4px 12px", background: "#1da1f220", color: "#1da1f2", border: "1px solid #1da1f230", borderRadius: 99, textDecoration: "none", fontWeight: 600 }}>
                𝕏 {agent.twitter as string}
              </a>
            )}
            {agent.telegram && (
              <a href={`https://t.me/${(agent.telegram as string).replace("@", "")}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "4px 12px", background: "#2aabee20", color: "#2aabee", border: "1px solid #2aabee30", borderRadius: 99, textDecoration: "none", fontWeight: 600 }}>
                ✈ {agent.telegram as string}
              </a>
            )}
            {agent.website && (
              <a href={agent.website as string} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, padding: "4px 12px", background: "#1e1e3a", color: "#6b6b8a", border: "1px solid #2a2a4a", borderRadius: 99, textDecoration: "none", fontWeight: 600 }}>
                🌐 Website
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 140 }}>
          <StatBox label="SOL Earned" value={(Number(agent.total_earned)).toFixed(4)} color="#00ff88" />
          <StatBox label="Fees Distributed" value={feesEarned.toFixed(4)} color="#a78bfa" />
          <StatBox label="Reputation" value={String(Number(agent.reputation).toFixed(1))} color="#00d4ff" />
          <StatBox label="Tokens" value={String(tokens.length)} color="#fb923c" />
        </div>
      </div>

      {/* Wallet */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6b6b8a", marginBottom: 6 }}>PUBLIC WALLET</div>
        <div style={{ fontFamily: "monospace", fontSize: 13, color: "#00ff88", wordBreak: "break-all" }}>{agent.wallet as string}</div>
        <a href={`https://solscan.io/account/${agent.wallet}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#6b6b8a", textDecoration: "none", marginTop: 6, display: "inline-block" }}>View on Solscan →</a>
      </div>

      {/* Tokens */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#e8e8f0", marginBottom: 16 }}>Tokens Launched</h2>
      {tokens.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#6b6b8a" }}>No tokens launched yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {(tokens as Array<{ mint: string; name: string; symbol: string; image_url: string | null; pump_url: string | null; mcap: number | null; funding_source: string; created_at: string }>).map((t) => (
            <div key={t.mint} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
              {t.image_url ? (
                <Image src={t.image_url} alt={t.name} width={40} height={40} style={{ borderRadius: 6, objectFit: "cover" }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: 6, background: "#1e1e3a", display: "flex", alignItems: "center", justifyContent: "center" }}>🪙</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#e8e8f0" }}>{t.name} <span style={{ color: "#6b6b8a", fontWeight: 400 }}>({t.symbol})</span></div>
                <div style={{ fontSize: 11, color: "#6b6b8a", fontFamily: "monospace" }}>{t.mint}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#6b6b8a" }}>{new Date(t.created_at).toLocaleDateString()}</div>
                {t.mcap && <div style={{ fontSize: 12, color: "#00ff88" }}>${Number(t.mcap).toLocaleString()}</div>}
              </div>
              {t.pump_url && (
                <a href={t.pump_url} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 14px", background: "#00ff8815", color: "#00ff88", border: "1px solid #00ff8830", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                  pump.fun →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "#0e0e1a", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 10, color: "#4a4a6a", fontWeight: 600 }}>{label}</div>
    </div>
  );
}
