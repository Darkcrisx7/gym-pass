import { randomBytes } from "crypto";

export type MembershipStatus = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INACTIVE";

// Status is always DERIVED from expiryDate + isActive — never stored as a
// manually-set field — so it can never drift out of sync with reality.
export function computeStatus(
  expiryDate: Date,
  isActive: boolean,
  expiringSoonDays: number,
  now: Date = new Date()
): MembershipStatus {
  if (!isActive) return "INACTIVE";
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / msPerDay);
  if (daysLeft < 0) return "EXPIRED";
  if (daysLeft <= expiringSoonDays) return "EXPIRING_SOON";
  return "ACTIVE";
}

export const STATUS_LABEL: Record<MembershipStatus, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
  INACTIVE: "Inactive",
};

export const STATUS_DOT: Record<MembershipStatus, string> = {
  ACTIVE: "bg-active",
  EXPIRING_SOON: "bg-expiring",
  EXPIRED: "bg-expired",
  INACTIVE: "bg-inactive",
};

// Duration presets used by both "add member" and "renew" — the label is
// what gets stored on the renewal-history row, the months drive expiry math.
export const DURATIONS = [
  { value: "1m", label: "1 Month", months: 1 },
  { value: "3m", label: "3 Months", months: 3 },
  { value: "6m", label: "6 Months", months: 6 },
  { value: "12m", label: "12 Months", months: 12 },
  { value: "custom", label: "Custom", months: 0 },
] as const;

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

// The QR/card token. 24 random bytes, base64url — unguessable and carries
// no information about the member, the gym, or the database row it points to.
export function generateCardToken(): string {
  return randomBytes(24).toString("base64url");
}

// Human-facing member ID, e.g. "PF-0007". Sequential per gym, built from a
// short gym prefix (first letters of the gym name) plus the member's row
// count — collisions are impossible because of the @@unique([gymId, memberCode]).
export function buildMemberCode(gymName: string, sequence: number): string {
  const prefix =
    gymName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4) || "GYM";
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}
