import { Card } from "@/shared/components/ui/Card";

export function CheckInPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Check-In</h1>
        <p className="text-sm text-muted mt-1">QR code check-in scanner</p>
      </div>
      <Card><p className="text-sm text-muted">QR scanner interface coming soon.</p></Card>
    </div>
  );
}
