import { Keypair } from "@solana/web3.js";
import { HELIUS_RPC } from "./constants";

export function generateWallet(): { publicKey: string; secretKey: string } {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Buffer.from(keypair.secretKey).toString("base64"),
  };
}

export async function getSolBalance(wallet: string): Promise<number> {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [wallet],
    }),
  });
  const json = await res.json();
  return (json.result?.value ?? 0) / 1e9;
}

export async function getTokenAccounts(wallet: string) {
  const res = await fetch(HELIUS_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [wallet, { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, { encoding: "jsonParsed" }],
    }),
  });
  const json = await res.json();
  return json.result?.value ?? [];
}
