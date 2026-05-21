import { useState, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getToneForId } from "@/hooks/useDashboardEvents";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const eventTone = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

export function DashboardCalendar({ className, events = [], isLoading = false }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const dayEvents = events
        .filter((e) => {
          if (!e.eventDate) return false;
          return isSameDay(parseISO(e.eventDate), day);
        })
        .map((e) => ({
          ...e,
          tone: getToneForId(e.id),
        }));

      return {
        date: day,
        day: format(day, "d"),
        muted: !isSameMonth(day, monthStart),
        today: isSameDay(day, new Date()),
        events: dayEvents,
      };
    });
  }, [currentDate, events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <>
      <SectionCard
        title="Calendar"
        icon={CalendarDays}
        accentTop="primary"
        className={cn("flex h-full flex-col", className)}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handlePrevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Badge
              variant="secondary"
              className="min-w-[140px] justify-center px-3 py-1.5 text-sm font-bold"
            >
              {format(currentDate, "MMMM yyyy")}
            </Badge>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={handleNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="grid shrink-0 grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {weekdays.map((day) => (
              <div key={day} className="py-1">
                {day}
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
                  <div
                    key={item.date.toISOString()}
                    className={cn(
                      "flex min-h-[3.25rem] flex-col rounded-lg border border-border/60 bg-background p-1 text-xs transition hover:bg-muted/40",
                      item.today && "border-primary bg-primary/5",
                      item.muted && "bg-muted/30 text-muted-foreground/60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                        item.today && "bg-primary text-primary-foreground",
                      )}
                    >
                      {item.day}
                    </div>
                    <div className="mt-0.5 flex-1 space-y-0.5 overflow-hidden">
                      {item.events?.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            "flex cursor-pointer items-center gap-0.5 truncate rounded px-0.5 py-0.5 text-[9px] hover:opacity-80",
                            event.tone === "success" && "bg-success/15 text-success-foreground",
                            event.tone === "warning" && "bg-warning/15 text-warning-foreground",
                            event.tone === "info" && "bg-info/15 text-info-foreground",
                            event.tone === "destructive" &&
                              "bg-destructive/15 text-destructive-foreground",
                            event.tone === "primary" && "bg-primary/15 text-primary",
                          )}
                          title={event.title}
                        >
                          <span
                            className={cn(
                              "h-1 w-1 shrink-0 rounded-full",
                              eventTone[event.tone],
                            )}
                          />
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="flex max-h-[85vh] max-w-md flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2 text-sm">
              <Badge variant="outline" className="font-medium">
                {selectedEvent?.eventDate &&
                  format(parseISO(selectedEvent.eventDate), "MMMM do, yyyy")}
              </Badge>
              {selectedEvent?.status && (
                <Badge
                  variant="secondary"
                  className={cn(
                    selectedEvent.status === "Sent"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning",
                  )}
                >
                  {selectedEvent.status}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="-mr-2 mt-2 flex-1 overflow-y-auto pr-2">
            <div className="prose prose-sm max-w-none text-foreground/80 dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedEvent?.text || "No description provided.",
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
