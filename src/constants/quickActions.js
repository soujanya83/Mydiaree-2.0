import {
  BookOpen,
  SlidersHorizontal,
  Camera,
  ChefHat,
  ShieldPlus,
  Moon,
  ClipboardPlus,
  PencilLine,
  ClipboardList,
  Megaphone,
} from "lucide-react";

export const QUICK_ACTIONS_STORAGE_KEY = "mydiaree:quick-actions";

/** All quick actions a standard user may choose from (pick exactly 4). */
export const QUICK_ACTION_POOL = [
  {
    id: "daily-diary",
    label: "Daily Diary",
    icon: BookOpen,
    to: "/daily-diary",
    color: "primary",
    subtitle: "Record routines",
  },
  {
    id: "observation",
    label: "Observation",
    icon: SlidersHorizontal,
    to: "/observation",
    color: "warning",
    subtitle: "Observe learning",
  },
  {
    id: "snapshots",
    label: "Snapshot",
    icon: Camera,
    to: "/snapshots",
    color: "info",
    subtitle: "Media snapshots",
  },
  {
    id: "menu",
    label: "Plan Menu",
    icon: ChefHat,
    to: "/menu",
    color: "success",
    subtitle: "Manage meals",
  },
  {
    id: "head-check",
    label: "Head Check",
    icon: ShieldPlus,
    to: "/head-check",
    color: "primary",
    subtitle: "Daily head check",
  },
  {
    id: "sleep-check",
    label: "Sleep Check",
    icon: Moon,
    to: "/sleep-check",
    color: "info",
    subtitle: "Monitor sleeping",
  },
  {
    id: "accident-form",
    label: "Accident Form",
    icon: ClipboardPlus,
    to: "/accident-form",
    color: "warning",
    subtitle: "Report incidents",
  },
  {
    id: "daily-reflections",
    label: "Daily Reflections",
    icon: PencilLine,
    to: "/daily-reflections",
    color: "success",
    subtitle: "Reflect on day",
  },
  {
    id: "program-plan",
    label: "Program Plan",
    icon: ClipboardList,
    to: "/program-plan",
    color: "success",
    subtitle: "Curriculum plans",
  },
  {
    id: "events",
    label: "Events",
    icon: Megaphone,
    to: "/events",
    color: "primary",
    subtitle: "Manage events",
  },
];

export const DEFAULT_QUICK_ACTION_IDS = [
  "daily-diary",
  "observation",
  "snapshots",
  "menu",
];

export const MAX_QUICK_ACTIONS = 4;

export function loadQuickActionIds() {
  if (typeof window === "undefined") return [...DEFAULT_QUICK_ACTION_IDS];
  try {
    const raw = localStorage.getItem(QUICK_ACTIONS_STORAGE_KEY);
    if (!raw) return [...DEFAULT_QUICK_ACTION_IDS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_QUICK_ACTION_IDS];
    const valid = parsed.filter((id) =>
      QUICK_ACTION_POOL.some((action) => action.id === id),
    );
    return valid.length === MAX_QUICK_ACTIONS
      ? valid
      : [...DEFAULT_QUICK_ACTION_IDS];
  } catch {
    return [...DEFAULT_QUICK_ACTION_IDS];
  }
}

export function saveQuickActionIds(ids) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUICK_ACTIONS_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function resolveQuickActions(ids) {
  return ids
    .map((id) => QUICK_ACTION_POOL.find((action) => action.id === id))
    .filter(Boolean);
}
