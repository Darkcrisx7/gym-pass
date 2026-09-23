import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiOwner } from "@/lib/apiSession";
import { hashPassword } from "@/lib/auth";

const StaffSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const session = await requireApiOwner();
  if (session instanceof NextResponse) return session;

  const json = await req.json().catch(() => null);
  const parsed = StaffSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { gymId: session.gymId, name, email, passwordHash, role: "STAFF" },
  });

  return NextResponse.json({ ok: true });
}
