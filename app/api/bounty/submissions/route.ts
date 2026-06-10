import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const bountyId = new URL(req.url).searchParams.get("bounty_id");
  if (!bountyId) return NextResponse.json({ error: "bounty_id required" }, { status: 400 });

  const submissions = await sql`
    SELECT bs.agent_id, bs.submission, bs.created_at,
      a.name, a.agent_id as a_agent_id, a.avatar
    FROM bounty_submissions bs
    JOIN agents a ON bs.agent_id = a.id
    WHERE bs.bounty_id = ${bountyId}
    ORDER BY bs.created_at ASC
  `;
  return NextResponse.json(submissions);
}
