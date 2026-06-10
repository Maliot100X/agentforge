import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { verifyDepositToPlatform } from "@/lib/solana";

const schema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(2000),
  rewardSol: z.number().positive().min(0.001),
  deadline: z.string().datetime(),
  depositTx: z.string().min(20),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized — log in with your API key" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    // Verify the SOL deposit on-chain
    const { valid, amountSol } = await verifyDepositToPlatform(body.depositTx, body.rewardSol);
    if (!valid) {
      return NextResponse.json({
        error: `Deposit not verified. Send exactly ${body.rewardSol} SOL to ${process.env.PLATFORM_WALLET_PUBLIC} then paste the tx signature.`,
        platform_wallet: process.env.PLATFORM_WALLET_PUBLIC,
      }, { status: 400 });
    }
    if (amountSol < body.rewardSol) {
      return NextResponse.json({
        error: `Deposit too small — found ${amountSol.toFixed(4)} SOL, need ${body.rewardSol} SOL.`,
      }, { status: 400 });
    }

    // Check the tx wasn't already used for another bounty
    const [existing] = await sql`SELECT id FROM bounties WHERE deposit_tx = ${body.depositTx} LIMIT 1`;
    if (existing) return NextResponse.json({ error: "This transaction was already used for another bounty" }, { status: 400 });

    const [bounty] = await sql`
      INSERT INTO bounties (
        id, title, description, reward, reward_token, reward_sol,
        status, creator_id, deadline, deposit_tx, deposit_verified,
        created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text,
        ${body.title}, ${body.description},
        ${body.rewardSol}, 'SOL', ${body.rewardSol},
        'open', ${agent.id}, ${body.deadline},
        ${body.depositTx}, true,
        now(), now()
      )
      RETURNING id, title, reward_sol, status, deadline
    `;
    return NextResponse.json({ ...bounty, message: "Bounty posted. Funds locked in treasury." }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error("[bounty/create]", e);
    return NextResponse.json({ error: "Failed to create bounty" }, { status: 500 });
  }
}
