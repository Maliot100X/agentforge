import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import sql from "./db";
import { sendSolFromPlatform } from "./solana";
import { HELIUS_RPC, PUMPFUN_PROGRAM_ID } from "./constants";

const AGENT_SHARE = 0.65;
const MIN_DISTRIBUTE_SOL = 0.001;

// Collect creator fees from pump.fun transactions and distribute to agents
export async function collectAndDistributeFees(): Promise<{
  processed: number;
  distributed: number;
  errors: string[];
}> {
  const platformPub = process.env.PLATFORM_WALLET_PUBLIC;
  if (!platformPub) return { processed: 0, distributed: 0, errors: ["PLATFORM_WALLET_PUBLIC not set"] };

  const connection = new Connection(HELIUS_RPC, "confirmed");
  const errors: string[] = [];
  let processed = 0;
  let distributed = 0;

  try {
    // Get recent sigs for platform wallet
    const sigs = await connection.getSignaturesForAddress(
      new PublicKey(platformPub),
      { limit: 50 },
      "confirmed"
    );

    // Get already-processed signatures from DB
    const existingSigs = sigs.map((s) => s.signature);
    const alreadyDone = existingSigs.length > 0
      ? await sql`
          SELECT tx_signature FROM fee_distributions
          WHERE tx_signature = ANY(${existingSigs})
        `
      : [];
    const doneSigSet = new Set((alreadyDone as Record<string, string>[]).map((r) => r.tx_signature));

    // Get all active tokens (mint → agent_wallet mapping)
    const tokens = await sql`
      SELECT t.mint, t.agent_wallet, t.id as token_id
      FROM tokens t
      WHERE t.status != 'failed'
    `;
    const mintToAgent = new Map<string, { agentWallet: string; tokenId: string }>(
      (tokens as Record<string, string>[]).map((t) => [
        t.mint,
        { agentWallet: t.agent_wallet, tokenId: t.token_id },
      ])
    );

    for (const sig of sigs) {
      if (doneSigSet.has(sig.signature) || sig.err) continue;

      try {
        const tx = await connection.getParsedTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0,
          commitment: "confirmed",
        });
        if (!tx || tx.meta?.err) continue;

        // Check if pump.fun program is involved
        const accountKeys = tx.transaction.message.accountKeys.map((k) => k.pubkey.toBase58());
        const hasPumpfun = accountKeys.includes(PUMPFUN_PROGRAM_ID);
        if (!hasPumpfun) continue;

        // Find the platform wallet index
        const platformIdx = accountKeys.indexOf(platformPub);
        if (platformIdx === -1) continue;

        // Check if platform wallet received SOL (creator fee)
        const pre = tx.meta!.preBalances[platformIdx];
        const post = tx.meta!.postBalances[platformIdx];
        const received = (post - pre) / LAMPORTS_PER_SOL;
        if (received <= 0) continue;

        // Identify which token mint is in this transaction
        let tokenMint: string | null = null;
        for (const key of accountKeys) {
          if (mintToAgent.has(key)) {
            tokenMint = key;
            break;
          }
        }
        if (!tokenMint) continue;

        const agentInfo = mintToAgent.get(tokenMint)!;
        const agentShare = received * AGENT_SHARE;

        if (agentShare < MIN_DISTRIBUTE_SOL) continue;

        // Send 65% to agent
        let txSig: string | undefined;
        try {
          txSig = await sendSolFromPlatform(agentInfo.agentWallet, agentShare);
        } catch (e) {
          errors.push(`Send failed for ${tokenMint}: ${e}`);
          continue;
        }

        // Record distribution
        await sql`
          INSERT INTO fee_distributions (id, token_mint, agent_id, agent_wallet, amount_sol, tx_signature, created_at)
          SELECT gen_random_uuid()::text, ${tokenMint}, t.agent_id, ${agentInfo.agentWallet},
                 ${agentShare}, ${sig.signature}, now()
          FROM tokens t WHERE t.mint = ${tokenMint}
          LIMIT 1
        `;

        // Update token + agent totals
        await sql`
          UPDATE tokens
          SET creator_fees_total = creator_fees_total + ${received},
              fees_distributed = fees_distributed + ${agentShare},
              updated_at = now()
          WHERE mint = ${tokenMint}
        `;

        await sql`
          UPDATE agents
          SET total_earned = total_earned + ${agentShare}, updated_at = now()
          WHERE id = (SELECT agent_id FROM tokens WHERE mint = ${tokenMint} LIMIT 1)
        `;

        processed++;
        distributed += agentShare;
      } catch (e) {
        errors.push(`Error processing sig ${sig.signature}: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Fatal error: ${e}`);
  }

  return { processed, distributed, errors };
}
