import Link from "next/link";
import { requireSession } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { computeStatus, MembershipStatus } from "@/lib/membership";
import StatusPill from "@/components/StatusPill";

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

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
    <div className="px-6 py-8 lg:px-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold tracking-tight">Members</h1>
        <Link href="/dashboard/members/new" className="btn-primary">
          + Add member
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name, member ID or mobile…"
          className="field-input max-w-xs"
        />
        <select name="status" defaultValue={statusFilter} className="field-input w-auto">
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring soon</option>
          <option value="EXPIRED">Expired</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select name="sort" defaultValue={sort} className="field-input w-auto">
          <option value="recent">Recently added</option>
          <option value="expiry">Expiry Date</option>
        </select>
        <button type="submit" className="btn-ghost">
          Apply
        </button>
      </form>

      {withStatus.length === 0 ? (
        <div className="panel mt-6 p-10 text-center">
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
        <div className="panel mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">Member ID</th>
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Expiry Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {withStatus.map((m) => (
                <tr key={m.id} className="hover:bg-bg">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/members/${m.id}`} className="flex items-center gap-3">
                      <Avatar name={m.fullName} photoUrl={m.photoUrl} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.fullName}</p>
                        <p className="truncate text-xs text-muted">{m.mobile}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{m.memberCode}</td>
                  <td className="px-5 py-3.5">{m.plan}</td>
                  <td className="px-5 py-3.5 text-muted">{fmt(m.expiryDate)}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={m.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/dashboard/members/${m.id}`}
                      className="text-sm text-accent hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photoUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-xs font-semibold text-muted">
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
