import Link from "next/link";
import { prisma } from "@/lib/db";
import { computeStatus, STATUS_LABEL, STATUS_DOT } from "@/lib/membership";

export default async function PublicVerifyPage({ params }: { params: { token: string } }) {
  const member = await prisma.member.findUnique({
    where: { cardToken: params.token },
    include: { gym: true },
  });

  if (!member) {
    return (
      <Result
        icon="!"
        iconTone="bg-expired/15 text-expired"
        title="Invalid membership card"
        subtitle="This QR code doesn't match a known membership card."
      />
    );
  }

  const status = computeStatus(member.expiryDate, member.isActive, member.gym.expiringSoonDays);
  const tone =
    status === "ACTIVE"
      ? "bg-active/15 text-active"
      : status === "EXPIRING_SOON"
      ? "bg-expiring/15 text-expiring"
      : "bg-expired/15 text-expired";

  return (
    <Result
      icon={status === "ACTIVE" ? "✓" : status === "EXPIRING_SOON" ? "!" : "✕"}
      iconTone={tone}
      title={STATUS_LABEL[status]}
      subtitle={`${member.fullName} · ${member.gym.name}`}
      dot={STATUS_DOT[status]}
      cardToken={member.cardToken}
    />
  );
}

function Result({
  icon,
  iconTone,
  title,
  subtitle,
  dot,
  cardToken,
}: {
  icon: string;
  iconTone: string;
  title: string;
  subtitle: string;
  dot?: string;
  cardToken?: string;
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-6 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-full text-xl ${iconTone}`}>
        {icon}
      </div>
      <div className="mt-4 flex items-center gap-2">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        <h1 className="font-display text-xl">{title}</h1>
      </div>
      <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      {cardToken && (
        <Link
          href={`/card/${cardToken}`}
          className="btn-ghost mt-6"
        >
          View full card
        </Link>
      )}
    </main>
  );
}
