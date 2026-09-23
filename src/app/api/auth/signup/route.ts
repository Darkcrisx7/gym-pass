import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionCookie } from "@/lib/auth";

const SignupSchema = z.object({
  gymName: z.string().trim().min(2, "Gym name is too short"),
  ownerName: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  mobile: z.string().trim().min(6, "Enter a valid mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  address: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = SignupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { gymName, ownerName, email, mobile, password, address } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const { gym, user } = await prisma.$transaction(async (tx) => {
    const gym = await tx.gym.create({
      data: { name: gymName, address },
    });
    const user = await tx.user.create({
      data: {
        gymId: gym.id,
        name: ownerName,
        email,
        mobile,
        passwordHash,
        role: "OWNER",
      },
    });
    return { gym, user };
  });

  await createSessionCookie({
    userId: user.id,
    gymId: gym.id,
    role: "OWNER",
    name: user.name,
  });

  return NextResponse.json({ ok: true });
}
