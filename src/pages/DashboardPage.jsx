import { Users2, ChefHat, Baby, DoorOpen, Users, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { useAuthStore } from "@/stores/authStore";
import { isParentUser } from "@/constants/parentAccess";
import { useCentreStore } from "@/stores/centreStore";
import { dashboardService } from "@/services/admin/dashboardService";
import ParentDashboardPage from "@/pages/ParentDashboardPage";
import { DashboardCalendar } from "@/components/dashboard/DashboardCalendar";
import { DashboardWeather } from "@/components/dashboard/DashboardWeather";
import { useDashboardEvents } from "@/hooks/useDashboardEvents";
import { QuickActions } from "@/components/dashboard/QuickActions";

function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const centres = useCentreStore((s) => s.centres);
  const centre = centres.find((c) => c.id === activeCentreId);

  const [dashboardResponse, setDashboardResponse] = useState(null);
  const [birthdays, setBirthdays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBirthdaysLoading, setIsBirthdaysLoading] = useState(true);
  const { events, isLoading: isEventsLoading } = useDashboardEvents();
  const isParent = isParentUser(user);

  useEffect(() => {
    if (isParent) return;
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
  }, [activeCentreId, isParent]);

  useEffect(() => {
    if (isParent) return;
    const fetchBirthdays = async () => {
      setIsBirthdaysLoading(true);
      try {
        const res = await dashboardService.getBirthdays();
        setBirthdays(Array.isArray(res?.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch dashboard birthdays:", error);
        setBirthdays([]);
      } finally {
        setIsBirthdaysLoading(false);
      }
    };
    fetchBirthdays();
  }, [isParent]);

  if (isParent) {
    return <ParentDashboardPage />;
  }

  const dashboardData = dashboardResponse?.data || {};

  const stats = [
    {
      label: "Total Users",
      value: dashboardData.totalUsers ?? 0,
      icon: Users2,
      accent: "primary",
    },
    {
      label: "Total Staff",
      value: dashboardData.totalStaff ?? 0,
      icon: Users,
      accent: "info",
    },
    {
      label: "Total Parents",
      value: dashboardData.totalParent ?? 0,
      icon: Users,
      accent: "warning",
    },
    {
      label: "New Enrolments (Last Year)",
      value: dashboardData.newEnrolmentsLastYear ?? 0,
      icon: UserPlus,
      accent: "success",
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

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome ${centre ? `, ${centre.name || centre.code}` : ""}`} />

      {/* Stats Grid */}
      {isLoading ? (
        <PageLoader label="Loading dashboard…" />
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

      {/* Calendar + quick actions + weather */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <DashboardCalendar
          className="min-h-[28rem]"
          events={events}
          birthdays={birthdays}
          isLoading={isEventsLoading || isBirthdaysLoading}
        />

        <div className="space-y-4">
          <QuickActions />

          <DashboardWeather className="min-h-[28rem]" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
