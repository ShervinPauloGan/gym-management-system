import { useQuery } from "@tanstack/react-query";
import { settingsService } from "../../services";
import { Card } from "@/shared/components/ui/Card";

export function SettingsPage() {
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => settingsService.get().then((r) => r.data) });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Settings</h1>
        <p className="text-sm text-muted mt-1">System configuration</p>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-[#111111] mb-4">General</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-[#111111]">Gym Name</span>
            <span className="text-sm text-muted">{data?.gymName || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-[#111111]">Timezone</span>
            <span className="text-sm text-muted">{data?.timezone || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-[#111111]">Admin Email</span>
            <span className="text-sm text-muted">{data?.admin?.email || "—"}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-[#111111]">Admin Name</span>
            <span className="text-sm text-muted">{data?.admin?.fullName || "—"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
