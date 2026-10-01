import { MembershipStatus, STATUS_LABEL } from "@/lib/membership";

const STYLES: Record<MembershipStatus, string> = {
  ACTIVE: "bg-activeSoft text-active",
  EXPIRING_SOON: "bg-expiringSoft text-expiring",
  EXPIRED: "bg-expiredSoft text-expired",
  INACTIVE: "bg-inactiveSoft text-inactive",
};

const DOT: Record<MembershipStatus, string> = {
  ACTIVE: "bg-active",
  EXPIRING_SOON: "bg-expiring",
  EXPIRED: "bg-expired",
  INACTIVE: "bg-inactive",
};

export default function StatusPill({ status }: { status: MembershipStatus }) {
  return (
    <span className={`status-pill ${STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
