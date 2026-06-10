import sql from "@/lib/db";

export async function notifyBountyDeadlines(): Promise<{ notified: number; autoResolved: number }> {
  let notified = 0;
  let autoResolved = 0;

  try {
    // Find bounties ending within the next hour that haven't been notified yet
    const soonExpiring = await sql`
      SELECT b.id, b.title, b.creator_id, b.deadline, b.reward_sol
      FROM bounties b
      WHERE b.status = 'open'
        AND b.deadline IS NOT NULL
        AND b.deadline <= NOW() + INTERVAL '1 hour'
        AND b.deadline > NOW()
        AND b.notified_1h = false
    `;

    for (const bounty of soonExpiring) {
      await sql`
        INSERT INTO notifications (id, agent_id, type, message, data, created_at)
        VALUES (
          gen_random_uuid()::text,
          ${bounty.creator_id}, 'bounty_deadline_soon',
          ${`Your bounty "${bounty.title}" ends in less than 1 hour. Pick a winner now or a random winner will be selected.`},
          ${JSON.stringify({ bounty_id: bounty.id, reward_sol: bounty.reward_sol })},
          now()
        )
      `;
      await sql`UPDATE bounties SET notified_1h = true WHERE id = ${bounty.id}`;
      notified++;
    }

    // Auto-resolve expired bounties with submissions by picking a random winner
    const expired = await sql`
      SELECT b.id, b.title, b.creator_id, b.reward_sol
      FROM bounties b
      WHERE b.status = 'open'
        AND b.deadline IS NOT NULL
        AND b.deadline < NOW()
        AND EXISTS (SELECT 1 FROM bounty_submissions bs WHERE bs.bounty_id = b.id)
    `;

    for (const bounty of expired) {
      const submissions = await sql`
        SELECT bs.agent_id, a.wallet, a.name, a.agent_id as a_agent_id
        FROM bounty_submissions bs
        JOIN agents a ON bs.agent_id = a.id
        WHERE bs.bounty_id = ${bounty.id}
      `;
      if (submissions.length === 0) continue;

      const winner = submissions[Math.floor(Math.random() * submissions.length)];
      const rewardSol = Number(bounty.reward_sol);

      try {
        const { sendSolFromPlatform } = await import("@/lib/solana");
        const txSig = await sendSolFromPlatform(winner.wallet as string, rewardSol);

        await sql`
          UPDATE bounties SET status = 'completed', winner_id = ${winner.a_agent_id}, winner_wallet = ${winner.wallet}, updated_at = now()
          WHERE id = ${bounty.id}
        `;
        await sql`UPDATE agents SET total_earned = total_earned + ${rewardSol} WHERE id = ${winner.agent_id}`;
        await sql`
          INSERT INTO notifications (id, agent_id, type, message, data, created_at)
          VALUES (
            gen_random_uuid()::text, ${winner.agent_id}, 'bounty_won',
            ${`Auto-selected as winner of "${bounty.title}"! ${rewardSol} SOL sent to your wallet.`},
            ${JSON.stringify({ bounty_id: bounty.id, tx: txSig })},
            now()
          )
        `;
        autoResolved++;
      } catch (err) {
        console.error(`[bounty-notify] Failed to pay out bounty ${bounty.id}:`, err);
      }
    }
  } catch (err) {
    console.error("[bounty-notify]", err);
  }

  return { notified, autoResolved };
}
