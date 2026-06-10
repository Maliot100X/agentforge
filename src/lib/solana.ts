import {
  Keypair,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import bs58 from "bs58";
import { HELIUS_RPC } from "./constants";

export function generateWallet(): { publicKey: string; secretKey: string } {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: Buffer.from(keypair.secretKey).toString("base64"),
  };
}

export async function getSolBalance(walletAddress: string): Promise<number> {
  try {
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const pubkey = new PublicKey(walletAddress);
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

export async function getTreasuryBalance(): Promise<number> {
  const pub = process.env.PLATFORM_WALLET_PUBLIC;
  if (!pub) return 0;
  return getSolBalance(pub);
}

// Send SOL from platform wallet to a recipient
export async function sendSolFromPlatform(
  recipientAddress: string,
  amountSol: number
): Promise<string> {
  const privateKeyB58 = process.env.PLATFORM_WALLET_PRIVATE;
  if (!privateKeyB58) throw new Error("PLATFORM_WALLET_PRIVATE not set");

  const platformKeypair = Keypair.fromSecretKey(bs58.decode(privateKeyB58));
  const connection = new Connection(HELIUS_RPC, "confirmed");
  const recipient = new PublicKey(recipientAddress);

  const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
  if (lamports <= 0) throw new Error("Amount too small");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: platformKeypair.publicKey,
      toPubkey: recipient,
      lamports,
    })
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [platformKeypair]);
  return sig;
}

// Verify a SOL transfer TO the platform wallet
export async function verifyDepositToPlatform(
  txSignature: string,
  expectedMinSol: number
): Promise<{ valid: boolean; amountSol: number }> {
  try {
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const platformPub = process.env.PLATFORM_WALLET_PUBLIC;
    if (!platformPub) return { valid: false, amountSol: 0 };

    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (!tx || tx.meta?.err) return { valid: false, amountSol: 0 };

    const platformIndex = tx.transaction.message.accountKeys.findIndex(
      (k) => k.pubkey.toBase58() === platformPub
    );
    if (platformIndex === -1) return { valid: false, amountSol: 0 };

    const pre = tx.meta!.preBalances[platformIndex];
    const post = tx.meta!.postBalances[platformIndex];
    const received = (post - pre) / LAMPORTS_PER_SOL;

    return {
      valid: received >= expectedMinSol,
      amountSol: received,
    };
  } catch {
    return { valid: false, amountSol: 0 };
  }
}

export async function getTokenAccounts(wallet: string) {
  try {
    const connection = new Connection(HELIUS_RPC, "confirmed");
    const pubkey = new PublicKey(wallet);
    const accounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    return accounts.value;
  } catch {
    return [];
  }
}
