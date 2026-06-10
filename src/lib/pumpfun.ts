import { Keypair, VersionedTransaction, Connection } from "@solana/web3.js";
import bs58 from "bs58";
import { HELIUS_RPC, PUMPFUN_API } from "./constants";

export interface LaunchTokenParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export interface LaunchResult {
  mint: string;
  signature: string;
  url: string;
}

function getPlatformKeypair(): Keypair {
  const privateKeyB58 = process.env.PLATFORM_WALLET_PRIVATE;
  if (!privateKeyB58) throw new Error("PLATFORM_WALLET_PRIVATE not set");
  return Keypair.fromSecretKey(bs58.decode(privateKeyB58));
}

export async function uploadMetadataToPumpfun(
  params: LaunchTokenParams & { imageBlob: Blob }
): Promise<string> {
  const form = new FormData();
  form.append("file", params.imageBlob, "token.png");
  form.append("name", params.name);
  form.append("symbol", params.symbol);
  form.append("description", params.description);
  if (params.twitter) form.append("twitter", params.twitter);
  if (params.telegram) form.append("telegram", params.telegram);
  if (params.website) form.append("website", params.website);
  form.append("showName", "true");

  const res = await fetch(`${PUMPFUN_API}/ipfs`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Metadata upload failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  if (!json.metadataUri) throw new Error("No metadataUri in IPFS response");
  return json.metadataUri as string;
}

export async function launchTokenOnPumpfun(params: LaunchTokenParams): Promise<LaunchResult> {
  const { name, symbol, description, imageUrl, twitter, telegram, website } = params;

  // Fetch image blob
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
  const imageBlob = await imgRes.blob();

  const metadataUri = await uploadMetadataToPumpfun({
    name, symbol, description, imageUrl, twitter, telegram, website, imageBlob,
  });

  const platformKeypair = getPlatformKeypair();
  const mintKeypair = Keypair.generate();

  // Build launch transaction via pumpportal
  const launchRes = await fetch(`${PUMPFUN_API}/trade?api-key=public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      tokenMetadata: { name, symbol, uri: metadataUri },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: 0,
      slippage: 10,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });

  if (!launchRes.ok) throw new Error(`Launch request failed: ${launchRes.status} ${await launchRes.text()}`);

  const txBuffer = await launchRes.arrayBuffer();
  if (txBuffer.byteLength === 0) throw new Error("Empty transaction buffer from pumpportal");

  const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
  tx.sign([platformKeypair, mintKeypair]);

  const connection = new Connection(HELIUS_RPC, "confirmed");
  const signature = await connection.sendTransaction(tx, {
    maxRetries: 3,
    skipPreflight: false,
  });

  await connection.confirmTransaction(signature, "confirmed");

  const mint = mintKeypair.publicKey.toBase58();
  return {
    mint,
    signature,
    url: `https://pump.fun/coin/${mint}`,
  };
}

export async function getTokenData(mint: string) {
  const heliusKey = process.env.HELIUS_API_KEY;
  if (!heliusKey) return null;
  try {
    const res = await fetch(
      `https://api.helius.xyz/v0/token-metadata?api-key=${heliusKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mintAccounts: [mint] }),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json[0] ?? null;
  } catch {
    return null;
  }
}
