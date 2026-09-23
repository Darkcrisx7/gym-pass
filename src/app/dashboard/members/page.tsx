import Link from "next/link";
import { requireSession } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { computeStatus, MembershipStatus } from "@/lib/membership";
import StatusPill from "@/components/StatusPill";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string; sort?: string };
}) {
  const session = await requireSession();
  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: session.gymId } });

  const q = searchParams.q?.trim() ?? "";
  const statusFilter = (searchParams.status ?? "all") as MembershipStatus | "all";
  const sort = searchParams.sort === "expiry" ? "expiry" : "recent";

  const members = await prisma.member.findMany({
    where: {
      gymId: session.gymId,
      ...(q
        ? {
            OR: [
              { fullName: { contains: q } },
              { memberCode: { contains: q } },
              { mobile: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: sort === "expiry" ? { expiryDate: "asc" } : { createdAt: "desc" },
  });

  const now = new Date();
  let withStatus = members.map((m) => ({
    ...m,
    status: computeStatus(m.expiryDate, m.isActive, gym.expiringSoonDays, now),
  }));
  if (statusFilter !== "all") {
    withStatus = withStatus.filter((m) => m.status === statusFilter);
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold">Members</h1>
        <Link href="/dashboard/members/new" className="btn-primary">
          Add member
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, ID, or mobile"
          className="field-input max-w-xs"
        />
        <select name="status" defaultValue={statusFilter} className="field-input w-auto">
          <option value="all">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select name="sort" defaultValue={sort} className="field-input w-auto">
          <option value="recent">Recently added</option>
          <option value="expiry">Expiry date</option>
        </select>
        <button type="submit" className="btn-ghost">
          Apply
        </button>
      </form>

      {withStatus.length === 0 ? (
        <div className="panel mt-8 p-10 text-center">
          <p className="font-medium">
            {members.length === 0 ? "No members yet" : "No members match your search"}
          </p>
          <p className="mt-1.5 text-sm text-muted">
            {members.length === 0
              ? "Add your first member to create their digital membership card."
              : "Try a different name, ID, or filter."}
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-paper/10 rounded-card border border-paper/10">
          {withStatus.map((m) => (
            <li key={m.id}>
              <Link
                href={`/dashboard/members/${m.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-paper/5"
              >
                <div className="min-w-0">
                  <p className="truncate">{m.fullName}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {m.memberCode} · {m.mobile}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden text-xs text-muted sm:inline">{m.plan}</span>
                  <StatusPill status={m.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
