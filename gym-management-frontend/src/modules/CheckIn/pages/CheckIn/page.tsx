import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { checkInService } from "../../services";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import toast from "react-hot-toast";

export function CheckInPage() {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ granted: boolean; pointsEarned: number; user: { fullName: string; tier: string } } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: todayLogs } = useQuery({ queryKey: ["today-checkins"], queryFn: () => checkInService.getTodayLogs().then((r) => r.data) });

  const scanMutation = useMutation({
    mutationFn: (token: string) => checkInService.scan(token),
    onSuccess: (res) => {
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["today-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Check-in failed"),
  });

  function handleScan(token: string) {
    if (!token.trim()) return;
    setScanning(false);
    scanMutation.mutate(token.trim());
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Check-In</h1>
        <p className="text-sm text-muted mt-1">Scan member QR code to check in</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col items-center gap-4">
          <div className="w-48 h-48 rounded-xl bg-surface-dim flex items-center justify-center text-muted text-sm">
            {scanning ? (
              <div className="text-center">
                <p className="mb-2">Camera active</p>
                <input ref={inputRef} autoFocus placeholder="QR token..." className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-white text-center"
                  onKeyDown={(e) => e.key === "Enter" && handleScan((e.target as HTMLInputElement).value)} />
                <button onClick={() => setScanning(false)} className="mt-2 text-xs text-muted underline cursor-pointer">Cancel</button>
              </div>
            ) : (
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p className="text-xs">Click to scan QR</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {!scanning && <Button onClick={() => setScanning(true)}>Scan QR Code</Button>}
          </div>

          {!scanning && !scanMutation.isPending && (
            <div className="w-full">
              <label className="text-xs uppercase tracking-wide text-muted font-medium mb-2 block">Or enter QR token manually</label>
              <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); handleScan(fd.get("token") as string); }}
                className="flex gap-2">
                <input name="token" placeholder="Paste QR code token..." className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
                <Button type="submit">Verify</Button>
              </form>
            </div>
          )}

          {scanMutation.isPending && <p className="text-sm text-muted">Verifying...</p>}

          {result && (
            <div className={`w-full p-4 rounded-lg text-center ${result.granted ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              <p className="font-semibold">{result.granted ? "Check-in Granted" : "Check-in Denied"}</p>
              {result.granted && <p className="text-sm mt-1">{result.user.fullName} · +{result.pointsEarned} pts</p>}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#111111] mb-4">Today's Check-ins</h3>
          <div className="space-y-3">
            {(todayLogs ?? []).length === 0 && <p className="text-xs text-muted">No check-ins today</p>}
            {(todayLogs ?? []).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-muted">
                  {log.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#111111]">{log.user.fullName}</p>
                  <p className="text-[10px] text-muted">+{log.pointsEarned} pts · {new Date(log.checkInTime).toLocaleTimeString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${log.user.tier === "gold" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"}`}>{log.user.tier}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
