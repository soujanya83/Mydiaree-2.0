import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Cake,
  Megaphone,
  PartyPopper,
  Palmtree,
  Sparkles,
  MapPin,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { IMG_BASE_API } from "../../api/imageapi";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const IMG_BASE = IMG_BASE_API;

const DAY_TYPES = [
  {
    key: "birthdays",
    label: "Birthdays",
    singular: "Birthday",
    Icon: Cake,
    iconBg: "bg-rose-500/15",
    iconTone: "text-rose-600",
    sectionBorder: "border-rose-500/20",
    chip: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
    gradient: "from-rose-500/20 via-rose-500/5 to-transparent",
  },
  {
    key: "announcements",
    label: "Announcements",
    singular: "Announcement",
    Icon: Megaphone,
    iconBg: "bg-sky-500/15",
    iconTone: "text-sky-600",
    sectionBorder: "border-sky-500/20",
    chip: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
  },
  {
    key: "normalEvents",
    label: "Events",
    singular: "Event",
    Icon: PartyPopper,
    iconBg: "bg-primary/15",
    iconTone: "text-primary",
    sectionBorder: "border-primary/25",
    chip: "bg-primary/10 text-primary",
    gradient: "from-primary/20 via-primary/5 to-transparent",
  },
  {
    key: "holidays",
    label: "Holidays",
    singular: "Holiday",
    Icon: Palmtree,
    iconBg: "bg-emerald-500/15",
    iconTone: "text-emerald-600",
    sectionBorder: "border-emerald-500/20",
    chip: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  },
];

function buildDayMap(calendarEvents = []) {
  const map = new Map();
  calendarEvents.forEach((entry) => {
    const date = entry.date || entry.start;
    if (!date) return;
    const props = entry.extendedProps || {};
    map.set(date.slice(0, 10), {
      birthdays: props.birthdays || [],
      announcements: props.announcements || [],
      normalEvents: props.normalEvents || [],
      holidays: props.holidays || [],
      ptms: props.ptms || [],
    });
  });
  return map;
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .trim();
}

