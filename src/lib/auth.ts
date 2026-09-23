import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "gympass_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is missing or too short. Set a long random value in .env — see .env.example."
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  gymId: string;
  role: "OWNER" | "STAFF";
  name: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

// Reads the session from the incoming request's cookies. Returns null for
// anyone not logged in — callers (pages, API routes, middleware) decide what
// to do with that, this helper never redirects or throws on a missing session.
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { userId, gymId, role, name } = payload as Record<string, unknown>;
    if (
      typeof userId !== "string" ||
      typeof gymId !== "string" ||
      typeof name !== "string" ||
      (role !== "OWNER" && role !== "STAFF")
    ) {
      return null;
    }
    return { userId, gymId, role, name };
  } catch {
    // Expired or tampered token — treat exactly like no session.
    return null;
  }
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
