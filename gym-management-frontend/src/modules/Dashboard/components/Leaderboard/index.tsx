import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services";

export function Leaderboard() {
  const { data } = useQuery({ queryKey: ["leaderboard"], queryFn: () => dashboardService.getLeaderboard().then((r) => r.data) });
  const members = (data ?? []).slice(0, 5);

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[#111111] mb-4">Top Members</h3>
      <div className="space-y-3">
        {members.length === 0 && <p className="text-xs text-muted">No data yet</p>}
        {members.map((m: { id: string; fullName: string; tier: string; checkIns: number }, i: number) => (
          <div key={m.id} className="flex items-center gap-3">
            <span className="w-5 text-xs font-bold text-muted">{i + 1}</span>
            <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-muted">
              {m.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111111] truncate">{m.fullName}</p>
              <p className="text-[10px] text-muted uppercase">{m.tier}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-orange-500">🔥</span>
              <span className="text-sm font-bold text-[#111111]">{m.checkIns}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
