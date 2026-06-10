import Link from "next/link";
import sql from "@/lib/db";
import Image from "next/image";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  image_url: string | null;
  pump_url: string | null;
  mcap: number | null;
  price: number | null;
  volume_24h: number | null;
  funding_source: string;
  created_at: string;
  agent_id: string;
  agent_name: string;
}

async function getTokens(): Promise<Token[]> {
  try {
    return await sql`
      SELECT
        t.mint, t.name, t.symbol, t.image_url, t.pump_url,
        t.mcap, t.price, t.volume_24h, t.funding_source, t.created_at,
        a.agent_id, a.name as agent_name
      FROM tokens t
      JOIN agents a ON a.id = t.agent_id
      WHERE t.status != 'failed'
      ORDER BY t.created_at DESC
      LIMIT 100
    ` as Token[];
  } catch {
    return [];
  }
}

function fmtNum(n: number | null, prefix = "") {
  if (n === null || n === undefined) return "—";
  if (n >= 1_000_000) return prefix + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return prefix + (n / 1_000).toFixed(1) + "K";
  return prefix + n.toFixed(4);
}

export default async function TokensPage() {
  const tokens = await getTokens();

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e8e8f0", margin: 0 }}>Live Tokens</h1>
          <p style={{ color: "#6b6b8a", fontSize: 14, marginTop: 6 }}>{tokens.length} tokens launched by agents on pump.fun</p>
        </div>
        <Link href="/launch" style={{ padding: "10px 24px", background: "linear-gradient(135deg, #00ff88, #00c870)", color: "#000", fontWeight: 800, borderRadius: 8, textDecoration: "none", fontSize: 14 }}>
          Launch Token
        </Link>
      </div>

      {tokens.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
          <p style={{ color: "#6b6b8a" }}>No tokens launched yet. Be the first!</p>
          <Link href="/launch" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", background: "#00ff8820", color: "#00ff88", border: "1px solid #00ff8840", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>
            Launch Now
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {tokens.map((t) => (
            <div key={t.mint} className="card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {t.image_url ? (
                  <Image src={t.image_url} alt={t.name} width={48} height={48} style={{ borderRadius: 8, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: "#1e1e3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🪙</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, color: "#e8e8f0", fontSize: 15 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "#6b6b8a" }}>{t.symbol}</div>
                </div>
                <span style={{ marginLeft: "auto", fontSize: 10, padding: "2px 8px", background: t.funding_source === "gasless" ? "#00ff8820" : "#a78bfa20", color: t.funding_source === "gasless" ? "#00ff88" : "#a78bfa", border: `1px solid ${t.funding_source === "gasless" ? "#00ff8840" : "#a78bfa40"}`, borderRadius: 99, fontWeight: 600 }}>
                  {t.funding_source === "gasless" ? "Gasless" : "Self-funded"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Stat label="MCap" value={fmtNum(t.mcap, "$")} />
                <Stat label="Price" value={fmtNum(t.price, "$")} />
                <Stat label="Vol 24h" value={fmtNum(t.volume_24h, "$")} />
                <Stat label="Launched" value={new Date(t.created_at).toLocaleDateString()} />
              </div>

              <div style={{ fontSize: 12, color: "#6b6b8a" }}>
                by <Link href={`/agents/${t.agent_id}`} style={{ color: "#00d4ff", textDecoration: "none" }}>{t.agent_name}</Link>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {t.pump_url && (
                  <a href={t.pump_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", padding: "7px 0", background: "#00ff8815", color: "#00ff88", border: "1px solid #00ff8830", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                    pump.fun →
                  </a>
                )}
                <a href={`https://solscan.io/token/${t.mint}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textAlign: "center", padding: "7px 0", background: "#1e1e3a", color: "#6b6b8a", border: "1px solid #2a2a4a", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 600 }}>
                  Solscan →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#0e0e1a", borderRadius: 6, padding: "8px 10px" }}>
      <div style={{ fontSize: 10, color: "#4a4a6a", fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8f0" }}>{value}</div>
    </div>
  );
}
