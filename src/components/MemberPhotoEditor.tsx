"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoPicker from "./PhotoPicker";

export default function MemberPhotoEditor({
  memberId,
  currentPhotoUrl,
  fallbackLetter,
}: {
  memberId: string;
  currentPhotoUrl: string | null;
  fallbackLetter: string;
}) {
  const router = useRouter();
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl);
  const [saving, setSaving] = useState(false);

  async function handleChange(dataUrl: string) {
    setPhotoUrl(dataUrl);
    setSaving(true);
    await fetch(`/api/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: dataUrl }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div>
      <PhotoPicker value={photoUrl} onChange={handleChange} fallbackLetter={fallbackLetter} />
      {saving && <p className="mt-1 text-xs text-muted">Saving…</p>}
    </div>
  );
}
