import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { sendSolFromPlatform } from "@/lib/solana";

const schema = z.object({
  bounty_id: z.string(),
  winner_agent_id: z.string().optional(), // omit for random selection
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { bounty_id, winner_agent_id } = schema.parse(await req.json());

    // Verify caller is the bounty creator
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const [bounty] = await sql`
      SELECT id, status, creator_id, reward_sol, title
      FROM bounties WHERE id = ${bounty_id}
    `;
    if (!bounty) return NextResponse.json({ error: "Bounty not found" }, { status: 404 });
    if (bounty.creator_id !== agent.id) return NextResponse.json({ error: "Only the bounty creator can pick a winner" }, { status: 403 });
    if (bounty.status !== "open") return NextResponse.json({ error: `Bounty is already ${bounty.status}` }, { status: 400 });

    // Get all submissions
    const submissions = await sql`
      SELECT bs.id, bs.agent_id, bs.submission, a.wallet, a.agent_id as a_agent_id, a.name
      FROM bounty_submissions bs
      JOIN agents a ON bs.agent_id = a.id
      WHERE bs.bounty_id = ${bounty_id}
    `;
    if (submissions.length === 0) return NextResponse.json({ error: "No submissions yet" }, { status: 400 });

    // Pick winner — manual or random
    let winner;
    if (winner_agent_id) {
      winner = submissions.find((s: Record<string, unknown>) => s.a_agent_id === winner_agent_id);
      if (!winner) return NextResponse.json({ error: "That agent did not submit to this bounty" }, { status: 400 });
    } else {
      winner = submissions[Math.floor(Math.random() * submissions.length)];
    }

    const rewardSol = Number(bounty.reward_sol);
    if (!winner.wallet) return NextResponse.json({ error: "Winner has no wallet" }, { status: 500 });

    // Send SOL from platform treasury to winner
    const txSig = await sendSolFromPlatform(winner.wallet as string, rewardSol);

    // Mark bounty completed
    await sql`
      UPDATE bounties
      SET status = 'completed', winner_id = ${winner.agent_id}, winner_wallet = ${winner.wallet}, updated_at = now()
      WHERE id = ${bounty_id}
    `;

    // Update winner's total_earned
    await sql`UPDATE agents SET total_earned = total_earned + ${rewardSol}, updated_at = now() WHERE id = ${winner.agent_id}`;

    // Notify winner
    await sql`
      INSERT INTO notifications (id, agent_id, type, message, data, created_at)
      VALUES (
        gen_random_uuid()::text, ${winner.agent_id}, 'bounty_won',
        ${`You won the bounty "${bounty.title}"! ${rewardSol} SOL sent to your wallet.`},
        ${JSON.stringify({ bounty_id, tx: txSig, reward_sol: rewardSol })},
        now()
      )
    `;

    return NextResponse.json({
      message: `Winner selected: ${winner.name}`,
      winner_agent_id: winner.a_agent_id,
      winner_wallet: winner.wallet,
      reward_sol: rewardSol,
      tx_signature: txSig,
      bounty_id,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error("[bounty/pick-winner]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
