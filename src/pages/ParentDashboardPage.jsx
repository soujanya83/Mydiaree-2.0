import { useEffect, useMemo, useState } from "react";
import { Camera, PencilLine, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { DashboardWeather } from "@/components/dashboard/DashboardWeather";
import { ParentDashboardCalendar } from "@/components/dashboard/ParentDashboardCalendar";
import { ParentFeedCarousel } from "@/components/dashboard/ParentFeedCarousel";
import { ParentQuickActions } from "@/components/dashboard/ParentQuickActions";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { parentDashboardService } from "@/services/parent/parentDashboardService";
import { childPossessive, parentDashboardDescription } from "@/utils/parentDashboardText";

export default function ParentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const children = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);

  useEffect(() => {
    if (!selectedChildId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await parentDashboardService.getDashboard(activeCentreId || 1, selectedChildId);
        if (res.status) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Failed to load parent dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeCentreId, selectedChildId]);

  const selectedChild = useMemo(() => {
    if (!selectedChildId) return null;
    return children.find((c) => String(c.id) === String(selectedChildId)) ?? null;
  }, [children, selectedChildId]);

  const reflections = useMemo(
    () => (data?.reflections || []).filter((r) => String(r.status).toUpperCase() === "PUBLISHED"),
    [data],
  );

  const observations = useMemo(
    () => (data?.observations || []).filter((o) => String(o.status).toLowerCase() === "published"),
    [data],
  );

  const snapshots = useMemo(
    () => (data?.snapshots || []).filter((s) => String(s.status).toLowerCase() === "published"),
    [data],
  );

  const possessive = childPossessive(children, selectedChild);
  const firstName = user?.name?.split(/\s+/)[0] || "";

  if (isLoading) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome ${firstName ? `, ${firstName}` : ""}`}
        description={parentDashboardDescription()}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
        <ParentDashboardCalendar
          className="min-h-[32rem]"
          calendarEvents={data?.calendarEvents || []}
          isLoading={false}
        />

        <div className="space-y-4">
          <ParentQuickActions gridClassName="grid-cols-2" />
          <DashboardWeather className="min-h-[32rem]" />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
        <ParentFeedCarousel
          title="Daily Reflections"
          icon={PencilLine}
          accentClass="ring-1 ring-emerald-500/10"
          viewAllTo="/daily-reflections"
          items={reflections}
          getItemLink={(item) => `/daily-reflections/${item.id}`}
          emptyLabel={`No reflections published for ${possessive} profile yet.`}
        />
        <ParentFeedCarousel
          title="Observations"
          icon={SlidersHorizontal}
          accentClass="ring-1 ring-sky-500/10"
          viewAllTo="/observation"
          items={observations}
          getItemLink={(item) => `/observation/${item.id}`}
          emptyLabel={`No observations published for ${possessive} profile yet.`}
        />
        <ParentFeedCarousel
          title="Snapshots"
          icon={Camera}
          accentClass="ring-1 ring-violet-500/10"
          viewAllTo="/snapshots"
          items={snapshots}
          emptyLabel={`No snapshots published for ${possessive} profile yet.`}
        />
      </section>
    </div>
  );
}
