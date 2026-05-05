import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useUiStore } from "@/stores/uiStore";
import { useCentreStore } from "@/stores/centreStore";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function AppLayout() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const fetchCentres = useCentreStore((s) => s.fetchCentres);

  useEffect(() => {
    fetchCentres();
  }, [fetchCentres]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn("flex min-h-screen flex-col transition-all duration-200", collapsed ? "lg:pl-16" : "lg:pl-64")}>
        <Header />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
