import { Card } from "@/shared/components/ui/Card";
import { useAuthStore } from "@/shared/stores/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-metric-lg text-[#111111]">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage system preferences</p>
      </div>
      <Card className="space-y-4">
        <p className="text-sm font-medium">Account</p>
        <p className="text-sm text-muted">
          Signed in as <span className="text-[#111111]">{user?.email}</span> ({user?.role})
        </p>
        <Button variant="secondary" onClick={logout}>
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out
        </Button>
      </Card>
    </div>
  );
}
