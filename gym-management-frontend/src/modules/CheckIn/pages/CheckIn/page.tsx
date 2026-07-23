import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Scanner } from "@yudiel/react-qr-scanner";
import { checkInService } from "../../services";
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

export function CheckInPage() {
  const queryClient = useQueryClient();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ granted: boolean; pointsEarned: number; user: { fullName: string; tier: string }; membership: { planName: string; expiresAt: string } } | null>(null);
  const scanningRef = useRef(false);

  const { data: todayLogs } = useQuery({ queryKey: ["today-checkins"], queryFn: () => checkInService.getTodayLogs().then((r) => r.data) });

  const scanMutation = useMutation({
    mutationFn: (token: string) => checkInService.scan(token),
    onSuccess: (res) => {
      setResult(res.data);
      setScanning(false);
      scanningRef.current = false;
      queryClient.invalidateQueries({ queryKey: ["today-checkins"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Check-in failed");
      setScanning(false);
      scanningRef.current = false;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => checkInService.checkout(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["today-checkins"] }); toast.success("Checked out"); },
    onError: (err: any) => toast.error(err.response?.data?.error || "Checkout failed"),
  });

  const handleScan = useCallback(
    (detectedCodes: { rawValue: string }[]) => {
      if (scanningRef.current || !detectedCodes?.length) return;
      scanningRef.current = true;
      const token = detectedCodes[0].rawValue;
      if (token.trim()) scanMutation.mutate(token.trim());
    },
    [scanMutation],
  );

  function handleManualToken(token: string) {
    if (!token.trim()) return;
    setScanning(false);
    scanningRef.current = false;
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
          {scanning ? (
            <div className="w-full">
              <div className="w-64 h-64 mx-auto rounded-xl overflow-hidden bg-black">
                <Scanner onScan={handleScan} styles={{ container: { width: "100%", height: "100%" } }} />
              </div>
              <div className="flex justify-center mt-3">
                <Button variant="secondary" size="sm" onClick={() => { setScanning(false); scanningRef.current = false; }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-48 h-48 rounded-xl bg-surface-dim flex items-center justify-center text-muted">
                <div className="text-center">
                  <CameraIcon className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-xs">Camera ready</p>
                </div>
              </div>
              <Button onClick={() => { setResult(null); setScanning(true); }}>
                <CameraIcon className="w-4 h-4 mr-2" /> Scan QR Code
              </Button>
            </>
          )}

          {!scanning && !scanMutation.isPending && (
            <div className="w-full">
              <label className="text-xs uppercase tracking-wide text-muted font-medium mb-2 block">Or enter QR token manually</label>
              <form onSubmit={(e) => { e.preventDefault(); handleManualToken(new FormData(e.currentTarget).get("token") as string); }}
                className="flex gap-2">
                <input name="token" placeholder="Paste QR code token..." className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
                <Button type="submit">Verify</Button>
              </form>
            </div>
          )}

          {scanMutation.isPending && <p className="text-sm text-muted">Verifying...</p>}

          {result && (
            <div className={`w-full p-4 rounded-lg text-center transition-all ${result.granted ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              <p className="font-semibold">{result.granted ? "Check-in Granted" : "Check-in Denied"}</p>
              {result.granted && (
                <div className="text-sm mt-1 space-y-1">
                  <p className="font-medium">{result.user.fullName}</p>
                  <p className="text-xs">
                    <span className="capitalize">{result.user.tier}</span>
                    {result.membership?.planName && <span> · {result.membership.planName}</span>}
                  </p>
                  <p className="text-xs opacity-70">+{result.pointsEarned} pts earned</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#111111] mb-4">Today's Check-ins</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {(todayLogs ?? []).length === 0 && <p className="text-xs text-muted">No check-ins today</p>}
            {(todayLogs ?? []).map((log: any) => (
              <div key={log.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-surface-container/50">
                <div className="w-9 h-9 rounded-full bg-surface-dim flex items-center justify-center text-xs font-bold text-muted flex-shrink-0">
                  {log.user.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111111] truncate">{log.user.fullName}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <span className={`px-1.5 py-0.5 rounded-full capitalize ${
                      log.user.tier === "gold" ? "bg-yellow-100 text-yellow-700" : log.user.tier === "silver" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                    }`}>{log.user.tier}</span>
                    {log.user.planName !== "None" && <span>{log.user.planName}</span>}
                    <span>· +{log.pointsEarned} pts</span>
                    {log.checkOutTime && <span className="text-emerald-600 font-medium">· Out</span>}
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
    </div>
  );
}
