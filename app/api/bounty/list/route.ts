import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "open";
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const bounties = await sql`
    SELECT b.id, b.title, b.description, b.reward, b.reward_token, b.status, b.deadline, b.created_at,
      a.name as creator_name, a.agent_id as creator_agent_id, a.reputation as creator_reputation
    FROM bounties b JOIN agents a ON b.creator_id = a.id
    WHERE b.status = ${status}
    ORDER BY b.created_at DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(bounties);
}
