import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/apiSession";
import { computeStatus } from "@/lib/membership";

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const member = await prisma.member.findUnique({
    where: { cardToken: params.token },
    include: { gym: true },
  });

  // A token that doesn't exist, or that belongs to a different gym than the
  // scanning staff member's own, both come back as "invalid" — the response
  // never reveals that a matching card exists elsewhere.
  if (!member || member.gymId !== session.gymId) {
    return NextResponse.json({ valid: false }, { status: 404 });
  }

  const status = computeStatus(member.expiryDate, member.isActive, member.gym.expiringSoonDays);

  return NextResponse.json({
    valid: true,
    status,
    member: {
      id: member.id,
      fullName: member.fullName,
      photoUrl: member.photoUrl,
      memberCode: member.memberCode,
      mobile: member.mobile,
      plan: member.plan,
      startDate: member.startDate,
      expiryDate: member.expiryDate,
      paymentStatus: member.paymentStatus,
      emergencyName: member.emergencyName,
      emergencyNumber: member.emergencyNumber,
      notes: member.notes,
    },
  });
}
