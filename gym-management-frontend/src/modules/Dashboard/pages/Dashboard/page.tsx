import { StatCard } from "../../components/StatCard";
import { TrendChart } from "../../components/TrendChart";
import { Leaderboard } from "../../components/Leaderboard";
import { RecentRegistrations } from "../../components/RecentRegistrations";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of your gym's performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-transparent text-[#111111] hover:bg-surface-container transition-colors cursor-pointer">
            Export
          </button>
          <button className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-transparent text-[#111111] hover:bg-surface-container transition-colors cursor-pointer">
            Dark
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Members" value="14,238" trend="+2.4%" trendUp />
        <StatCard label="Active Check-ins" value="892" isLive />
        <StatCard label="Total Revenue" value="₱1.2M" trend="+8.1%" trendUp />
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
