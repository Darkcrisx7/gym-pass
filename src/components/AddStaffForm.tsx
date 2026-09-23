"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddStaffForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not create staff account.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
      <input name="name" placeholder="Name" required className="field-input" />
      <input name="email" type="email" placeholder="Email" required className="field-input" />
      <input
        name="password"
        type="password"
        placeholder="Temporary password"
        minLength={8}
        required
        className="field-input sm:col-span-2"
      />
      {error && <p className="text-sm text-expired sm:col-span-2">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
        {loading ? "Adding…" : "Add staff member"}
      </button>
    </form>
  );
}
