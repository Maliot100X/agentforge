import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import sql from "@/lib/db";
import { signToken } from "@/lib/auth";

const schema = z.object({ api_key: z.string().min(10) });

export async function POST(req: NextRequest) {
  try {
    const { api_key } = schema.parse(await req.json());

    const [agent] = await sql`
      SELECT id, agent_id, name, wallet FROM agents WHERE api_key = ${api_key} LIMIT 1
    `;
    if (!agent) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

    const token = await signToken({ agentId: agent.agent_id, id: agent.id, wallet: agent.wallet });

    const res = NextResponse.json({ token, agent_id: agent.agent_id, name: agent.name });
    const isProd = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://youragenthome");
    res.cookies.set("af_session", token, { httpOnly: true, secure: isProd, sameSite: "lax", maxAge: 604800 });
    return res;
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 });
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
