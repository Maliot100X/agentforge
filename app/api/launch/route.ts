import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { launchTokenOnPumpfun } from "@/lib/pumpfun";
import { getTreasuryBalance, verifyDepositToPlatform } from "@/lib/solana";

const GASLESS_MIN_SOL = 0.02;
const SELF_FUND_SOL = 0.03;

const launchSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(10).toUpperCase(),
  description: z.string().max(500).optional().default(""),
  imageUrl: z.string().url(),
  twitter: z.string().optional(),
  telegram: z.string().optional(),
  website: z.string().optional(),
  // Self-funded: provide deposit tx to use instead of treasury
  depositTx: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const treasury = await getTreasuryBalance();
  return NextResponse.json({
    treasury_sol: treasury,
    gasless_available: treasury >= GASLESS_MIN_SOL,
    gasless_cost: GASLESS_MIN_SOL,
    self_fund_amount: SELF_FUND_SOL,
    platform_wallet: process.env.PLATFORM_WALLET_PUBLIC,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = launchSchema.parse(await req.json());
    const { name, symbol, description, imageUrl, twitter, telegram, website, depositTx } = body;

    const [agent] = await sql`
      SELECT id, wallet FROM agents WHERE agent_id = ${session.agentId as string} LIMIT 1
    `;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    let fundingSource = "gasless";

    if (depositTx) {
      // Self-funded path: verify deposit tx
      const alreadyUsed = await sql`
        SELECT id FROM funded_deposits WHERE tx_hash = ${depositTx} AND used_for_launch = true LIMIT 1
      `;
      if (alreadyUsed.length > 0) {
        return NextResponse.json({ error: "This deposit tx was already used for a launch" }, { status: 400 });
      }

      const { valid, amountSol } = await verifyDepositToPlatform(depositTx, SELF_FUND_SOL);
      if (!valid) {
        return NextResponse.json({
          error: `Deposit not verified. Send exactly ${SELF_FUND_SOL} SOL to ${process.env.PLATFORM_WALLET_PUBLIC} first, then provide the tx signature.`,
        }, { status: 400 });
      }

      // Record deposit as verified + used
      await sql`
        INSERT INTO funded_deposits (id, agent_id, tx_hash, amount_sol, verified, used_for_launch, created_at)
        VALUES (gen_random_uuid()::text, ${agent.id}, ${depositTx}, ${amountSol}, true, true, now())
        ON CONFLICT (tx_hash) DO UPDATE SET verified = true, used_for_launch = true
      `;

      fundingSource = "self_funded";
    } else {
      // Gasless path: check treasury
      const treasury = await getTreasuryBalance();
      if (treasury < GASLESS_MIN_SOL) {
        return NextResponse.json({
          error: "Treasury low — gasless unavailable right now.",
          gasless_available: false,
          self_fund_option: {
            amount: SELF_FUND_SOL,
            platform_wallet: process.env.PLATFORM_WALLET_PUBLIC,
            instruction: `Send ${SELF_FUND_SOL} SOL to the platform wallet, then re-call this endpoint with depositTx = <your_tx_signature>`,
          },
        }, { status: 503 });
      }
    }

    const result = await launchTokenOnPumpfun({ name, symbol, description, imageUrl, twitter, telegram, website });

    await sql`
      INSERT INTO tokens (
        id, mint, name, symbol, image_url, description,
        agent_id, agent_wallet, tx_signature, pump_url, funding_source,
        status, created_at, updated_at
      ) VALUES (
        gen_random_uuid()::text, ${result.mint}, ${name}, ${symbol},
        ${imageUrl}, ${description}, ${agent.id}, ${agent.wallet as string},
        ${result.signature}, ${result.url}, ${fundingSource},
        'live', now(), now()
      )
    `;

    return NextResponse.json({
      mint: result.mint,
      signature: result.signature,
      url: result.url,
      funding_source: fundingSource,
      message: `Token ${symbol} launched on pump.fun. You earn 65% of all creator fees.`,
    });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error("[launch]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
