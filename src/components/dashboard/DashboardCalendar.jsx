import { CalendarDays } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const calendarDays = [
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1 },
  { day: 2, events: [{ tone: "success", label: "Tea" }] },
  { day: 3 },
  { day: 4 },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8, today: true, events: [{ tone: "warning", label: "Audit" }] },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15, events: [{ tone: "info", label: "Excursion" }] },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20 },
  { day: 21 },
  { day: 22, events: [{ tone: "destructive", label: "Certs" }] },
  { day: 23 },
  { day: 24 },
  { day: 25 },
  { day: 26 },
  { day: 27 },
  { day: 28 },
  { day: 29 },
  { day: 30 },
  { day: 31 },
  { day: 1, muted: true },
];

const eventTone = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
};

const agenda = [
  { time: "9:30 AM", title: "Mother's Day Morning Tea", tone: "success" },
  { time: "All day", title: "NQF Quarterly Audit", tone: "warning" },
  { time: "10:00 AM", title: "Excursion - Werribee Zoo", tone: "info" },
];

export function DashboardCalendar({ className }) {
  return (
    <SectionCard
      title="Calendar"
      icon={CalendarDays}
      accentTop="primary"
      className={className}
      action={
        <Badge variant="secondary" className="text-[10px]">
          May 2026
        </Badge>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_15rem]">
        <div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
            {weekdays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {calendarDays.map((item, index) => (
              <div
                key={`${item.day}-${index}`}
                className={cn(
                  "min-h-16 rounded-lg border border-border/60 bg-background p-1.5 text-xs transition hover:bg-muted/40",
                  item.today && "border-primary bg-primary/5",
                  item.muted && "bg-muted/30 text-muted-foreground/60",
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full font-semibold",
                    item.today && "bg-primary text-primary-foreground",
                  )}
                >
                  {item.day}
                </div>
                <div className="mt-1 space-y-1">
                  {item.events?.map((event) => (
                    <div
                      key={event.label}
                      className="flex items-center gap-1 truncate text-[10px] text-muted-foreground"
                    >
                      <span
                        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", eventTone[event.tone])}
                      />
                      <span className="truncate">{event.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Upcoming</p>
          <ul className="space-y-3">
            {agenda.map((item) => (
              <li key={item.title} className="flex gap-2">
                <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", eventTone[item.tone])} />
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
