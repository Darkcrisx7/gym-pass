import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/requireSession";
import { prisma } from "@/lib/db";
import { computeStatus } from "@/lib/membership";
import MembershipCardPreview from "@/components/MembershipCardPreview";
import RenewMemberForm from "@/components/RenewMemberForm";
import MemberActions from "@/components/MemberActions";
import ShareCardButton from "@/components/ShareCardButton";

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const gym = await prisma.gym.findUniqueOrThrow({ where: { id: session.gymId } });

  // Scoping by gymId here (not just member id) is what stops a staff member
  // of Gym A from viewing a member of Gym B by guessing/pasting a URL.
  const member = await prisma.member.findFirst({
    where: { id: params.id, gymId: session.gymId },
  });
  if (!member) notFound();

  const renewals = await prisma.membershipRenewal.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
  });

  const status = computeStatus(member.expiryDate, member.isActive, gym.expiringSoonDays);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const cardUrl = `${appUrl}/card/${member.cardToken}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/dashboard/members" className="text-sm text-muted hover:text-paper">
        ← Members
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <MembershipCardPreview
            gymName={gym.name}
            gymLogoUrl={gym.logoUrl}
            memberName={member.fullName}
            memberPhotoUrl={member.photoUrl}
            memberCode={member.memberCode}
            plan={member.plan}
            startDate={fmt(member.startDate)}
            expiryDate={fmt(member.expiryDate)}
            status={status}
            primaryColor={gym.primaryColor}
            qrValue={cardUrl}
          />
          <div className="mt-4 flex gap-2">
            <ShareCardButton cardUrl={cardUrl} gymName={gym.name} memberName={member.fullName} />
            <Link href={`/card/${member.cardToken}`} target="_blank" className="btn-ghost flex-1 text-center">
              Open card
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-semibold">{member.fullName}</h1>
              <p className="text-sm text-muted">{member.memberCode}</p>
            </div>
            <MemberActions memberId={member.id} isActive={member.isActive} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Info label="Mobile" value={member.mobile} />
            <Info label="Email" value={member.email ?? "—"} />
            <Info label="Payment status" value={member.paymentStatus} />
            <Info label="Amount paid" value={`₹${member.amountPaid.toLocaleString("en-IN")}`} />
            {member.emergencyName && (
              <Info
                label="Emergency contact"
                value={`${member.emergencyName}${member.emergencyNumber ? " · " + member.emergencyNumber : ""}`}
              />
            )}
            {member.notes && <Info label="Notes" value={member.notes} span />}
          </dl>

          <div className="mt-8 panel p-5">
            <h2 className="font-medium">Renew membership</h2>
            <RenewMemberForm
              memberId={member.id}
              currentExpiry={member.expiryDate.toISOString()}
            />
          </div>

          <div className="mt-8">
            <h2 className="font-medium">Membership history</h2>
            {renewals.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                This member has not renewed their membership yet.
              </p>
            ) : (
              <ol className="mt-3 space-y-3">
                {renewals.map((r) => (
                  <li key={r.id} className="panel flex items-center justify-between p-4 text-sm">
                    <div>
                      <p>{r.durationLabel} · {r.plan}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {fmt(r.startDate)} → {fmt(r.endDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>₹{r.amount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted">{r.paymentStatus}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, span }: { label: string; value: string; span?: boolean }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
