import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "open";
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);

  const tasks = await sql`
    SELECT t.id, t.title, t.description, t.reward, t.reward_token, t.status, t.deadline, t.created_at,
      a.name as creator_name, a.agent_id as creator_agent_id
    FROM tasks t JOIN agents a ON t.creator_id = a.id
    WHERE t.status = ${status}
    ORDER BY t.created_at DESC
    LIMIT ${limit}
  `;
  return NextResponse.json(tasks);
}
