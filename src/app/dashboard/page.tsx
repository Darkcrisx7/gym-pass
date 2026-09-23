import Link from "next/link";
import { requireSession } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { computeStatus } from "@/lib/membership";
import StatusPill from "@/components/StatusPill";

export default async function DashboardOverview() {
  const session = await requireSession();
  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: session.gymId } });

  const members = await prisma.member.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const withStatus = members.map((m) => ({
    ...m,
    status: computeStatus(m.expiryDate, m.isActive, gym.expiringSoonDays, now),
  }));

  const counts = {
    total: members.length,
    active: withStatus.filter((m) => m.status === "ACTIVE").length,
    expiringSoon: withStatus.filter((m) => m.status === "EXPIRING_SOON").length,
    expired: withStatus.filter((m) => m.status === "EXPIRED").length,
  };

  const recentMembers = withStatus.slice(0, 5);
  const recentRenewals = await prisma.membershipRenewal.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { member: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">{gym.name}</h1>
          <p className="mt-1 text-sm text-muted">Welcome back, {session.name.split(" ")[0]}.</p>
        </div>
        <Link href="/dashboard/members/new" className="btn-primary hidden sm:inline-flex">
          Add member
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={counts.total} />
        <StatCard label="Active" value={counts.active} tone="active" />
        <StatCard label="Expiring soon" value={counts.expiringSoon} tone="expiring" />
        <StatCard label="Expired" value={counts.expired} tone="expired" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3 sm:hidden">
        <Link href="/dashboard/members/new" className="btn-primary">
          Add member
        </Link>
        <Link href="/dashboard/scan" className="btn-ghost">
          Scan QR
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Recently added</h2>
            <Link href="/dashboard/members" className="text-sm text-muted hover:text-paper">
              View all
            </Link>
          </div>
          {recentMembers.length === 0 ? (
            <EmptyRow text="No members yet. Add your first member to create their digital membership card." />
          ) : (
            <ul className="mt-4 divide-y divide-paper/10">
              {recentMembers.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/dashboard/members/${m.id}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p>{m.fullName}</p>
                      <p className="text-xs text-muted">{m.memberCode}</p>
                    </div>
                    <StatusPill status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="font-medium">Recent renewals</h2>
          {recentRenewals.length === 0 ? (
            <EmptyRow text="No renewals yet. Renewal history will appear here once a member renews." />
          ) : (
            <ul className="mt-4 divide-y divide-paper/10">
              {recentRenewals.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/members/${r.memberId}`}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p>{r.member.fullName}</p>
                      <p className="text-xs text-muted">{r.durationLabel}</p>
                    </div>
                    <p className="text-xs text-muted">₹{r.amount.toLocaleString("en-IN")}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "active" | "expiring" | "expired";
}) {
  const dot =
    tone === "active"
      ? "bg-active"
      : tone === "expiring"
      ? "bg-expiring"
      : tone === "expired"
      ? "bg-expired"
      : "bg-muted";
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <p className="text-xs text-muted">{label}</p>
      </div>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return <p className="mt-4 text-sm text-muted">{text}</p>;
}
