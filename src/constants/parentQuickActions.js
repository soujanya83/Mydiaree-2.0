import {
  BookOpen,
  Camera,
  ClipboardPlus,
  CalendarDays,
  Moon,
  PencilLine,
  SlidersHorizontal,
} from "lucide-react";

export const PARENT_QUICK_ACTIONS_STORAGE_KEY = "mydiaree:parent-quick-actions";

/** All quick actions a parent may choose from (pick exactly 4). */
export const PARENT_QUICK_ACTION_POOL = [
  {
    id: "daily-diary",
    label: "Daily Diary",
    icon: BookOpen,
    to: "/daily-diary",
    color: "primary",
    subtitle: "View diary",
  },
  {
    id: "sleep-check",
    label: "Sleep Check",
    icon: Moon,
    to: "/sleep-check",
    color: "info",
    subtitle: "View sleep logs",
  },
  {
    id: "accident-form",
    label: "Accident Form",
    icon: ClipboardPlus,
    to: "/accident-form",
    color: "warning",
    subtitle: "View records",
  },
  {
    id: "observation",
    label: "Observation",
    icon: SlidersHorizontal,
    to: "/observation",
    color: "success",
    subtitle: "View learning",
  },
  {
    id: "daily-reflections",
    label: "Daily Reflections",
    icon: PencilLine,
    to: "/daily-reflections",
    color: "success",
    subtitle: "View reflections",
  },
  {
    id: "snapshots",
    label: "Snapshots",
    icon: Camera,
    to: "/snapshots",
    color: "info",
    subtitle: "View photos",
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
    to: "/events",
    color: "primary",
    subtitle: "View events",
  },
];

export const DEFAULT_PARENT_QUICK_ACTION_IDS = [
  "daily-diary",
  "sleep-check",
  "accident-form",
  "observation",
];

export const MAX_PARENT_QUICK_ACTIONS = 4;

export function loadParentQuickActionIds() {
  if (typeof window === "undefined") return [...DEFAULT_PARENT_QUICK_ACTION_IDS];
  try {
    const raw = localStorage.getItem(PARENT_QUICK_ACTIONS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_PARENT_QUICK_ACTION_IDS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PARENT_QUICK_ACTION_IDS];
    const valid = parsed.filter((id) =>
      PARENT_QUICK_ACTION_POOL.some((action) => action.id === id),
    );
    return valid.length === MAX_PARENT_QUICK_ACTIONS
      ? valid
      : [...DEFAULT_PARENT_QUICK_ACTION_IDS];
  } catch {
    return [...DEFAULT_PARENT_QUICK_ACTION_IDS];
  }
}

export function saveParentQuickActionIds(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PARENT_QUICK_ACTIONS_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function resolveParentQuickActions(ids) {
  return ids
    .map((id) => PARENT_QUICK_ACTION_POOL.find((action) => action.id === id))
    .filter(Boolean);
}
