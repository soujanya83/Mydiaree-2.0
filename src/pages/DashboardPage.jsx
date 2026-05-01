import {
  Users2,
  CalendarCheck2,
  ClipboardList,
  ShieldCheck,
  Plus,
  CalendarDays,
  Megaphone,
  ChevronRight,
  Sparkles,
  AlarmClock,
  PartyPopper,
  NotebookPen,
  Camera,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/common/StatCard";
import { SectionCard } from "@/components/common/SectionCard";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCentreStore } from "@/stores/centreStore";
import { cn } from "@/lib/utils";

function Pill({ color, label, value }) {
  const dot =
    color === "success"
      ? "bg-success"
      : color === "destructive"
      ? "bg-destructive"
      : color === "warning"
      ? "bg-warning"
      : "bg-info";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {label}
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

function DashboardPage() {
  const centre = useCentreStore((s) =>
    s.centres.find((c) => c.id === s.activeCentreId)
  );

  const stats = [
    { label: "Children Present", value: 142, icon: Users2, accent: "primary", trend: { value: "4.2%", direction: "up" } },
    { label: "Today's Attendance", value: "92%", icon: CalendarCheck2, accent: "success", trend: { value: "1.5%", direction: "up" } },
    { label: "Open Observations", value: 23, icon: ClipboardList, accent: "warning", trend: { value: "12%", direction: "up" } },
    { label: "Compliance Score", value: "98", icon: ShieldCheck, accent: "info", trend: { value: "2", direction: "up" } },
  ];

  const tasks = [
    { id: 1, title: "Complete morning sleep checks", time: "By 11:30 AM", room: "Sunflower", done: false },
    { id: 2, title: "Update weekly program plan — Tulip", time: "Today", room: "Tulip", done: false },
    { id: 3, title: "Review medication consent — Mia Khan", time: "Today", room: "Daisy", done: true },
    { id: 4, title: "Submit fire drill report", time: "Tomorrow", room: "All rooms", done: false },
  ];

  const observations = [
    { id: 1, name: "Ava Patel", area: "Fine motor", time: "12 min ago", note: "Stacked 6 blocks unaided", initials: "AP" },
    { id: 2, name: "Mia Khan", area: "Language", time: "38 min ago", note: "Used full sentences in story circle", initials: "MK" },
    { id: 3, name: "Noah Smith", area: "Social", time: "1 hr ago", note: "Initiated cooperative play with two peers", initials: "NS" },
  ];

  const events = [
    { day: "MAY", date: "02", title: "Mother's Day Morning Tea", time: "9:30 – 11:00 AM" },
    { day: "MAY", date: "08", title: "NQF Quarterly Audit", time: "All day" },
    { day: "MAY", date: "15", title: "Excursion — Werribee Zoo", time: "10:00 AM – 2:00 PM" },
  ];

  const compliance = [
    { area: "Sleep check policy", level: "High", color: "destructive", due: "Due in 3 days" },
    { area: "First aid certifications", level: "Medium", color: "warning", due: "Renew by May 22" },
    { area: "Sandpit shade audit", level: "Low", color: "info", due: "Due in 14 days" },
  ];

  const quickActions = [
    { label: "New Journal", icon: NotebookPen, to: "/daily-journal", color: "primary" },
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
        title={`Welcome back${centre ? `, ${centre.code}` : ""}`}
        description={centre ? `${centre.name} • ${centre.address}` : "Daily overview at a glance"}
        actions={
          <>
            <Button variant="outline" size="sm">
              <CalendarDays className="mr-2 h-4 w-4" />
              Today
            </Button>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Quick add
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            trend={s.trend}
            accentTop={s.accent}
          />
        ))}
      </div>

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
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", quickColor[a.color])}>
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Attendance */}
        <SectionCard
          title="Attendance Overview"
          icon={Users2}
          accentTop="primary"
          className="lg:col-span-2"
        >
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Present</p>
              <p className="mt-1 text-3xl font-bold text-foreground">142 / 154</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Pill color="success" label="Present" value="142" />
              <Pill color="warning" label="Late" value="6" />
              <Pill color="destructive" label="Absent" value="6" />
              <Pill color="info" label="On leave" value="0" />
            </div>
          </div>

          {/* segmented bar */}
          <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-muted">
            <span className="bg-success" style={{ width: "92%" }} />
            <span className="bg-warning" style={{ width: "4%" }} />
            <span className="bg-destructive" style={{ width: "4%" }} />
          </div>

          <div className="space-y-3">
            {[
              { room: "Sunflower (0–2)", present: 10, total: 12 },
              { room: "Bluebell (2–3)", present: 14, total: 16 },
              { room: "Tulip (3–4)", present: 18, total: 20 },
              { room: "Daisy (4–5)", present: 19, total: 22 },
            ].map((r) => {
              const pct = Math.round((r.present / r.total) * 100);
              return (
                <div key={r.room}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{r.room}</span>
                    <span className="text-muted-foreground">
                      {r.present}/{r.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Daily tasks */}
        <SectionCard
          title="Today's Tasks"
          icon={AlarmClock}
          accentTop="warning"
          action={
            <Button variant="ghost" size="sm" className="text-xs">
              View all
            </Button>
          }
        >
          <ul className="space-y-2.5">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-2.5 transition hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  defaultChecked={t.done}
                  className="mt-1 h-4 w-4 rounded border-border accent-primary"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium text-foreground",
                      t.done && "line-through text-muted-foreground"
                    )}
                  >
                    {t.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <AlarmClock className="h-3 w-3" />
                    {t.time}
                    <span>•</span>
                    {t.room}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Observations */}
        <SectionCard
          title="Recent Observations"
          icon={Sparkles}
          accentTop="info"
          action={
            <Link to="/observation">
              <Button variant="ghost" size="sm" className="text-xs">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          }
          className="lg:col-span-2"
        >
          <ul className="space-y-3">
            {observations.map((o) => (
              <li
                key={o.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-3 transition hover:bg-muted/40"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-info/10 text-info text-xs font-semibold">
                    {o.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{o.name}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {o.area}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{o.note}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">{o.time}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Upcoming events */}
        <SectionCard title="Upcoming Events" icon={PartyPopper} accentTop="success">
          <ul className="space-y-3">
            {events.map((e) => (
              <li
                key={e.title}
                className="flex items-start gap-3 rounded-lg border border-border/60 p-3 transition hover:bg-muted/40"
              >
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[10px] font-semibold uppercase">{e.day}</span>
                  <span className="text-base font-bold leading-none">{e.date}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{e.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{e.time}</p>
                </div>
                <Megaphone className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Compliance reminders */}
        <SectionCard
          title="Compliance Reminders"
          icon={ShieldCheck}
          accentTop="destructive"
          className="lg:col-span-3"
          action={
            <Link to="/qip">
              <Button variant="ghost" size="sm" className="text-xs">
                Open QIP <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          }
        >
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {compliance.map((c) => {
              const tone =
                c.color === "destructive"
                  ? "bg-destructive/10 text-destructive"
                  : c.color === "warning"
                  ? "bg-warning/15 text-warning"
                  : "bg-info/10 text-info";
              return (
                <li
                  key={c.area}
                  className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", tone)}>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{c.area}</p>
                    <p className="text-[11px] text-muted-foreground">{c.due}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold",
                      c.color === "destructive" && "border-destructive/40 text-destructive",
                      c.color === "warning" && "border-warning/40 text-warning",
                      c.color === "info" && "border-info/40 text-info"
                    )}
                  >
                    {c.level}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

export default DashboardPage;
