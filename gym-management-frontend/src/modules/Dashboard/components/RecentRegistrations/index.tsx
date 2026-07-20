import { Card } from "@/shared/components/ui/Card";

interface Registration {
  name: string;
  time: string;
  tier: string;
  avatar: string;
}

const recent: Registration[] = [
  { name: "Alex Rivera", time: "2 min ago", tier: "Gold", avatar: "AR" },
  { name: "Sarah Chen", time: "15 min ago", tier: "Silver", avatar: "SC" },
  { name: "Marcus Thorne", time: "1 hr ago", tier: "Gold", avatar: "MT" },
];

export function RecentRegistrations() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[#111111] mb-4">Recent Registrations</h3>
      <div className="space-y-3">
        {recent.map((r) => (
          <div key={r.name} className="flex items-center gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-xs font-semibold">
              {r.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">{r.name}</p>
              <p className="text-xs text-muted">{r.tier} member</p>
            </div>
            <span className="text-xs text-muted whitespace-nowrap">{r.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
