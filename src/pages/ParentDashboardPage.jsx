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
import {
  childPossessive,
  itemMatchesChild,
  parentDashboardDescription,
} from "@/utils/parentDashboardText";

export default function ParentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const children = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const setChildren = useParentDashboardStore((s) => s.setChildren);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await parentDashboardService.getDashboard(activeCentreId || 1);
        if (res.status) {
          setData(res.data);
          setChildren(res.data?.children || []);
        }
      } catch (error) {
        console.error("Failed to load parent dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [activeCentreId, setChildren]);

  const selectedChild = useMemo(() => {
    if (selectedChildId === "all") return null;
    return children.find((c) => String(c.id) === String(selectedChildId)) ?? null;
  }, [children, selectedChildId]);

  useEffect(() => {
    if (!activeCentreId) {
      setChildren([]);
    }
  }, [activeCentreId, setChildren]);

  const reflections = useMemo(() => {
    const published = (data?.reflections || []).filter(
      (r) => String(r.status).toUpperCase() === "PUBLISHED",
    );
    return published.filter((r) => itemMatchesChild(r, selectedChildId));
  }, [data, selectedChildId]);

  const observations = useMemo(() => {
    const published = (data?.observations || []).filter(
      (o) => String(o.status).toLowerCase() === "published",
    );
    return published.filter((o) => itemMatchesChild(o, selectedChildId));
  }, [data, selectedChildId]);

  const snapshots = useMemo(() => {
    const published = (data?.snapshots || []).filter(
      (s) => String(s.status).toLowerCase() === "published",
    );
    return published.filter((s) => itemMatchesChild(s, selectedChildId));
  }, [data, selectedChildId]);

  const possessive = childPossessive(children, selectedChild);
  const firstName = user?.name?.split(/\s+/)[0] || "";

  if (isLoading) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ""}`}
        description={parentDashboardDescription(children, selectedChild)}
      />

      <ParentQuickActions />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <DashboardWeather className="min-h-[32rem]" />
        <ParentDashboardCalendar
          className="min-h-[32rem]"
          calendarEvents={data?.calendarEvents || []}
          isLoading={false}
        />
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
