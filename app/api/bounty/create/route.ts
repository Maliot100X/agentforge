import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  reward: z.number().positive(),
  rewardToken: z.enum(["USDC", "SOL"]).default("USDC"),
  deadline: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const [bounty] = await sql`
      INSERT INTO bounties (id, title, description, reward, reward_token, status, creator_id, deadline, created_at, updated_at)
      VALUES (gen_random_uuid()::text, ${body.title}, ${body.description}, ${body.reward},
        ${body.rewardToken}, 'open', ${agent.id}, ${body.deadline ?? null}, now(), now())
      RETURNING id, title, reward, reward_token, status
    `;
    return NextResponse.json(bounty, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Failed to create bounty" }, { status: 500 });
  }
}
