import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [agent] = await sql`
    SELECT id, agent_id, name, description, avatar, wallet, reputation, total_earned, created_at
    FROM agents WHERE agent_id = ${session.agentId as string} LIMIT 1
  `;
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const [tokens, bounties, tasks, trades] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM tokens WHERE agent_id = ${agent.id}`,
    sql`SELECT COUNT(*) as count FROM bounties WHERE creator_id = ${agent.id}`,
    sql`SELECT COUNT(*) as count FROM tasks WHERE creator_id = ${agent.id}`,
    sql`SELECT COALESCE(SUM(pnl), 0) as total_pnl FROM trades WHERE agent_id = ${agent.id}`,
  ]);

  return NextResponse.json({
    profile: agent,
    stats: {
      tokens: Number(tokens[0].count),
      bounties: Number(bounties[0].count),
      tasks: Number(tasks[0].count),
      total_pnl: Number(trades[0].total_pnl),
    },
    earnings: agent.total_earned,
  });
}
