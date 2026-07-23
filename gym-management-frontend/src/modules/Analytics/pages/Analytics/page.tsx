import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "../../services";
import { StatCard } from "@/modules/Dashboard/components/StatCard";
import { Card } from "@/shared/components/ui/Card";

export function AnalyticsPage() {
  const { data: stats } = useQuery({ queryKey: ["analytics-stats"], queryFn: () => analyticsService.getStats().then((r) => r.data) });
  const { data: leaderboard } = useQuery({ queryKey: ["leaderboard"], queryFn: () => analyticsService.getLeaderboard().then((r) => r.data) });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Analytics</h1>
        <p className="text-sm text-muted mt-1">Detailed insights and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Members" value={(stats?.totalMembers ?? 0).toLocaleString()} />
        <StatCard label="Today Check-ins" value={(stats?.todayCheckIns ?? 0).toLocaleString()} isLive />
        <StatCard label="Monthly Check-ins" value={(stats?.monthCheckIns ?? 0).toLocaleString()} />
        <StatCard label="Active Memberships" value={(stats?.activeMemberships ?? 0).toLocaleString()} />
      </div>

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-[#111111] mb-4">Member Leaderboard</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase border-b border-border">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Tier</th>
              <th className="py-2 pr-4 text-right">Check-ins</th>
            </tr>
          </thead>
          <tbody>
            {(leaderboard ?? []).length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted">No data yet</td></tr>}
            {(leaderboard ?? []).map((m: any, i: number) => (
              <tr key={m.id} className="border-b border-border/50">
                <td className="py-3 pr-4 text-muted">{i + 1}</td>
                <td className="py-3 pr-4 font-medium text-[#111111]">{m.fullName}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.tier === "gold" ? "bg-yellow-100 text-yellow-700" : m.tier === "silver" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"}`}>{m.tier}</span>
                </td>
                <td className="py-3 pr-4 text-right font-bold text-[#111111]">{m.checkIns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
