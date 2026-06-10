import { PUMPFUN_API, HELIUS_RPC, HELIUS_API_KEY } from "./constants";

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  agentWallet: string;
}

export interface LaunchResult {
  mint: string;
  signature: string;
  url: string;
}

export async function uploadImageToPumpfun(imageUrl: string): Promise<string> {
  const imgRes = await fetch(imageUrl);
  const blob = await imgRes.blob();
  const form = new FormData();
  form.append("file", blob, "token.png");
  const res = await fetch(`${PUMPFUN_API}/ipfs`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`IPFS upload failed: ${res.statusText}`);
  const json = await res.json();
  return json.metadataUri;
}

export async function launchTokenOnPumpfun(params: LaunchTokenParams): Promise<LaunchResult> {
  const { name, symbol, description, imageUrl, twitter, telegram, website } = params;

  const ipfsRes = await fetch(`${PUMPFUN_API}/ipfs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, symbol, description, twitter, telegram, website, showName: true }),
  });
  if (!ipfsRes.ok) throw new Error(`Metadata upload failed: ${ipfsRes.statusText}`);
  const { metadataUri } = await ipfsRes.json();

  const mintKeypair = generateMintKeypair();

  const launchRes = await fetch(`${PUMPFUN_API}/trade?api-key=public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      tokenMetadata: { name, symbol, uri: metadataUri },
      mint: mintKeypair.publicKey,
      denominatedInSol: "true",
      amount: 0,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });

  if (!launchRes.ok) throw new Error(`Launch failed: ${launchRes.statusText}`);
  const tx = await launchRes.arrayBuffer();

  return {
    mint: mintKeypair.publicKey,
    signature: "pending",
    url: `https://pump.fun/coin/${mintKeypair.publicKey}`,
  };
}

function generateMintKeypair(): { publicKey: string } {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  for (const b of bytes) result += chars[b % chars.length];
  return { publicKey: result };
}

export async function getTokenData(mint: string) {
  if (!HELIUS_API_KEY) return null;
  const res = await fetch(
    `https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mintAccounts: [mint] }),
    }
  );
  if (!res.ok) return null;
  const json = await res.json();
  return json[0] ?? null;
}
