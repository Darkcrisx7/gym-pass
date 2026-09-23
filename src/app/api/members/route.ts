import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiSession } from "@/lib/apiSession";
import { addMonths, buildMemberCode, generateCardToken, DURATIONS } from "@/lib/membership";

const MemberSchema = z.object({
  fullName: z.string().trim().min(1, "Enter the member's name"),
  mobile: z.string().trim().min(6, "Enter a valid mobile number"),
  email: z.string().trim().email().optional().or(z.literal("")),
  dob: z.string().optional().or(z.literal("")),
  gender: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyNumber: z.string().optional(),
  emergencyRelation: z.string().optional(),
  plan: z.string().trim().min(1, "Enter a plan name"),
  startDate: z.string().min(1, "Choose a start date"),
  duration: z.string(),
  expiryDate: z.string().optional(), // required only when duration === "custom"
  amountPaid: z.coerce.number().min(0, "Amount can't be negative"),
  paymentStatus: z.enum(["PAID", "PENDING", "PARTIAL"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const json = await req.json().catch(() => null);
  const parsed = MemberSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const durationPreset = DURATIONS.find((d) => d.value === data.duration);
  const startDate = new Date(data.startDate);
  if (isNaN(startDate.getTime())) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }

  let expiryDate: Date;
  let durationLabel: string;
  if (data.duration === "custom") {
    if (!data.expiryDate) {
      return NextResponse.json(
        { error: "Choose an expiry date for a custom duration" },
        { status: 400 }
      );
    }
    expiryDate = new Date(data.expiryDate);
    durationLabel = "Custom";
  } else if (durationPreset) {
    expiryDate = addMonths(startDate, durationPreset.months);
    durationLabel = durationPreset.label;
  } else {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }
  if (isNaN(expiryDate.getTime()) || expiryDate <= startDate) {
    return NextResponse.json(
      { error: "Expiry date must be after the start date" },
      { status: 400 }
    );
  }

  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: session.gymId } });
  const memberCount = await prisma.member.count({ where: { gymId: session.gymId } });

  const member = await prisma.$transaction(async (tx) => {
    // Retry the member code once on a rare race (two members created in the
    // same instant computing the same sequence number).
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await tx.member.create({
          data: {
            gymId: session.gymId,
            memberCode: buildMemberCode(gym.name, memberCount + 1 + attempt),
            cardToken: generateCardToken(),
            fullName: data.fullName,
            mobile: data.mobile,
            email: data.email || null,
            dob: data.dob ? new Date(data.dob) : null,
            gender: data.gender || null,
            emergencyName: data.emergencyName || null,
            emergencyNumber: data.emergencyNumber || null,
            emergencyRelation: data.emergencyRelation || null,
            plan: data.plan,
            startDate,
            expiryDate,
            amountPaid: data.amountPaid,
            paymentStatus: data.paymentStatus,
            notes: data.notes || null,
            renewals: {
              create: {
                gymId: session.gymId,
                plan: data.plan,
                durationLabel,
                startDate,
                endDate: expiryDate,
                amount: data.amountPaid,
                paymentStatus: data.paymentStatus,
              },
            },
          },
        });
      } catch (e) {
        if (attempt === 2) throw e;
      }
    }
    throw new Error("Could not create member");
  });

  return NextResponse.json({ id: member.id });
}
