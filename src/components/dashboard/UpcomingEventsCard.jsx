import { useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { SectionCard } from "@/components/common/SectionCard";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const eventTone = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-info",
  destructive: "bg-destructive",
  primary: "bg-primary",
};

export function UpcomingEventsCard({ className, upcomingEvents = [], isLoading = false }) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <>
      <SectionCard
        title="Upcoming Events"
        icon={Clock}
        accentTop="info"
        className={cn("flex h-full flex-col", className)}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {isLoading ? (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              Loading events…
            </p>
          ) : upcomingEvents.length > 0 ? (
            <ul className="flex-1 space-y-3 overflow-y-auto pr-1">
              {upcomingEvents.map((item) => (
                <li
                  key={item.id}
                  className="group flex cursor-pointer gap-3 rounded-lg border border-transparent p-2 transition hover:border-border hover:bg-muted/30"
                  onClick={() => setSelectedEvent(item)}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm",
                      eventTone[item.tone].replace("bg-", "border-") + "/30",
                    )}
                  >
                    <span className={cn("h-2.5 w-2.5 rounded-full", eventTone[item.tone])} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3 shrink-0" />
                      {format(parseISO(item.eventDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              No upcoming events.
            </p>
          )}
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
