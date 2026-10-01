import QrCode from "./QrCode";

type Status = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INACTIVE";

const STATUS_TEXT: Record<Status, string> = {
  ACTIVE: "ACTIVE",
  EXPIRING_SOON: "EXPIRING SOON",
  EXPIRED: "EXPIRED",
  INACTIVE: "INACTIVE",
};

const STATUS_STYLES: Record<Status, string> = {
  ACTIVE: "bg-active/20 text-[#6EE7B7]",
  EXPIRING_SOON: "bg-expiring/20 text-[#FBBF6B]",
  EXPIRED: "bg-expired/20 text-[#F6968A]",
  INACTIVE: "bg-white/10 text-white/60",
};

export default function MembershipCardPreview({
  gymName,
  gymLogoUrl,
  memberName,
  memberPhotoUrl,
  memberCode,
  plan,
  startDate,
  expiryDate,
  status,
  primaryColor = "#2F6FED",
  qrValue,
}: {
  gymName: string;
  gymLogoUrl?: string | null;
  memberName: string;
  memberPhotoUrl?: string | null;
  memberCode: string;
  plan: string;
  startDate: string;
  expiryDate: string;
  status: Status;
  primaryColor?: string;
  qrValue?: string;
}) {
  const gymInitials = gymName.slice(0, 1).toUpperCase();

  return (
    <div
      className="relative overflow-hidden rounded-card bg-cardInk p-6 text-cardText shadow-card"
      style={{
        backgroundImage: `radial-gradient(130% 160% at 100% 0%, ${primaryColor}26 0%, transparent 55%)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        {gymLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gymLogoUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-cardInk"
            style={{ backgroundColor: primaryColor }}
          >
            {gymInitials}
          </span>
        )}
        <span className="text-sm font-bold uppercase tracking-wide">{gymName}</span>
      </div>

      <div className="mt-7 flex items-center gap-4">
        {memberPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={memberPhotoUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover border border-white/15"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg font-semibold">
            {memberName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-bold leading-tight">{memberName}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-white/50">Member ID</p>
          <p className="font-mono text-xs tracking-wide text-white/80">{memberCode}</p>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10 pt-5 text-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Plan</p>
        <p className="mt-0.5">{plan}</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50">Start date</p>
            <p className="mt-0.5">{startDate}</p>
          </div>
          <div>
            <p className="text-xs text-white/50">Valid until</p>
            <p className="mt-0.5">{expiryDate}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
        <span className={`status-pill ${STATUS_STYLES[status]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {STATUS_TEXT[status]}
        </span>
        <div className="rounded-lg bg-white p-1.5">
          {qrValue ? (
            <QrCode value={qrValue} size={72} fgColor="#121826" bgColor="#FFFFFF" />
          ) : (
            <div className="grid h-[72px] w-[72px] grid-cols-5 gap-[3px] p-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-[1px] bg-cardInk"
                  style={{ opacity: [0, 3, 5, 6, 9, 12, 14, 18, 20, 24].includes(i) ? 1 : 0.12 }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
