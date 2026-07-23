import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function RecentRegistrations() {
  const { data } = useQuery({ queryKey: ["recent-regs"], queryFn: () => dashboardService.getRecent().then((r) => r.data) });
  const members = (data ?? []).slice(0, 5);

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[#111111] mb-4">Recent Registrations</h3>
      <div className="space-y-3">
        {members.length === 0 && <p className="text-xs text-muted">No registrations yet</p>}
        {members.map((m: { id: string; fullName: string; tier: string; createdAt: string }) => (
          <div key={m.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-muted">
              {m.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">{m.fullName}</p>
              <p className="text-[10px] text-muted uppercase">{m.tier}</p>
            </div>
            <span className="text-xs text-muted whitespace-nowrap">{timeAgo(m.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
