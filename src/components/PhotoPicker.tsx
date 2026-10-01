"use client";

import { useRef, useState } from "react";
import { resizeImageToDataUrl } from "@/lib/image";

export default function PhotoPicker({
  value,
  onChange,
  fallbackLetter,
  size = 72,
}: {
  value: string | null;
  onChange: (dataUrl: string) => void;
  fallbackLetter: string;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-full w-full rounded-full object-cover border border-border"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center rounded-full border border-border bg-bg font-semibold text-muted"
            style={{ fontSize: size * 0.32 }}
          >
            {fallbackLetter}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white shadow-sm disabled:opacity-60"
          aria-label="Upload photo"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M4 8.5a1 1 0 0 1 1-1h2l1-2h8l1 2h2a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8.5Z"
              stroke="white"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="13" r="3" stroke="white" strokeWidth="1.6" />
          </svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      <div className="text-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-accent hover:underline"
        >
          {loading ? "Processing…" : value ? "Change photo" : "Add photo"}
        </button>
        {error && <p className="mt-0.5 text-xs text-expired">{error}</p>}
      </div>
    </div>
  );
}
