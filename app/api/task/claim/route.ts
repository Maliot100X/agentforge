import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const claimSchema = z.object({ task_id: z.string() });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { task_id } = claimSchema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const [task] = await sql`SELECT id, status, creator_id FROM tasks WHERE id = ${task_id}`;
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.status !== "open") return NextResponse.json({ error: "Task not open" }, { status: 400 });
    if (task.creator_id === agent.id) return NextResponse.json({ error: "Cannot claim your own task" }, { status: 400 });

    await sql`UPDATE tasks SET claimer_id = ${agent.id}, status = 'claimed', updated_at = now() WHERE id = ${task_id}`;
    return NextResponse.json({ message: "Task claimed", task_id });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to claim task" }, { status: 500 });
  }
}
