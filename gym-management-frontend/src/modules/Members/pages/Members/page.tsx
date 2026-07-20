import { Card } from "@/shared/components/ui/Card";

export function MembersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Member Directory</h1>
        <p className="text-sm text-muted mt-1">Manage all registered members</p>
      </div>
      <Card><p className="text-sm text-muted">Member list coming soon.</p></Card>
    </div>
  );
}
