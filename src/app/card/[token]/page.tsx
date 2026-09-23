import { prisma } from "@/lib/db";
import { computeStatus } from "@/lib/membership";
import MembershipCardPreview from "@/components/MembershipCardPreview";
import ShareCardButton from "@/components/ShareCardButton";

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function PublicCardPage({ params }: { params: { token: string } }) {
  const member = await prisma.member.findUnique({
    where: { cardToken: params.token },
    include: { gym: true },
  });

  if (!member) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-expired/15 text-expired">
          !
        </div>
        <h1 className="mt-4 font-display text-xl">Card not found</h1>
        <p className="mt-1.5 text-sm text-muted">
          This membership card link is invalid or no longer exists.
        </p>
      </main>
    );
  }

  const status = computeStatus(member.expiryDate, member.isActive, member.gym.expiringSoonDays);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const cardUrl = `${appUrl}/card/${member.cardToken}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <MembershipCardPreview
        gymName={member.gym.name}
        gymLogoUrl={member.gym.logoUrl}
        memberName={member.fullName}
        memberCode={member.memberCode}
        plan={member.plan}
        startDate={fmt(member.startDate)}
        expiryDate={fmt(member.expiryDate)}
        status={status}
        primaryColor={member.gym.primaryColor}
        qrValue={cardUrl}
      />

      <div className="mt-5">
        <ShareCardButton cardUrl={cardUrl} gymName={member.gym.name} memberName={member.fullName} />
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        Add this page to your home screen for one-tap access: open your
        browser's share menu and choose "Add to Home Screen."
      </p>
    </main>
  );
}
