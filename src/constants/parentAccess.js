/** Routes parents may access (view-only). Create/edit/recycle paths are blocked. */
export const PARENT_NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", iconKey: "dashboard", to: "/dashboard" },
  { key: "daily-diary", label: "Daily Diary", iconKey: "daily-diary", to: "/daily-diary" },
  { key: "sleep-check", label: "Sleep Check", iconKey: "sleep-check", to: "/sleep-check" },
  { key: "accident-form", label: "Accident Form", iconKey: "accident-form", to: "/accident-form" },
  { key: "program-plan", label: "Program Plan", iconKey: "program-plan", to: "/program-plan" },
  { key: "observation", label: "Observation", iconKey: "observation", to: "/observation" },
  { key: "daily-reflections", label: "Daily Reflections", iconKey: "daily-reflections", to: "/daily-reflections" },
  { key: "snapshots", label: "Snapshots", iconKey: "snapshots", to: "/snapshots" },
  { key: "events", label: "Events", iconKey: "events", to: "/events" },
];

const PARENT_ROUTE_ROOTS = [
  "/dashboard",
  "/my-profile",
  "/daily-diary",
  "/sleep-check",
  "/accident-form",
  "/program-plan",
  "/observation",
  "/daily-reflections",
  "/snapshots",
  "/events",
];

const PARENT_BLOCKED_SEGMENTS = ["/create", "/recycle-bin", "/edit", "/activity", "/holidays"];

export function isParentUser(user) {
  return String(user?.userType || "").toLowerCase() === "parent";
}

export function isParentRouteAllowed(pathname) {
  if (PARENT_BLOCKED_SEGMENTS.some((segment) => pathname.includes(segment))) {
    return false;
  }
  return PARENT_ROUTE_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}
