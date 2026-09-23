import QrCode from "./QrCode";

type Status = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INACTIVE";

const STATUS_TEXT: Record<Status, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
};

const STATUS_DOT: Record<Status, string> = {
  ACTIVE: "bg-active",
  EXPIRING_SOON: "bg-expiring",
  EXPIRED: "bg-expired",
  INACTIVE: "bg-inactive",
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
  primaryColor = "#D8A945",
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
  return (
    <div
      className="relative overflow-hidden rounded-card border border-paper/10 bg-surface p-6 shadow-card"
      style={{
        backgroundImage: `radial-gradient(120% 140% at 0% 0%, ${primaryColor}22 0%, transparent 55%)`,
      }}
    >
      <div className="flex items-center gap-2.5">
        {gymLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gymLogoUrl} alt="" className="h-7 w-7 rounded-md object-cover" />
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold text-ink"
            style={{ backgroundColor: primaryColor }}
          >
            {gymName.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="font-display text-sm font-semibold tracking-tight">{gymName}</span>
      </div>

      <div className="mt-7 flex items-center gap-4">
        {memberPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={memberPhotoUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover border border-paper/15"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-paper/15 bg-ink font-display text-lg">
            {memberName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-display text-xl leading-tight">{memberName}</p>
          <p className="mt-1 font-mono text-xs tracking-wide text-muted">{memberCode}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-paper/10 pt-5 text-sm">
        <div className="col-span-2">
          <p className="text-xs text-muted">Plan</p>
          <p className="mt-0.5">{plan}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Start</p>
          <p className="mt-0.5">{startDate}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Valid until</p>
          <p className="mt-0.5">{expiryDate}</p>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-paper/10 pt-5">
        <span className="status-pill bg-ink">
          <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
          {STATUS_TEXT[status]}
        </span>
        <div className="rounded-lg bg-paper p-1.5">
          {qrValue ? (
            <QrCode value={qrValue} size={72} />
          ) : (
            <div className="grid h-[72px] w-[72px] grid-cols-5 gap-[3px] p-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-[1px] bg-ink"
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
