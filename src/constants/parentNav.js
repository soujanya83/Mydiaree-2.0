import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Moon,
  ClipboardPlus,
  GraduationCap,
  ClipboardList,
  PencilLine,
  SlidersHorizontal,
  Camera,
  Building2,
  Megaphone,
} from "lucide-react";

/** Sidebar config for parent users — grouped like staff navigation. */
export const parentNavConfig = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
  },
  {
    key: "daily-operations",
    label: "Daily Operations",
    icon: CalendarDays,
    items: [
      { label: "Daily Diary", to: "/daily-diary", icon: BookOpen },
      { label: "Sleep Check", to: "/sleep-check", icon: Moon },
      { label: "Accident Form", to: "/accident-form", icon: ClipboardPlus },
    ],
  },
  {
    key: "learning",
    label: "Learning & Documentation",
    icon: GraduationCap,
    items: [
      { label: "Program Plan", to: "/program-plan", icon: ClipboardList },
      { label: "Daily Reflections", to: "/daily-reflections", icon: PencilLine },
      { label: "Observation", to: "/observation", icon: SlidersHorizontal },
      { label: "Snapshots", to: "/snapshots", icon: Camera },
    ],
  },
  {
    key: "centre",
    label: "Centre Management",
    icon: Building2,
    items: [{ label: "Events", to: "/events", icon: Megaphone }],
  },
];
