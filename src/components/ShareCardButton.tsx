"use client";

import { useState } from "react";

export default function ShareCardButton({
  cardUrl,
  gymName,
  memberName,
}: {
  cardUrl: string;
  gymName: string;
  memberName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const shareData = {
      title: `${memberName}'s membership card`,
      text: `Here is my digital membership card for ${gymName}.`,
      url: cardUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled the native share sheet — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — nothing more we can do silently.
    }
  }

  return (
    <button onClick={share} className="btn-primary flex-1">
      {copied ? "Link copied" : "Share card"}
    </button>
  );
}
