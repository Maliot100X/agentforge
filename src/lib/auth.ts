import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import sql from "@/lib/db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "agentforge-change-me-in-production"
);

export async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("af_session")?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest) {
  // 1. Check session cookie
  const token = req.cookies.get("af_session")?.value;
  if (token) {
    try { return await verifyToken(token); } catch { /* fall through */ }
  }

  // 2. Check Authorization: Bearer <api_key>
  const auth = req.headers.get("authorization") ?? "";
  if (auth.startsWith("Bearer ")) {
    const apiKey = auth.slice(7).trim();
    if (apiKey) {
      try {
        const [agent] = await sql`
          SELECT agent_id, id, wallet FROM agents WHERE api_key = ${apiKey} LIMIT 1
        `;
        if (agent) {
          return { agentId: agent.agent_id, id: agent.id, wallet: agent.wallet } as Record<string, unknown>;
        }
      } catch { /* fall through */ }
    }
  }

  return null;
}

export function generateApiKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return "af_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateAgentId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return "agent_" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
