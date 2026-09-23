import { requireOwner } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await requireOwner();
  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: session.gymId } });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Gym settings</h1>
      <p className="mt-1.5 text-sm text-muted">
        These details appear on every member's digital card.
      </p>
      <SettingsForm gym={gym} />
    </div>
  );
}
