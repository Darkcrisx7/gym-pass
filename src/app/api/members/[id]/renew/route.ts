import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/apiSession";
import { addMonths, DURATIONS } from "@/lib/membership";

const RenewSchema = z.object({
  duration: z.string(),
  expiryDate: z.string().optional(), // required only when duration === "custom"
  amount: z.coerce.number().min(0),
  paymentStatus: z.enum(["PAID", "PENDING", "PARTIAL"]),
  notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const json = await req.json().catch(() => null);
  const parsed = RenewSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const member = await prisma.member.findFirst({
    where: { id: params.id, gymId: session.gymId },
  });
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const now = new Date();
  // Renewing from whichever is later — today, or the existing expiry —
  // means an early renewal adds to the time the member already has left,
  // instead of accidentally shortening it.
  const renewalBase = member.expiryDate > now ? member.expiryDate : now;

  let newExpiry: Date;
  let durationLabel: string;
  const preset = DURATIONS.find((d) => d.value === data.duration);
  if (data.duration === "custom") {
    if (!data.expiryDate) {
      return NextResponse.json({ error: "Choose a new expiry date" }, { status: 400 });
    }
    newExpiry = new Date(data.expiryDate);
    durationLabel = "Custom";
  } else if (preset) {
    newExpiry = addMonths(renewalBase, preset.months);
    durationLabel = preset.label;
  } else {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }
  if (isNaN(newExpiry.getTime()) || newExpiry <= renewalBase) {
    return NextResponse.json(
      { error: "New expiry date must be after the current expiry" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.member.update({
      where: { id: member.id },
      data: {
        expiryDate: newExpiry,
        amountPaid: data.amount,
        paymentStatus: data.paymentStatus,
        isActive: true,
        notes: data.notes || member.notes,
      },
    }),
    prisma.membershipRenewal.create({
      data: {
        gymId: session.gymId,
        memberId: member.id,
        plan: member.plan,
        durationLabel,
        startDate: renewalBase,
        endDate: newExpiry,
        amount: data.amount,
        paymentStatus: data.paymentStatus,
        notes: data.notes || null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
