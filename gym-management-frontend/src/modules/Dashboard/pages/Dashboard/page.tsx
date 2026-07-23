import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../../services";
import { StatCard } from "../../components/StatCard";
import { TrendChart } from "../../components/TrendChart";
import { Leaderboard } from "../../components/Leaderboard";
import { RecentRegistrations } from "../../components/RecentRegistrations";

export function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => dashboardService.getStats().then((r) => r.data) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of your gym's performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Members" value={(stats?.totalMembers ?? 0).toLocaleString()} trend="Today" />
        <StatCard label="Today's Check-ins" value={(stats?.todayCheckIns ?? 0).toLocaleString()} isLive />
        <StatCard label="Active Memberships" value={(stats?.activeMemberships ?? 0).toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <TrendChart />
          </div>
        </div>
        <div className="space-y-6">
          <Leaderboard />
          <RecentRegistrations />
        </div>
      </div>
    </div>
  );
}
