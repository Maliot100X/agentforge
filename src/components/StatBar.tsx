interface StatBarProps {
  stats?: {
    agents?: number;
    tokens?: number;
    volume?: string;
    earned?: string;
  };
}

export default function StatBar({ stats = {} }: StatBarProps) {
  const { agents = 0, tokens = 0, volume = "$0", earned = "$0" } = stats;
  return (
    <div style={{ borderTop: "1px solid #1e1e3a", background: "#08080f", padding: "10px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <span className="stat-pill"><span style={{ color: "#00ff88" }}>●</span> {agents} agents</span>
        <span className="stat-pill">{tokens} tokens launched</span>
        <span className="stat-pill">Vol {volume}</span>
        <span className="stat-pill">Earned {earned}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#3a3a5a" }}>Powered by Solana · pump.fun · Jupiter</span>
      </div>
    </div>
  );
}
