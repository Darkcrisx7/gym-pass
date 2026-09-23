import { requireOwner } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import AddStaffForm from "@/components/AddStaffForm";
import RemoveStaffButton from "@/components/RemoveStaffButton";

export default async function StaffPage() {
  const session = await requireOwner();
  const staff = await prisma.user.findMany({
    where: { gymId: session.gymId, role: "STAFF" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Staff</h1>
      <p className="mt-1.5 text-sm text-muted">
        Staff can scan cards and search members. They can't edit members, manage
        billing, or change gym settings.
      </p>

      <div className="mt-8 panel p-5">
        <h2 className="font-medium">Add staff</h2>
        <AddStaffForm />
      </div>

      <div className="mt-8">
        <h2 className="font-medium">Current staff</h2>
        {staff.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No staff accounts yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-paper/10 rounded-card border border-paper/10">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p>{s.name}</p>
                  <p className="text-xs text-muted">{s.email}</p>
                </div>
                <RemoveStaffButton staffId={s.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
