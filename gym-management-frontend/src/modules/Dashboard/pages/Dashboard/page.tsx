import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardService } from "../../services";
import { checkInService } from "@/modules/CheckIn/services";
import { StatCard } from "../../components/StatCard";
import { TrendChart } from "../../components/TrendChart";
import { Leaderboard } from "../../components/Leaderboard";
import { RecentRegistrations } from "../../components/RecentRegistrations";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { CameraIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [checkinResult, setCheckinResult] = useState<any>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: stats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: () => dashboardService.getStats().then((r) => r.data) });
  const { data: todayLogs } = useQuery({ queryKey: ["today-checkins"], queryFn: () => checkInService.getTodayLogs().then((r) => r.data) });

  const scanMutation = useMutation({
    mutationFn: (t: string) => checkInService.scan(t),
    onSuccess: (res) => {
      setCheckinResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["today-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["recent-regs"] });
      setToken("");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Check-in failed"),
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => checkInService.checkout(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["today-checkins"] }); toast.success("Checked out"); },
    onError: (err: any) => toast.error(err.response?.data?.error || "Checkout failed"),
  });

  const handleQuickScan = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    scanMutation.mutate(token.trim());
  }, [token, scanMutation]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-metric-lg text-[#111111]">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of your gym's performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Members" value={(stats?.totalMembers ?? 0).toLocaleString()} />
        <StatCard label="Today's Check-ins" value={(stats?.todayCheckIns ?? 0).toLocaleString()} isLive />
        <StatCard label="Checked Out" value={(stats?.totalRevenue ?? 0).toLocaleString()} trend="Today" />
        <StatCard label="Active Plans" value={(stats?.activeMemberships ?? 0).toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <TrendChart />
          </div>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#111111]">Today's Activity</h3>
              <span className="text-xs text-muted">{todayLogs?.length ?? 0} check-ins</span>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {(todayLogs ?? []).length === 0 && <p className="text-xs text-muted py-4 text-center">No check-ins today</p>}
              {(todayLogs ?? []).map((log: any) => (
                <div key={log.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-surface-container/50">
                  <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                    {log.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111111] truncate">{log.user.fullName}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted">
                      <span className={`px-1 py-0.5 rounded-full capitalize ${
                        log.user.tier === "gold" ? "bg-yellow-100 text-yellow-700" :
                        log.user.tier === "silver" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                      }`}>{log.user.tier}</span>
                      {log.checkOutTime && <span className="text-emerald-600">Checked out</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted">{timeAgo(log.checkInTime)}</span>
                    {!log.checkOutTime && (
                      <button onClick={() => checkoutMutation.mutate(log.id)}
                        className="text-[10px] px-2 py-1 rounded-md bg-surface-dim hover:bg-surface-container-higher text-muted hover:text-[#111111] cursor-pointer transition-colors">
                        Check out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CameraIcon className="w-4 h-4 text-muted" />
              <h3 className="text-sm font-semibold text-[#111111]">Quick Check-In</h3>
            </div>
            <form ref={formRef} onSubmit={handleQuickScan} className="flex gap-2">
              <input value={token} onChange={(e) => setToken(e.target.value)}
                placeholder="Paste QR token..." autoComplete="off"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
              <Button type="submit" size="sm" loading={scanMutation.isPending}>Go</Button>
            </form>
            <p className="text-[10px] text-muted mt-2">Go to <span className="font-mono">Check-In</span> page for camera scanning</p>
          </Card>

          <Leaderboard />
          <RecentRegistrations />
        </div>
      </div>

      {checkinResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setCheckinResult(null)}>
          <Card className="p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className={`p-4 rounded-lg text-center ${checkinResult.granted ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              <p className="font-semibold text-base">{checkinResult.granted ? "Check-in Granted" : "Check-in Denied"}</p>
              {checkinResult.granted && (
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-medium">{checkinResult.user.fullName}</p>
                  <p className="text-xs capitalize">{checkinResult.user.tier} · {checkinResult.membership?.planName}</p>
                  <p className="text-xs opacity-70">{new Date(checkinResult.checkInTime).toLocaleTimeString()} · +{checkinResult.pointsEarned} pts</p>
                </div>
              )}
            </div>
            <Button variant="secondary" className="w-full mt-4" onClick={() => setCheckinResult(null)}>Done</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
