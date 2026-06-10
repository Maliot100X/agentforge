import { NextResponse } from "next/server";
import { getTreasuryBalance } from "@/lib/solana";

const GASLESS_MIN_SOL = 0.02;

export async function GET() {
  try {
    const balance = await getTreasuryBalance();
    return NextResponse.json({
      balance_sol: balance,
      platform_wallet: process.env.PLATFORM_WALLET_PUBLIC,
      gasless_available: balance >= GASLESS_MIN_SOL,
      gasless_min: GASLESS_MIN_SOL,
    });
  } catch (e) {
    console.error("[treasury]", e);
    return NextResponse.json({ error: "Failed to fetch treasury" }, { status: 500 });
  }
}
