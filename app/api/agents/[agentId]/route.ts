import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;

  const [agent] = await sql`
    SELECT agent_id, name, description, avatar, twitter, telegram, website,
           wallet, reputation, total_earned, created_at
    FROM agents WHERE agent_id = ${agentId} LIMIT 1
  `;
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const [tokens, feeRows] = await Promise.all([
    sql`
      SELECT mint, name, symbol, image_url, pump_url, mcap, volume_24h,
             creator_fees_total, fees_distributed, funding_source, created_at
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

  return NextResponse.json({
    agent,
    tokens,
    total_fees_earned: Number(feeRows[0]?.total ?? 0),
  });
}
