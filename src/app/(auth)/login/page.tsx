"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not log you in.");
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
      <h1 className="mt-6 font-display text-2xl font-semibold">Log in</h1>
      <p className="mt-1.5 text-sm text-muted">Owner and staff accounts both log in here.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" required className="field-input" />
        </div>

        {error && <p className="text-sm text-expired">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="text-paper underline underline-offset-4">
          Create a gym
        </Link>
      </p>
      <p className="mt-8 rounded-xl border border-paper/10 bg-surface p-4 text-xs leading-relaxed text-muted">
        Demo gym: <span className="text-paper">demo@gympass.app</span> / password{" "}
        <span className="text-paper">demo1234</span> — seeded with sample members. Run{" "}
        <code className="text-paper">npm run db:seed</code> to create it.
      </p>
    </main>
  );
}
