"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RemoveStaffButton({ staffId }: { staffId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    setLoading(true);
    await fetch(`/api/staff/${staffId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={loading} className="btn-ghost text-xs">
      Remove
    </button>
  );
}
