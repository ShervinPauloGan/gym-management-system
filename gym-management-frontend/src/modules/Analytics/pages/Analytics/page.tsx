import { Card } from "@/shared/components/ui/Card";

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Analytics</h1>
        <p className="text-sm text-muted mt-1">Data insights and reporting</p>
      </div>
      <Card><p className="text-sm text-muted">Charts and reports coming soon.</p></Card>
    </div>
  );
}
