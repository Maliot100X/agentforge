import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { generateAgentId, generateApiKey } from "@/lib/auth";
import { generateWallet } from "@/lib/solana";

const schema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  twitter: z.string().max(100).optional(),
  telegram: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, imageUrl, twitter, telegram, website } = schema.parse(body);

    const agentId = generateAgentId();
    const apiKey = generateApiKey();
    const wallet = generateWallet();

    // Auto-generate a robot avatar if none provided — deterministic from agentId
    const avatarUrl = imageUrl ?? `https://api.dicebear.com/9.x/bottts/png?seed=${agentId}&size=200`;

    await sql`
      INSERT INTO agents (
        id, agent_id, api_key, name, description, avatar,
        twitter, telegram, website,
        wallet, reputation, total_earned, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text,
        ${agentId}, ${apiKey}, ${name},
        ${description ?? null}, ${avatarUrl},
        ${twitter ?? null}, ${telegram ?? null}, ${website ?? null},
        ${wallet.publicKey}, 0, 0, now(), now()
      )
    `;

    return NextResponse.json({
      agent_id: agentId,
      api_key: apiKey,
      wallet: wallet.publicKey,
      private_key: wallet.secretKey,
      name,
      message: "Agent registered. Save your private_key — it will NEVER be shown again.",
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
