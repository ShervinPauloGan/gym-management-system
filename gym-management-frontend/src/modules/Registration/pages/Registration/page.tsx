import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { registrationService } from "../../services";
import { planShopService } from "@/modules/PlanShop/services";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";
import { CheckCircleIcon, XMarkIcon, LinkIcon, ArrowDownTrayIcon, ShareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface RegisteredMember {
  id: string;
  fullName: string;
  email: string | null;
  tier: string;
  qrCodeToken: string;
}

export function RegistrationPage() {
  const queryClient = useQueryClient();
  const qrRef = useRef<SVGSVGElement>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("walk-in");
  const [planId, setPlanId] = useState("");
  const [registered, setRegistered] = useState<RegisteredMember | null>(null);

  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => planShopService.getAll().then((r) => r.data) });
  const filteredPlans = (plans ?? []).filter((p: { isActive: boolean; tier: string }) => p.isActive && p.tier === tier);
  const selectedPlan = (plans ?? []).find((p: { id: string }) => p.id === planId);

  const mutation = useMutation({
    mutationFn: () => registrationService.create({ fullName, email: email || undefined, tier, planId: planId || undefined }),
    onSuccess: (res) => {
      setRegistered(res.data);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-regs"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Registration failed"),
  });

  const resetForm = useCallback(() => {
    setFullName("");
    setEmail("");
    setPlanId("");
    setRegistered(null);
  }, []);

  async function copyQRLink() {
    if (!registered) return;
    const text = `${window.location.origin}/check-in?token=${registered.qrCodeToken}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("QR link copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  function downloadQR() {
    if (!qrRef.current || !registered) return;
    const svg = qrRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 4;
      canvas.height = img.height * 4;
      ctx!.scale(4, 4);
      ctx!.fillStyle = "#FFFFFF";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);
      ctx!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.download = `${registered.fullName.replace(/\s+/g, "_")}_QR.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
      toast.success("QR code downloaded");
    };
    img.src = url;
  }

  async function shareQR() {
    if (!registered) return;
    const shareData = {
      title: `${registered.fullName} - Gym Engine QR`,
      text: `Member: ${registered.fullName}\nTier: ${registered.tier}\nPlan: ${selectedPlan?.planName || "None"}\nQR Token: ${registered.qrCodeToken}`,
      url: `${window.location.origin}/check-in?token=${registered.qrCodeToken}`,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareData.text + "\n" + shareData.url);
      toast.success("Member info copied — paste to share");
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-metric-lg text-[#111111]">New Registration</h1>
        <p className="text-sm text-muted mt-1">Register a new member</p>
      </div>

      <Card className="p-6">
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-5">
          <Input id="fullName" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="John Doe" />
          <Input id="email" label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />

          <div>
            <label className="text-xs uppercase tracking-wide text-muted font-medium mb-2 block">Membership Tier</label>
            <div className="flex gap-2">
              {["walk-in", "silver", "gold"].map((t) => (
                <button key={t} type="button" onClick={() => { setTier(t); setPlanId(""); }}
                  className={`flex-1 py-3 text-sm font-medium rounded-lg border cursor-pointer transition-colors ${
                    tier === t ? "bg-primary text-primary-foreground border-primary" : "bg-white text-[#111111] border-border hover:bg-surface-container"
                  }`}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>
          </div>

          {filteredPlans.length > 0 && (
            <div>
              <label className="text-xs uppercase tracking-wide text-muted font-medium mb-2 block">Select Plan (optional)</label>
              <div className="grid grid-cols-2 gap-2">
                {filteredPlans.map((p: { id: string; planName: string; price: string }) => (
                  <button key={p.id} type="button" onClick={() => setPlanId(planId === p.id ? "" : p.id)}
                    className={`p-3 text-left rounded-lg border cursor-pointer transition-colors ${
                      planId === p.id ? "bg-primary text-primary-foreground border-primary" : "bg-white text-[#111111] border-border hover:bg-surface-container"
                    }`}>
                    <p className="text-sm font-medium">{p.planName}</p>
                    <p className="text-xs mt-0.5 opacity-70">₱{Number(p.price).toLocaleString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" loading={mutation.isPending} className="w-full">Register Member</Button>
        </form>
      </Card>

      {registered && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={resetForm}>
          <Card className="p-8 w-full max-w-sm mx-4 flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
            <button onClick={resetForm} className="self-end text-muted hover:text-[#111111] cursor-pointer -mt-2 -mr-2">
              <XMarkIcon className="w-5 h-5" />
            </button>

            <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
            <div className="text-center">
              <h2 className="text-lg font-bold text-[#111111]">Registration Successful</h2>
              <p className="text-sm text-muted mt-1">{registered.fullName}</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                  registered.tier === "gold" ? "bg-yellow-100 text-yellow-700" :
                  registered.tier === "silver" ? "bg-gray-100 text-gray-600" : "bg-blue-50 text-blue-600"
                }`}>{registered.tier}</span>
                {selectedPlan && <span className="text-xs text-muted">{selectedPlan.planName}</span>}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-border">
              <QRCodeSVG ref={qrRef} value={registered.qrCodeToken} size={180} />
            </div>

            <p className="text-[10px] text-muted break-all text-center max-w-[250px] font-mono">{registered.qrCodeToken}</p>

            <div className="grid grid-cols-3 gap-3 w-full">
              <button onClick={copyQRLink}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border border-border hover:bg-surface-container cursor-pointer transition-colors">
                <LinkIcon className="w-5 h-5 text-muted" />
                <span className="text-[10px] text-muted font-medium">Copy Link</span>
              </button>
              <button onClick={downloadQR}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border border-border hover:bg-surface-container cursor-pointer transition-colors">
                <ArrowDownTrayIcon className="w-5 h-5 text-muted" />
                <span className="text-[10px] text-muted font-medium">Download</span>
              </button>
              <button onClick={shareQR}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border border-border hover:bg-surface-container cursor-pointer transition-colors">
                <ShareIcon className="w-5 h-5 text-muted" />
                <span className="text-[10px] text-muted font-medium">Share</span>
              </button>
            </div>

            <p className="text-[10px] text-muted text-center">Share this QR code with the member via Messenger, Viber, WhatsApp, or email</p>

            <Button variant="secondary" onClick={resetForm} className="w-full">Register Another</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
