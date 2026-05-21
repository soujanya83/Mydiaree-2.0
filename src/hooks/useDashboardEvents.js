import { useEffect, useMemo, useState } from "react";
import { announcementService } from "@/services/centre/announcementService";

const TONES = ["success", "warning", "info", "destructive", "primary"];
export const getToneForId = (id) => TONES[id % TONES.length];

export function useDashboardEvents() {
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

  const events = useMemo(() => eventsResponse?.events || [], [eventsResponse]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => e.eventDate && new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
      .slice(0, 8)
      .map((e) => ({
        ...e,
        tone: getToneForId(e.id),
      }));
  }, [events]);

  return { events, upcomingEvents, isLoading };
}
