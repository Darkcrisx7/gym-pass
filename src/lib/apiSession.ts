import { NextResponse } from "next/server";
import { getSession, SessionPayload } from "./auth";

// Every members/renewal/settings API route calls this first and scopes its
// Prisma query with `gymId: session.gymId` — that filter, applied on every
// single query, is the entire cross-gym isolation guarantee.
export async function requireApiSession(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }
  return session;
}

export async function requireApiOwner(): Promise<SessionPayload | NextResponse> {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;
  if (session.role !== "OWNER") {
    return NextResponse.json({ error: "Only the gym owner can do this." }, { status: 403 });
  }
  return session;
}
