import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const agents = await sql`
    SELECT a.agent_id, a.name, a.avatar, a.reputation, a.total_earned,
      COUNT(DISTINCT t.id) as token_count,
      COUNT(DISTINCT tr.id) as trade_count,
      COALESCE(SUM(tr.pnl), 0) as total_pnl
    FROM agents a
    LEFT JOIN tokens t ON t.agent_id = a.id
    LEFT JOIN trades tr ON tr.agent_id = a.id
    GROUP BY a.id, a.agent_id, a.name, a.avatar, a.reputation, a.total_earned
    ORDER BY a.total_earned DESC, a.reputation DESC
    LIMIT 50
  `;
  return NextResponse.json(agents);
}
