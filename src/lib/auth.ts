import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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
  const token = req.cookies.get("af_session")?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
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
