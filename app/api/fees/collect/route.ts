import { NextRequest, NextResponse } from "next/server";
import { collectAndDistributeFees } from "@/lib/fees";

// Called by Vercel cron every 5 minutes
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.JWT_SECRET;
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await collectAndDistributeFees();
  return NextResponse.json(result);
}

// Allow manual trigger from dashboard (authenticated)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.JWT_SECRET;
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await collectAndDistributeFees();
  return NextResponse.json(result);
}
