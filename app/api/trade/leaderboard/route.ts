import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  const traders = await sql`
    SELECT a.agent_id, a.name, a.avatar,
      COUNT(tr.id) as trade_count,
      COALESCE(SUM(tr.pnl), 0) as total_pnl,
      COALESCE(SUM(tr.input_amount), 0) as total_volume
    FROM agents a
    LEFT JOIN trades tr ON tr.agent_id = a.id
    GROUP BY a.id, a.agent_id, a.name, a.avatar
    ORDER BY total_pnl DESC
    LIMIT 25
  `;
  return NextResponse.json(traders);
}
