"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DURATIONS } from "@/lib/membership";

export default function NewMemberPage() {
  const router = useRouter();
  const [duration, setDuration] = useState("3m");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not add this member.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    router.push(`/dashboard/members/${data.id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/dashboard/members" className="text-sm text-muted hover:text-paper">
        ← Members
      </Link>
      <h1 className="mt-3 font-display text-2xl font-semibold">Add member</h1>

      <form onSubmit={onSubmit} className="mt-8 space-y-10">
        <section>
          <h2 className="text-sm font-medium text-muted">Personal information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="fullName">
                Full name
              </label>
              <input id="fullName" name="fullName" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="mobile">
                Mobile number
              </label>
              <input id="mobile" name="mobile" required className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="email">
                Email <span className="text-muted">(optional)</span>
              </label>
              <input id="email" name="email" type="email" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="dob">
                Date of birth <span className="text-muted">(optional)</span>
              </label>
              <input id="dob" name="dob" type="date" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="gender">
                Gender <span className="text-muted">(optional)</span>
              </label>
              <select id="gender" name="gender" className="field-input">
                <option value="">Prefer not to say</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted">Emergency information (optional)</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="emergencyName">
                Contact name
              </label>
              <input id="emergencyName" name="emergencyName" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="emergencyNumber">
                Contact number
              </label>
              <input id="emergencyNumber" name="emergencyNumber" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="emergencyRelation">
                Relationship
              </label>
              <input id="emergencyRelation" name="emergencyRelation" className="field-input" />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium text-muted">Membership</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="plan">
                Plan name
              </label>
              <input id="plan" name="plan" required defaultValue="Standard" className="field-input" />
            </div>
            <div>
              <label className="field-label" htmlFor="startDate">
                Start date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="field-input"
              />
            </div>
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
            {duration === "custom" && (
              <div>
                <label className="field-label" htmlFor="expiryDate">
                  Expiry date
                </label>
                <input id="expiryDate" name="expiryDate" type="date" required className="field-input" />
              </div>
            )}
            <div>
              <label className="field-label" htmlFor="amountPaid">
                Amount paid (₹)
              </label>
              <input
                id="amountPaid"
                name="amountPaid"
                type="number"
                min="0"
                step="1"
                required
                className="field-input"
              />
            </div>
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
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="notes">
                Notes <span className="text-muted">(optional)</span>
              </label>
              <textarea id="notes" name="notes" rows={3} className="field-input" />
            </div>
          </div>
        </section>

        {error && <p className="text-sm text-expired">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating card…" : "Create member & card"}
          </button>
          <Link href="/dashboard/members" className="btn-ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
