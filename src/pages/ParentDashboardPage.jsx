import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Camera,
  ClipboardPlus,
  Moon,
  PencilLine,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/common/PageLoader";
import { DashboardWeather } from "@/components/dashboard/DashboardWeather";
import { ParentDashboardCalendar } from "@/components/dashboard/ParentDashboardCalendar";
import { ParentFeedCarousel } from "@/components/dashboard/ParentFeedCarousel";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { parentDashboardService } from "@/services/parent/parentDashboardService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const IMG_BASE = "https://mydiaree.com.au/";

function childImageUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
}

function childName(c) {
  return [c.name, c.lastname].filter(Boolean).join(" ").trim() || "Child";
}

const PARENT_QUICK_ACTIONS = [
  { label: "Daily Diary", icon: BookOpen, to: "/daily-diary", color: "primary", subtitle: "View diary" },
  { label: "Sleep Check", icon: Moon, to: "/sleep-check", color: "info", subtitle: "View sleep logs" },
  {
    label: "Accident Form",
    icon: ClipboardPlus,
    to: "/accident-form",
    color: "warning",
    subtitle: "View records",
  },
  {
    label: "Observation & Reflection",
    icon: SlidersHorizontal,
    to: "/observation",
    color: "success",
    subtitle: "View learning",
  },
];

const quickColor = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
};

export default function ParentDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await parentDashboardService.getDashboard(activeCentreId || 1);
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
  }, [activeCentreId]);

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

  if (isLoading) {
    return <PageLoader label="Loading your dashboard…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
        description="Your family hub — reflections, learning moments, and centre updates."
      />

      {(data?.children || []).length > 0 && (
        <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/8 via-card to-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Your children</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 shadow-sm"
              >
                <Avatar className="h-10 w-10 border border-primary/15">
                  {childImageUrl(child.imageUrl) && (
                    <AvatarImage src={childImageUrl(child.imageUrl)} alt={childName(child)} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                    {childName(child).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{childName(child)}</p>
                  <p className="text-xs text-muted-foreground">{child.status || "Active"}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PARENT_QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  quickColor[action.color],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground">{action.subtitle}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          );
        })}
      </div>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:items-stretch">
        <ParentFeedCarousel
          title="Daily Reflections"
          icon={PencilLine}
          accentClass="ring-1 ring-emerald-500/10"
          viewAllTo="/daily-reflections"
          items={reflections}
          getItemLink={(item) => `/daily-reflections/${item.id}`}
          emptyLabel="No reflections published yet."
        />
        <ParentFeedCarousel
          title="Observations"
          icon={SlidersHorizontal}
          accentClass="ring-1 ring-sky-500/10"
          viewAllTo="/observation"
          items={observations}
          getItemLink={(item) => `/observation/${item.id}`}
          emptyLabel="No observations published yet."
        />
        <ParentFeedCarousel
          title="Snapshots"
          icon={Camera}
          accentClass="ring-1 ring-violet-500/10"
          viewAllTo="/snapshots"
          items={snapshots}
          emptyLabel="No snapshots published yet."
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
        <DashboardWeather className="min-h-[28rem]" />
        <ParentDashboardCalendar
          className="min-h-[28rem]"
          calendarEvents={data?.calendarEvents || []}
          isLoading={false}
        />
      </section>
    </div>
  );
}
