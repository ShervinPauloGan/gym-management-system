import { useAuthStore } from "@/shared/stores/auth.store";
import { useUIStore } from "@/shared/stores/ui.store";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";

export function TopNav() {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="h-16 bg-surface-bright border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-lg text-muted hover:text-[#111111] hover:bg-surface-container transition-colors cursor-pointer">
          <Bars3Icon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg text-muted hover:text-[#111111] hover:bg-surface-container transition-colors cursor-pointer relative">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="w-8 h-8 bg-surface-container-high rounded-full flex items-center justify-center text-xs font-semibold">
            {user?.fullName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-muted capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
