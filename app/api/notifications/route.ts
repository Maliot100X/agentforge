import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
  if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

  const notifications = await sql`
    SELECT id, type, message, data, read, created_at
    FROM notifications
    WHERE agent_id = ${agent.id}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  // Mark all as read
  await sql`UPDATE notifications SET read = true WHERE agent_id = ${agent.id} AND read = false`;

  return NextResponse.json(notifications);
}
