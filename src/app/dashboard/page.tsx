import Link from "next/link";
import { requireSession } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { computeStatus } from "@/lib/membership";
import StatusPill from "@/components/StatusPill";
import MembershipCardPreview from "@/components/MembershipCardPreview";

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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

  const recentMembers = withStatus.slice(0, 6);
  const featuredMember = withStatus[0];
  const recentRenewals = await prisma.membershipRenewal.findMany({
    where: { gymId: session.gymId },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { member: true },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const gymInitials = gym.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cardInk text-xs font-bold text-white">
            {gymInitials}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{gym.name}</h1>
            <p className="text-sm text-muted">Welcome back, {session.name.split(" ")[0]}.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/scan" className="btn-ghost btn-glow">
            Scan Card
          </Link>
          <Link href="/dashboard/members/new" className="btn-primary btn-glow">
            Add member
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total members" value={counts.total} icon="people" tone="accent" />
        <StatCard label="Active" value={counts.active} icon="check" tone="active" />
        <StatCard label="Expiring soon" value={counts.expiringSoon} icon="clock" tone="expiring" />
        <StatCard label="Expired" value={counts.expired} icon="alert" tone="expired" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Members</h2>
            <Link href="/dashboard/members" className="flex items-center gap-1 text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>
          {recentMembers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">
              No members yet. Add your first member to create their digital membership card.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {recentMembers.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/dashboard/members/${m.id}`}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm hover:bg-bg -mx-2 px-2 rounded-lg"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={m.fullName} photoUrl={m.photoUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.fullName}</p>
                        <p className="truncate text-xs text-muted">
                          {m.memberCode} · {m.mobile}
                        </p>
                      </div>
                    </div>
                    <StatusPill status={m.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Digital Membership Card</h2>
              {featuredMember && (
                <Link
                  href={`/dashboard/members/${featuredMember.id}`}
                  className="flex items-center gap-1 text-sm text-accent hover:underline"
                >
                  View card →
                </Link>
              )}
            </div>
            <div className="mt-4">
              {featuredMember ? (
                <MembershipCardPreview
                  gymName={gym.name}
                  gymLogoUrl={gym.logoUrl}
                  memberName={featuredMember.fullName}
                  memberPhotoUrl={featuredMember.photoUrl}
                  memberCode={featuredMember.memberCode}
                  plan={featuredMember.plan}
                  startDate={fmt(featuredMember.startDate)}
                  expiryDate={fmt(featuredMember.expiryDate)}
                  status={featuredMember.status}
                  primaryColor={gym.primaryColor}
                  qrValue={`${appUrl}/card/${featuredMember.cardToken}`}
                />
              ) : (
                <p className="text-sm text-muted">
                  Add a member to see their digital card here.
                </p>
              )}
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Recent Renewals</h2>
              <Link href="/dashboard/members" className="flex items-center gap-1 text-sm text-accent hover:underline">
                View all →
              </Link>
            </div>
            {recentRenewals.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                No renewals yet. Renewal history will appear here once a member renews.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {recentRenewals.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/dashboard/members/${r.memberId}`}
                      className="flex items-center justify-between gap-3 py-3.5 text-sm hover:bg-bg -mx-2 px-2 rounded-lg"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={r.member.fullName} photoUrl={r.member.photoUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.member.fullName}</p>
                          <p className="text-xs text-muted">{r.durationLabel}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-muted">{fmt(r.createdAt)}</p>
                        <span className="status-pill bg-activeSoft text-active">PAID</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg text-xs font-semibold text-muted border border-border">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: "people" | "check" | "clock" | "alert";
  tone: "accent" | "active" | "expiring" | "expired";
}) {
  const toneClasses: Record<typeof tone, string> = {
    accent: "bg-accentSoft text-accent",
    active: "bg-activeSoft text-active",
    expiring: "bg-expiringSoft text-expiring",
    expired: "bg-expiredSoft text-expired",
  };
  return (
    <div className="panel p-5">
      <div className={`icon-badge ${toneClasses[tone]}`}>
        <StatIcon name={icon} />
      </div>
      <p className="mt-4 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function StatIcon({ name }: { name: "people" | "check" | "clock" | "alert" }) {
  const common = "h-5 w-5";
  switch (name) {
    case "people":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5s4.8 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8" />
          <path d="M15.8 14.8c2.1.2 3.7 1.6 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.5 12.3l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "alert":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 8v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      );
  }
}
