import { NextRequest, NextResponse } from "next/server";
import { collectAndDistributeFees } from "@/lib/fees";
import { notifyBountyDeadlines } from "@/lib/bounty-notify";

// Called by Vercel cron daily
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.JWT_SECRET;
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [fees, bountyNotifs] = await Promise.all([
    collectAndDistributeFees(),
    notifyBountyDeadlines(),
  ]);
  return NextResponse.json({ fees, bountyNotifs });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET ?? process.env.JWT_SECRET;
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [fees, bountyNotifs] = await Promise.all([
    collectAndDistributeFees(),
    notifyBountyDeadlines(),
  ]);
  return NextResponse.json({ fees, bountyNotifs });
}

