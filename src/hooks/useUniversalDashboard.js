import { useEffect, useMemo, useState } from "react";
import { dashboardService } from "@/services/admin/dashboardService";

/** Map API events to the shape expected by DashboardCalendar */
export function normalizeDashboardEvents(apiEvents = []) {
  return apiEvents.map((e) => ({
    id: e.id,
    title: e.title,
    text: e.text,
    type: e.type,
    eventDate: e.date,
  }));
}

export function getUniversalDashboardCounts(data) {
  const events = data?.events ?? [];
  const normalizeType = (t) => String(t || "").toLowerCase();

  return {
    birthdays: (data?.birthdays ?? []).length,
    holidays: (data?.holidays ?? []).length,
    events: events.filter((e) => normalizeType(e.type) === "events").length,
    announcements: events.filter((e) => normalizeType(e.type) === "announcement").length,
  };
}

/**
 * Fetch universal dashboard data for a centre and calendar month (1–12).
 */
export function useUniversalDashboard(centerId, month) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!centerId || !month) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getUniversalDashboard(centerId, month);
        if (!cancelled) {
          setData(res?.status ? res.data ?? null : null);
        }
      } catch (err) {
        console.error("Failed to fetch universal dashboard:", err);
        if (!cancelled) {
          setData(null);
          setError(err);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, [centerId, month]);

  const counts = useMemo(() => getUniversalDashboardCounts(data), [data]);
  const events = useMemo(() => normalizeDashboardEvents(data?.events), [data?.events]);

  return {
    data,
    birthdays: data?.birthdays ?? [],
    holidays: data?.holidays ?? [],
    events,
    counts,
    isLoading,
    error,
  };
}
