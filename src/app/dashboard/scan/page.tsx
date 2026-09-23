import { requireSession } from "@/lib/requireSession";
import ScannerClient from "@/components/ScannerClient";

export default async function ScanPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-lg px-6 py-10">
      <h1 className="font-display text-2xl font-semibold">Scan member card</h1>
      <p className="mt-1.5 text-sm text-muted">
        Point the camera at a member's QR code to verify their membership.
      </p>
      <div className="mt-6">
        <ScannerClient />
      </div>
    </div>
  );
}
