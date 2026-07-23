import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { registrationService } from "../../services";
import { planShopService } from "@/modules/PlanShop/services";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Card } from "@/shared/components/ui/Card";
import toast from "react-hot-toast";

export function RegistrationPage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("walk-in");
  const [planId, setPlanId] = useState("");

  const { data: plans } = useQuery({ queryKey: ["plans"], queryFn: () => planShopService.getAll().then((r) => r.data) });
  const filteredPlans = (plans ?? []).filter((p: { isActive: boolean; tier: string }) => p.isActive && p.tier === tier);

  const mutation = useMutation({
    mutationFn: () => registrationService.create({ fullName, email: email || undefined, tier, planId: planId || undefined }),
    onSuccess: (res) => {
      toast.success(`Registered: ${res.data.fullName}`);
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["recent-regs"] });
      setFullName(""); setEmail(""); setPlanId("");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Registration failed"),
  });

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
    </div>
  );
}
