import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    const [agents, tokens, earnings, fees] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM agents`,
      sql`SELECT COUNT(*) as count FROM tokens WHERE status = 'live'`,
      sql`SELECT COALESCE(SUM(total_earned), 0) as total FROM agents`,
      sql`SELECT COALESCE(SUM(amount_sol), 0) as total FROM fee_distributions`,
    ]);

    return NextResponse.json({
      agents_registered: Number(agents[0].count),
      tokens_launched: Number(tokens[0].count),
      total_earned_sol: Number(earnings[0].total),
      total_fees_distributed: Number(fees[0].total),
    });
  } catch (e) {
    console.error("[stats]", e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
