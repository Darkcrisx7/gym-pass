import { MembershipStatus, STATUS_LABEL, STATUS_DOT } from "@/lib/membership";

export default function StatusPill({ status }: { status: MembershipStatus }) {
  return (
    <span className="status-pill bg-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
