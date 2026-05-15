import {
  Users2,
  ShieldCheck,
  ChefHat,
  Baby,
  Building2,
  DoorOpen,
  Users,
  NotebookPen,
  ClipboardList,
  Camera,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { useCentreStore } from "@/stores/centreStore";
import { dashboardService } from "@/services/admin/dashboardService";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function DashboardPage() {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const centre = useCentreStore((s) => s.centres.find((c) => c.id === activeCentreId));

  const [dashboardResponse, setDashboardResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await dashboardService.getDashboardData(activeCentreId || 1);
        setDashboardResponse(res);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeCentreId]);

  const dashboardData = dashboardResponse?.data || {};

  const stats = [
    {
      label: "Total Users",
      value: dashboardData.totalUsers ?? 0,
      icon: Users2,
      accent: "primary",
    },
    {
      label: "Total Superadmin",
      value: dashboardData.totalSuperadmin ?? 0,
      icon: ShieldCheck,
      accent: "destructive",
    },
    {
      label: "Total Staff",
      value: dashboardData.totalStaff ?? 0,
      icon: Users,
      accent: "info",
    },
    {
      label: "Total Parent",
      value: dashboardData.totalParent ?? 0,
      icon: Users,
      accent: "warning",
    },
    {
      label: "Total Center",
      value: dashboardData.totalCenter ?? 0,
      icon: Building2,
      accent: "primary",
    },
    {
      label: "Total Rooms",
      value: dashboardData.totalRooms ?? 0,
      icon: DoorOpen,
      accent: "success",
    },
    {
      label: "Total Recipes",
      value: dashboardData.totalRecipes ?? 0,
      icon: ChefHat,
      accent: "warning",
    },
    {
      label: "Active Children",
      value: dashboardData.activeChildren ?? 0,
      icon: Baby,
      accent: "info",
    },
  ];

  const quickActions = [
    { label: "Daily Diary", icon: NotebookPen, to: "/daily-diary", color: "primary" },
    { label: "Add Observation", icon: ClipboardList, to: "/observation", color: "warning" },
    { label: "Snapshot", icon: Camera, to: "/snapshots", color: "info" },
    { label: "Plan Menu", icon: ChefHat, to: "/menu", color: "success" },
  ];

  const quickColor = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${centre ? `, ${centre.name || centre.code}` : ""}`}
        description={centre ? `${centre.name} • ${centre.address}` : "Daily overview at a glance"}
      />

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              icon={s.icon}
              accentTop={s.accent}
            />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              to={a.to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  quickColor[a.color],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-[11px] text-muted-foreground">Create new</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Calendar */}
        <DashboardCalendar />
      </div>
    </div>
  );
}

export default DashboardPage;
