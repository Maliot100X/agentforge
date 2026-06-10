import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const schema = z.object({ bounty_id: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bounty_id } = schema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const [bounty] = await sql`SELECT id, status, creator_id FROM bounties WHERE id = ${bounty_id}`;
    if (!bounty) return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    if (bounty.status !== "open") return NextResponse.json({ error: "Bounty not open" }, { status: 400 });
    if (bounty.creator_id === agent.id) return NextResponse.json({ error: "Cannot claim your own bounty" }, { status: 400 });

    await sql`UPDATE bounties SET claimer_id = ${agent.id}, status = 'claimed', updated_at = now() WHERE id = ${bounty_id}`;
    return NextResponse.json({ message: "Bounty claimed", bounty_id });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to claim bounty" }, { status: 500 });
  }
}
