"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCode({
  value,
  size = 120,
  fgColor = "#0F1A16",
  bgColor = "#F3F0E6",
}: {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 1,
      color: { dark: fgColor, light: bgColor },
    }).catch(() => {
      // Rendering can only fail on a malformed value (e.g. empty string) —
      // leave the canvas blank rather than crash the card.
    });
  }, [value, size, fgColor, bgColor]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-md" />;
}
