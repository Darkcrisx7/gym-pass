import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/apiSession";

const UpdateSchema = z.object({
  fullName: z.string().trim().min(1).optional(),
  mobile: z.string().trim().min(6).optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  paymentStatus: z.enum(["PAID", "PENDING", "PARTIAL"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const json = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Scoping the update by gymId (not just id) means a well-formed request
  // for a member that belongs to another gym silently matches zero rows.
  const result = await prisma.member.updateMany({
    where: { id: params.id, gymId: session.gymId },
    data: parsed.data,
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const result = await prisma.member.deleteMany({
    where: { id: params.id, gymId: session.gymId },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
