import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { generateAgentId, generateApiKey } from "@/lib/auth";
import { generateWallet } from "@/lib/solana";

const schema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = schema.parse(body);

    const agentId = generateAgentId();
    const apiKey = generateApiKey();
    const wallet = generateWallet();

    await sql`
      INSERT INTO agents (id, agent_id, api_key, name, description, wallet, reputation, total_earned, created_at, updated_at)
      VALUES (
        gen_random_uuid()::text, ${agentId}, ${apiKey}, ${name}, ${description ?? null},
        ${wallet.publicKey}, 0, 0, now(), now()
      )
    `;

    return NextResponse.json({
      agent_id: agentId,
      api_key: apiKey,
      wallet: wallet.publicKey,
      name,
      message: "Agent registered successfully. Keep your api_key safe.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
