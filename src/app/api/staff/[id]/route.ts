import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiOwner } from "@/lib/apiSession";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireApiOwner();
  if (session instanceof NextResponse) return session;

  const result = await prisma.user.deleteMany({
    where: { id: params.id, gymId: session.gymId, role: "STAFF" },
  });
  if (result.count === 0) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
