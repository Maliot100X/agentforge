import { createJupiterApiClient } from "@jup-ag/api";
import { JUPITER_API } from "./constants";

const jupiter = createJupiterApiClient({ basePath: JUPITER_API });

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}

export interface QuoteResult {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: unknown[];
}

export async function getSwapQuote(params: SwapParams): Promise<QuoteResult> {
  const { inputMint, outputMint, amount, slippageBps = 50 } = params;
  const quote = await jupiter.quoteGet({
    inputMint,
    outputMint,
    amount,
    slippageBps,
  });
  return quote as QuoteResult;
}

export async function getTokenPrice(mint: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.jup.ag/price/v2?ids=${mint}&showExtraInfo=false`
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[mint]?.price ?? null;
  } catch {
    return null;
  }
}
