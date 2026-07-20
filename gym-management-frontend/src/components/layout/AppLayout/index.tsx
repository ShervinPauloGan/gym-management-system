import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";
import { TopNav } from "../TopNav";
import { useUIStore } from "@/shared/stores/ui.store";
import clsx from "clsx";

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className={clsx("flex-1 flex flex-col transition-all duration-200", sidebarOpen ? "ml-[280px]" : "ml-0")}>
        <TopNav />
        <main className="flex-1 p-page-margin bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
