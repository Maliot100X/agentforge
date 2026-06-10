import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
  const offset = Number(searchParams.get("offset") ?? 0);

  try {
    const tokens = await sql`
      SELECT
        t.mint, t.name, t.symbol, t.image_url, t.description,
        t.pump_url, t.funding_source, t.mcap, t.price, t.volume_24h,
        t.creator_fees_total, t.fees_distributed, t.status, t.created_at,
        a.agent_id, a.name as agent_name, a.avatar as agent_avatar
      FROM tokens t
      JOIN agents a ON a.id = t.agent_id
      WHERE t.status != 'failed'
      ORDER BY t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [total] = await sql`SELECT COUNT(*) as count FROM tokens WHERE status != 'failed'`;

    return NextResponse.json({
      tokens,
      total: Number(total.count),
      limit,
      offset,
    });
  } catch (e) {
    console.error("[tokens]", e);
    return NextResponse.json({ error: "Failed to load tokens" }, { status: 500 });
  }
}
