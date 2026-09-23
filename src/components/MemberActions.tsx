"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberActions({
  memberId,
  isActive,
}: {
  memberId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function toggleActive() {
    setLoading(true);
    await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteMember() {
    setLoading(true);
    const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/members");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-expired/40 bg-expired/10 px-3 py-2 text-sm">
        <span>Delete this member permanently?</span>
        <button onClick={deleteMember} disabled={loading} className="btn-danger px-3 py-1 text-xs">
          Delete
        </button>
        <button onClick={() => setConfirmingDelete(false)} className="btn-ghost px-3 py-1 text-xs">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggleActive} disabled={loading} className="btn-ghost text-xs">
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button onClick={() => setConfirmingDelete(true)} disabled={loading} className="btn-ghost text-xs">
        Delete
      </button>
    </div>
  );
}
