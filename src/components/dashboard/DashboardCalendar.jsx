import { useState, useMemo, useEffect } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { announcementService } from "@/services/centre/announcementService";
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

const TONES = ["success", "warning", "info", "destructive", "primary"];
const getToneForId = (id) => TONES[id % TONES.length];

const eventTone = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

export function DashboardCalendar({ className }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [eventsResponse, setEventsResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await announcementService.getEvents();
        setEventsResponse(res);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const events = eventsResponse?.events || [];

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    // startsOn=1 (Monday)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const dayEvents = events.filter((e) => {
        if (!e.eventDate) return false;
        return isSameDay(parseISO(e.eventDate), day);
      }).map(e => ({
        ...e,
        tone: getToneForId(e.id)
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

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    return events
      .filter((e) => e.eventDate && new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 5)
      .map(e => ({
        ...e,
        tone: getToneForId(e.id)
      }));
  }, [events]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <>
      <div className={cn("grid grid-cols-1 gap-4 lg:grid-cols-3", className)}>
        <SectionCard
          title="Calendar"
          icon={CalendarDays}
          accentTop="primary"
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-[11px] px-3">
                {format(currentDate, "MMMM yyyy")}
              </Badge>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
              {weekdays.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {isLoading ? (
                <div className="col-span-7 py-10 text-center text-sm text-muted-foreground">Loading calendar...</div>
              ) : (
                calendarDays.map((item) => (
                  <div
                    key={item.date.toISOString()}
                    className={cn(
                      "min-h-[5rem] rounded-lg border border-border/60 bg-background p-1.5 text-xs transition hover:bg-muted/40 flex flex-col",
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
                    <div className="mt-1 space-y-1 overflow-y-auto flex-1 hide-scrollbar">
                      {item.events?.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={cn(
                            "flex items-center gap-1 truncate text-[10px] rounded px-1 py-0.5 cursor-pointer hover:opacity-80",
                            event.tone === "success" && "bg-success/15 text-success-foreground",
                            event.tone === "warning" && "bg-warning/15 text-warning-foreground",
                            event.tone === "info" && "bg-info/15 text-info-foreground",
                            event.tone === "destructive" && "bg-destructive/15 text-destructive-foreground",
                            event.tone === "primary" && "bg-primary/15 text-primary",
                          )}
                          title={event.title}
                        >
                          <span
                            className={cn("h-1.5 w-1.5 shrink-0 rounded-full", eventTone[event.tone])}
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
        </SectionCard>

        <SectionCard
          title="Upcoming Events"
          icon={Clock}
          accentTop="info"
        >
          <div className="h-full flex flex-col">
            {isLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading...</p>
            ) : upcomingEvents.length > 0 ? (
              <ul className="space-y-4">
                {upcomingEvents.map((item) => (
                  <li 
                    key={item.id} 
                    className="flex gap-3 cursor-pointer group"
                    onClick={() => setSelectedEvent(item)}
                  >
                    <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border", eventTone[item.tone].replace('bg-', 'border-') + '/30')}>
                      <span className={cn("h-2.5 w-2.5 rounded-full", eventTone[item.tone])} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                         <CalendarDays className="h-3 w-3" />
                         {format(parseISO(item.eventDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-4">No upcoming events.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-bold">{selectedEvent?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 pt-2 text-sm">
               <Badge variant="outline" className="font-medium">
                  {selectedEvent?.eventDate && format(parseISO(selectedEvent.eventDate), "MMMM do, yyyy")}
               </Badge>
               {selectedEvent?.status && (
                 <Badge variant="secondary" className={cn(selectedEvent.status === 'Sent' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}>
                   {selectedEvent.status}
                 </Badge>
               )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 mt-2 -mr-2">
            <div className="prose prose-sm max-w-none text-foreground/80 dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: selectedEvent?.text || "No description provided." }} />
            </div>
            {selectedEvent?.announcementMedia && selectedEvent.announcementMedia !== "[]" && selectedEvent.announcementMedia !== "" && (
               <div className="mt-4 pb-4">
                  <p className="text-sm font-semibold mb-2">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                     {(() => {
                        try {
                           const media = JSON.parse(selectedEvent.announcementMedia);
                           return media.map((url, i) => (
                              <a 
                                 key={i} 
                                 href={url} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="inline-flex items-center gap-1 rounded-md bg-muted px-3 py-1.5 text-xs font-medium hover:bg-muted/80 transition"
                              >
                                 View Attachment {i + 1}
                              </a>
                           ));
                        } catch(e) { return null; }
                     })()}
                  </div>
               </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
