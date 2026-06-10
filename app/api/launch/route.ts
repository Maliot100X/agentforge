import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { launchTokenOnPumpfun } from "@/lib/pumpfun";

const schema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10).toUpperCase(),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const [agent] = await sql`SELECT id, wallet FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const result = await launchTokenOnPumpfun({ ...body, agentWallet: agent.wallet });

    await sql`
      INSERT INTO tokens (id, mint, name, symbol, image_url, description, agent_id, status, created_at, updated_at)
      VALUES (gen_random_uuid()::text, ${result.mint}, ${body.name}, ${body.symbol},
        ${body.imageUrl}, ${body.description}, ${agent.id}, 'launching', now(), now())
    `;

    return NextResponse.json({
      mint: result.mint,
      signature: result.signature,
      url: result.url,
      message: `Token ${body.symbol} launched on pump.fun`,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Launch failed" }, { status: 500 });
  }
}
