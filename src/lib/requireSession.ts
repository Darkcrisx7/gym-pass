import { redirect } from "next/navigation";
import { getSession, SessionPayload } from "./auth";

// Use in Server Components (pages/layouts) that must be behind login.
// Every dashboard page calls this first, then scopes all its Prisma queries
// with `gymId: session.gymId` — that single filter is what keeps one gym's
// data from ever being reachable by another gym's owner or staff.
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireOwner(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== "OWNER") {
    redirect("/dashboard?error=owner-only");
  }
  return session;
}
