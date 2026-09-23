"use client";

import { useEffect, useRef, useState } from "react";

type VerifyResult =
  | { state: "idle" }
  | { state: "scanning" }
  | { state: "camera-error"; message: string }
  | { state: "invalid" }
  | {
      state: "result";
      status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INACTIVE";
      member: {
        fullName: string;
        photoUrl: string | null;
        memberCode: string;
        mobile: string;
        plan: string;
        startDate: string;
        expiryDate: string;
        paymentStatus: string;
        emergencyName: string | null;
        emergencyNumber: string | null;
        notes: string | null;
      };
    };

const RESULT_COPY: Record<
  string,
  { label: string; tone: string; dot: string }
> = {
  ACTIVE: { label: "Membership active", tone: "text-active", dot: "bg-active" },
  EXPIRING_SOON: { label: "Expiring soon", tone: "text-expiring", dot: "bg-expiring" },
  EXPIRED: { label: "Membership expired", tone: "text-expired", dot: "bg-expired" },
  INACTIVE: { label: "Membership card no longer valid", tone: "text-inactive", dot: "bg-inactive" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Pulls the card token out of whatever text the QR decoded to — a full
// https://.../card/<token> URL (what our cards encode) or, defensively,
// just a bare token.
function extractToken(scanned: string): string | null {
  try {
    const url = new URL(scanned);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("card");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return parts[parts.length - 1] || null;
  } catch {
    return scanned.trim() || null;
  }
}

export default function ScannerClient() {
  const [result, setResult] = useState<VerifyResult>({ state: "idle" });
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelled || !containerRef.current) return;

      const scanner = new Html5Qrcode(containerRef.current.id);
      scannerRef.current = scanner;
      setResult({ state: "scanning" });

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText: string) => {
            if (busyRef.current) return;
            busyRef.current = true;
            const token = extractToken(decodedText);
            if (!token) {
              setResult({ state: "invalid" });
              busyRef.current = false;
              return;
            }
            try {
              const res = await fetch(`/api/verify/${encodeURIComponent(token)}`);
              if (!res.ok) {
                setResult({ state: "invalid" });
              } else {
                const data = await res.json();
                setResult({ state: "result", status: data.status, member: data.member });
              }
            } catch {
              setResult({ state: "invalid" });
            }
            // Give staff a moment to read the result before scanning again.
            setTimeout(() => {
              busyRef.current = false;
            }, 1500);
          },
          () => {
            // Per-frame "no QR found" callback — expected constantly while
            // aiming the camera, intentionally not surfaced as an error.
          }
        );
      } catch (err) {
        setResult({
          state: "camera-error",
          message:
            "Camera access was denied or unavailable. Allow camera permission and reload the page.",
        });
      }
    }

    start();
    return () => {
      cancelled = true;
      scannerRef.current
        ?.stop()
        .then(() => scannerRef.current?.clear())
        .catch(() => {});
    };
  }, []);

  return (
    <div>
      <div
        id="qr-reader"
        ref={containerRef}
        className="overflow-hidden rounded-card border border-paper/10 bg-surface"
      />

      {result.state === "camera-error" && (
        <p className="mt-4 text-sm text-expired">{result.message}</p>
      )}

      {result.state === "invalid" && (
        <div className="mt-4 panel p-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-expired/15 text-expired">
            !
          </div>
          <p className="mt-3 font-medium">Invalid membership card</p>
          <p className="mt-1 text-sm text-muted">
            This QR code doesn't match a member at your gym.
          </p>
        </div>
      )}

      {result.state === "result" && (
        <ResultPanel status={result.status} member={result.member} />
      )}
    </div>
  );
}

function ResultPanel({
  status,
  member,
}: {
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "INACTIVE";
  member: NonNullable<Extract<VerifyResult, { state: "result" }>["member"]>;
}) {
  const copy = RESULT_COPY[status];
  return (
    <div className="mt-4 panel p-6">
      <div className="flex items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${copy.dot}`} />
        <p className={`font-display text-lg ${copy.tone}`}>{copy.label}</p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-display">
            {member.fullName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <p>{member.fullName}</p>
          <p className="text-xs text-muted">{member.memberCode} · {member.mobile}</p>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-y-2.5 text-sm">
        <dt className="text-xs text-muted">Plan</dt>
        <dd className="text-right">{member.plan}</dd>
        <dt className="text-xs text-muted">Valid until</dt>
        <dd className="text-right">{fmt(member.expiryDate)}</dd>
        <dt className="text-xs text-muted">Payment</dt>
        <dd className="text-right">{member.paymentStatus}</dd>
        {member.emergencyName && (
          <>
            <dt className="text-xs text-muted">Emergency contact</dt>
            <dd className="text-right">
              {member.emergencyName}
              {member.emergencyNumber ? ` · ${member.emergencyNumber}` : ""}
            </dd>
          </>
        )}
      </dl>
      {member.notes && (
        <p className="mt-4 rounded-xl bg-ink p-3 text-xs text-muted">{member.notes}</p>
      )}
    </div>
  );
}
