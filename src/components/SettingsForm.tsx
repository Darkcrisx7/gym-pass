"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Gym } from "@prisma/client";

export default function SettingsForm({ gym }: { gym: Gym }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    const res = await fetch("/api/gym", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save settings.");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className="field-label" htmlFor="name">
          Gym name
        </label>
        <input id="name" name="name" defaultValue={gym.name} required className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="logoUrl">
          Logo URL <span className="text-muted">(optional)</span>
        </label>
        <input id="logoUrl" name="logoUrl" defaultValue={gym.logoUrl ?? ""} className="field-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="primaryColor">
            Primary color
          </label>
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            defaultValue={gym.primaryColor}
            className="field-input h-11 p-1"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="secondaryColor">
            Secondary color
          </label>
          <input
            id="secondaryColor"
            name="secondaryColor"
            type="color"
            defaultValue={gym.secondaryColor}
            className="field-input h-11 p-1"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="contactNumber">
            Contact number
          </label>
          <input
            id="contactNumber"
            name="contactNumber"
            defaultValue={gym.contactNumber ?? ""}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="whatsapp">
            WhatsApp <span className="text-muted">(optional)</span>
          </label>
          <input id="whatsapp" name="whatsapp" defaultValue={gym.whatsapp ?? ""} className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="address">
          Address
        </label>
        <input id="address" name="address" defaultValue={gym.address ?? ""} className="field-input" />
      </div>
      <div>
        <label className="field-label" htmlFor="expiringSoonDays">
          "Expiring soon" window (days before expiry)
        </label>
        <input
          id="expiringSoonDays"
          name="expiringSoonDays"
          type="number"
          min="1"
          max="60"
          defaultValue={gym.expiringSoonDays}
          className="field-input max-w-[140px]"
        />
      </div>

      {error && <p className="text-sm text-expired">{error}</p>}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-sm text-active">Saved</span>}
      </div>
    </form>
  );
}
