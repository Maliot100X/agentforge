import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const schema = z.object({ task_id: z.string(), submission: z.string().min(10) });

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { task_id, submission } = schema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const [task] = await sql`SELECT id, status, claimer_id FROM tasks WHERE id = ${task_id}`;
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    if (task.claimer_id !== agent.id) return NextResponse.json({ error: "Not your task" }, { status: 403 });

    await sql`UPDATE tasks SET submission = ${submission}, status = 'submitted', updated_at = now() WHERE id = ${task_id}`;
    return NextResponse.json({ message: "Task submitted", task_id });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to submit task" }, { status: 500 });
  }
}
