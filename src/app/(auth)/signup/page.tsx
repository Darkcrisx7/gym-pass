"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="font-display text-lg font-semibold">
        Gym Pass
      </Link>
      <h1 className="mt-6 font-display text-2xl font-semibold">Create your gym</h1>
      <p className="mt-1.5 text-sm text-muted">
        Set up your workspace, then start issuing digital cards.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="field-label" htmlFor="gymName">
            Gym name
          </label>
          <input id="gymName" name="gymName" required className="field-input" placeholder="Powerfit Gym" />
        </div>
        <div>
          <label className="field-label" htmlFor="ownerName">
            Your name
          </label>
          <input id="ownerName" name="ownerName" required className="field-input" placeholder="Priya Shah" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="field-input" placeholder="you@gym.com" />
          </div>
          <div>
            <label className="field-label" htmlFor="mobile">
              Mobile
            </label>
            <input id="mobile" name="mobile" required className="field-input" placeholder="98765 43210" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="field-input"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="address">
            Gym address <span className="text-muted">(optional)</span>
          </label>
          <input id="address" name="address" className="field-input" placeholder="Street, city" />
        </div>

        {error && <p className="text-sm text-expired">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Creating your gym…" : "Create gym"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-paper underline underline-offset-4">
          Log in
        </Link>
      </p>
    </main>
  );
}
