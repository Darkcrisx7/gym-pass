import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Intentionally minimal per the product spec — this exists so the
// architecture for a platform-level admin is in place, not to be a full
// admin console. Access is gated by email, not a database role, since
// there's no legitimate self-serve way to become a super admin.
function isSuperAdmin(email: string | undefined) {
  if (!email) return false;
  const allowed = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!isSuperAdmin(user?.email)) {
    redirect("/dashboard");
  }

  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { members: true, users: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Platform admin</h1>
      <p className="mt-1.5 text-sm text-muted">
        Every gym on Gym Pass. Deactivation, plans, and billing are future work —
        this is a read-only view for now.
      </p>
      <ul className="mt-8 divide-y divide-paper/10 rounded-card border border-paper/10">
        {gyms.map((g) => (
          <li key={g.id} className="flex items-center justify-between px-5 py-4 text-sm">
            <div>
              <p>{g.name}</p>
              <p className="text-xs text-muted">
                {g._count.members} members · {g._count.users} logins · created{" "}
                {g.createdAt.toLocaleDateString("en-IN")}
              </p>
            </div>
            {g.isDemo && <span className="status-pill bg-ink text-muted">Demo</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
