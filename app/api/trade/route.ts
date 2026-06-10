import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { getSwapQuote } from "@/lib/jupiter";
import { SOL_MINT, USDC_MINT } from "@/lib/constants";

const schema = z.object({
  inputMint: z.string().default(SOL_MINT),
  outputMint: z.string().default(USDC_MINT),
  amount: z.number().positive(),
  slippageBps: z.number().min(1).max(5000).default(50),
});

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const [agent] = await sql`SELECT id FROM agents WHERE agent_id = ${session.agentId as string}`;
    if (!agent) return NextResponse.json({ error: "Agent not found" }, { status: 404 });

    const quote = await getSwapQuote(body);

    const [trade] = await sql`
      INSERT INTO trades (id, agent_id, input_mint, output_mint, input_amount, output_amount, status, pnl, created_at)
      VALUES (gen_random_uuid()::text, ${agent.id}, ${body.inputMint}, ${body.outputMint},
        ${body.amount}, ${Number(quote.outAmount)}, 'quoted', 0, now())
      RETURNING id
    `;

    return NextResponse.json({ trade_id: trade.id, quote });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Trade failed" }, { status: 500 });
  }
}
