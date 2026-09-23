"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DURATIONS } from "@/lib/membership";

export default function RenewMemberForm({
  memberId,
  currentExpiry,
}: {
  memberId: string;
  currentExpiry: string;
}) {
  const router = useRouter();
  const [duration, setDuration] = useState("3m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentExpiryIsFuture = new Date(currentExpiry) > new Date();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch(`/api/members/${memberId}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not renew this membership.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      {currentExpiryIsFuture && (
        <p className="text-xs text-muted">
          This membership is still active — renewing extends from its current expiry date
          rather than shortening it.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="duration">
            Duration
          </label>
          <select
            id="duration"
            name="duration"
            className="field-input"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        {duration === "custom" ? (
          <div>
            <label className="field-label" htmlFor="expiryDate">
              New expiry date
            </label>
            <input id="expiryDate" name="expiryDate" type="date" required className="field-input" />
          </div>
        ) : (
          <div>
            <label className="field-label" htmlFor="amount">
              Amount (₹)
            </label>
            <input id="amount" name="amount" type="number" min="0" required className="field-input" />
          </div>
        )}
      </div>
      {duration === "custom" && (
        <div>
          <label className="field-label" htmlFor="amount">
            Amount (₹)
          </label>
          <input id="amount" name="amount" type="number" min="0" required className="field-input" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label" htmlFor="paymentStatus">
            Payment status
          </label>
          <select id="paymentStatus" name="paymentStatus" className="field-input" defaultValue="PAID">
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="notes">
            Notes <span className="text-muted">(optional)</span>
          </label>
          <input id="notes" name="notes" className="field-input" />
        </div>
      </div>
      {error && <p className="text-sm text-expired">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Renewing…" : "Renew membership"}
      </button>
    </form>
  );
}
