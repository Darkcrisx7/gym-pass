import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireApiOwner } from "@/lib/apiSession";

const SettingsSchema = z.object({
  name: z.string().trim().min(2),
  logoUrl: z.string().trim().optional(),
  primaryColor: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  contactNumber: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
  expiringSoonDays: z.coerce.number().min(1).max(60).optional(),
});

export async function PATCH(req: Request) {
  const session = await requireApiOwner();
  if (session instanceof NextResponse) return session;

  const json = await req.json().catch(() => null);
  const parsed = SettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;

  await prisma.gym.update({
    where: { id: session.gymId },
    data: {
      name: d.name,
      logoUrl: d.logoUrl || null,
      primaryColor: d.primaryColor || undefined,
      secondaryColor: d.secondaryColor || undefined,
      contactNumber: d.contactNumber || null,
      whatsapp: d.whatsapp || null,
      address: d.address || null,
      expiringSoonDays: d.expiringSoonDays,
    },
  });

  return NextResponse.json({ ok: true });
}
