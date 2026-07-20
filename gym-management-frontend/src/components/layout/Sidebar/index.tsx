import { NavLink } from "react-router-dom";
import { useUIStore } from "@/shared/stores/ui.store";
import {
  HomeIcon, UsersIcon, UserPlusIcon, ShoppingBagIcon,
  GiftIcon, ChartBarIcon, Cog6ToothIcon, QrCodeIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

const navItems = [
  { to: "/", label: "Dashboard", icon: HomeIcon },
  { to: "/members", label: "Members", icon: UsersIcon },
  { to: "/registration", label: "Registration", icon: UserPlusIcon },
  { to: "/plans", label: "Plan Shop", icon: ShoppingBagIcon },
  { to: "/redeem", label: "Redeem Shop", icon: GiftIcon },
  { to: "/check-in", label: "Check-In", icon: QrCodeIcon },
  { to: "/analytics", label: "Analytics", icon: ChartBarIcon },
  { to: "/settings", label: "Settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const open = useUIStore((s) => s.sidebarOpen);

  return (
    <aside className={clsx(
      "fixed top-0 left-0 h-full bg-surface-bright border-r border-border flex flex-col transition-all duration-200 z-30",
      open ? "w-[280px]" : "w-0 -translate-x-full",
    )}>
      <div className="flex items-center gap-2 h-16 px-6 border-b border-border shrink-0">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">GE</span>
        </div>
        <span className="font-semibold text-sm tracking-wide">GYM ENGINE</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-container hover:text-[#111111]",
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
