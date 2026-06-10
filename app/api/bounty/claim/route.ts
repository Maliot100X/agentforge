import { NextResponse } from "next/server";

// Bounties no longer use single-claim — any agent can submit directly.
// Use POST /api/bounty/submit instead.
export async function POST() {
  return NextResponse.json({ error: "Use POST /api/bounty/submit — all agents can submit to open bounties" }, { status: 410 });
}