function mediaUrl(raw) {
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${IMG_BASE}${raw.replace(/^\/+/, "")}`;
}

function parseMediaList(raw) {
  if (!raw || raw === "[]") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(mediaUrl).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function entryTitle(entry, typeKey) {
  if (typeKey === "birthdays") {
    const name = [entry.name, entry.lastname].filter(Boolean).join(" ").trim();
    return name || "Birthday";
  }
  if (typeKey === "holidays") {
    return stripHtml(entry.occasion || entry.title || "Holiday");
  }
  return stripHtml(entry.title || entry.text || "Untitled");
}

function entrySubtitle(entry, typeKey) {
  if (typeKey === "birthdays" && entry.age != null) {
    return `Turning ${entry.age} ${entry.age === 1 ? "year" : "years"} old`;
  }
  if (typeKey === "holidays" && entry.state) {
    return entry.state;
  }
  if (typeKey === "announcements" || typeKey === "normalEvents") {
    const text = stripHtml(entry.text || "");
    if (text && text !== entryTitle(entry, typeKey)) return text;
    if (entry.status) return entry.status;
  }
  return null;
}

function DayDetailCard({ entry, typeKey, meta }) {
  const title = entryTitle(entry, typeKey);
  const subtitle = entrySubtitle(entry, typeKey);
  const mediaImages = parseMediaList(entry.announcementMedia);
  const childPhoto = typeKey === "birthdays" ? mediaUrl(entry.imageUrl) : null;
  const images = childPhoto ? [childPhoto, ...mediaImages] : mediaImages;
  const accentColor =
    entry.eventColor && entry.eventColor.startsWith("#") ? entry.eventColor : null;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card/80 shadow-sm transition hover:shadow-md",
        meta.sectionBorder,
      )}
    >
      {images[0] && (
        <div className="relative aspect-[21/9] overflow-hidden bg-muted/30">
          <img
            src={images[0]}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {images.length > 1 && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <ImageIcon className="h-3 w-3" />+{images.length - 1} more
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              meta.iconBg,
              meta.iconTone,
            )}
          >
            <meta.Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-bold leading-snug text-foreground">{title}</h4>
              {accentColor && (
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-background"
                  style={{ backgroundColor: accentColor }}
                  title="Event colour"
                />
              )}
            </div>
            {subtitle && (
              <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {subtitle}
              </p>
            )}
            {typeKey === "holidays" && entry.date && (
              <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {format(parseISO(String(entry.date).slice(0, 10)), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.slice(1, 4).map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border/80"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        )}
        {images[0] && (
          <a
            href={images[0]}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
          >
            View attachment
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}

function CalendarDayModal({ selectedDay, onClose }) {
  if (!selectedDay) return null;

  const sections = DAY_TYPES.map((meta) => ({
    meta,
    items: selectedDay.data[meta.key] || [],
  })).filter((s) => s.items.length > 0);

  const totalCount = sections.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden rounded-3xl border-border/80 p-0 shadow-2xl">
        {/* Premium header */}
        <div className="relative shrink-0 overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/15 via-card to-card px-6 pb-5 pt-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-6 left-1/3 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">
                Day overview
              </p>
              <h2 className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                {format(selectedDay.date, "EEEE")}
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                {format(selectedDay.date, "MMMM d, yyyy")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                  {totalCount} {totalCount === 1 ? "item" : "items"}
                </Badge>
                {sections.map(({ meta, items }) => (
                  <span
                    key={meta.key}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                      meta.chip,
                    )}
                  >
                    <meta.Icon className="h-3 w-3" />
                    {items.length} {meta.label}
                  </span>
                ))}
              </div>
            </div>
            <Sparkles className="h-5 w-5 shrink-0 text-primary/40" />
          </div>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-6">
            {sections.map(({ meta, items }) => (
              <section key={meta.key}>
                <div
                  className={cn(
                    "mb-3 flex items-center gap-3 rounded-xl border bg-gradient-to-r px-4 py-2.5",
                    meta.sectionBorder,
                    meta.gradient,
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      meta.iconBg,
                      meta.iconTone,
                    )}
                  >
                    <meta.Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{meta.label}</h3>
                    <p className="text-[11px] text-muted-foreground">
                      {items.length} {items.length === 1 ? meta.singular : meta.label.toLowerCase()}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {items.map((entry, i) => (
                    <li key={`${meta.key}-${entry.id ?? i}`}>
                      <DayDetailCard entry={entry} typeKey={meta.key} meta={meta} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-muted/20 px-5 py-4">
          <Button variant="outline" className="w-full rounded-xl font-semibold" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ParentDashboardCalendar({ className, calendarEvents = [], isLoading = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const dayMap = useMemo(() => buildDayMap(calendarEvents), [calendarEvents]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const data = dayMap.get(key) || {
        birthdays: [],
        announcements: [],
        normalEvents: [],
        holidays: [],
        ptms: [],
      };
      const iconTypes = DAY_TYPES.filter((t) => (data[t.key] || []).length > 0);
      return {
        date: day,
        key,
        day: format(day, "d"),
        muted: !isSameMonth(day, monthStart),
        today: isSameDay(day, new Date()),
        data,
        iconTypes,
        hasItems: iconTypes.length > 0,
        totalItems: iconTypes.reduce((sum, t) => sum + (data[t.key]?.length || 0), 0),
      };
    });
  }, [currentDate, dayMap]);

  return (
    <>
      <SectionCard
        title="Calendar"
        icon={CalendarDays}
        accentTop="primary"
        className={cn("flex h-full flex-col", className)}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Badge
              variant="secondary"
              className="min-w-[140px] justify-center px-3 py-1.5 text-sm font-bold"
            >
              {format(currentDate, "MMMM yyyy")}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {DAY_TYPES.map(({ label, Icon, iconTone }) => (
            <span key={label} className="inline-flex items-center gap-1">
              <Icon className={cn("h-3.5 w-3.5", iconTone)} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="grid shrink-0 grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {weekdays.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="mt-1 min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1">
              {isLoading ? (
                <div className="col-span-7 py-10 text-center text-sm text-muted-foreground">
                  Loading calendar…
                </div>
              ) : (
                calendarDays.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => item.hasItems && setSelectedDay(item)}
                    className={cn(
                      "relative flex min-h-[3.5rem] flex-col rounded-lg border border-border/60 bg-background p-1 text-left text-xs transition",
                      item.today && "border-primary bg-primary/5 ring-1 ring-primary/20",
                      item.muted && "bg-muted/30 text-muted-foreground/60",
                      item.hasItems &&
                        "cursor-pointer hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                        item.today && "bg-primary text-primary-foreground",
                      )}
                    >
                      {item.day}
                    </span>
                    <div className="mt-1 flex flex-wrap gap-0.5">
                      {item.iconTypes.map(({ key, Icon, iconTone }) => (
                        <Icon key={key} className={cn("h-3.5 w-3.5", iconTone)} aria-hidden />
                      ))}
                    </div>
                    {item.hasItems && item.totalItems > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-bold text-primary-foreground">
                        {item.totalItems}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <CalendarDayModal selectedDay={selectedDay} onClose={() => setSelectedDay(null)} />
    </>
  );
}
