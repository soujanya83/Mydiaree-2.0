import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navConfig } from "@/constants/nav";
import { parentNavConfig } from "@/constants/parentNav";
import { useUiStore } from "@/stores/uiStore";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTE_PERMISSIONS, SUPERADMIN_ONLY_ROUTES } from "@/constants/permissionMap";

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const expandedGroups = useUiStore((s) => s.expandedGroups);
  const toggleGroup = useUiStore((s) => s.toggleGroup);

  const pathname = useLocation().pathname;
  const isActive = (to) => pathname === to || pathname.startsWith(to + "/");

  const { canAny, isSuperadmin, isParent } = usePermissions();

  // ----- Filter nav items by permission -----
  const filteredNav = useMemo(() => {
    if (isParent) {
      return parentNavConfig;
    }

    return navConfig
      .map((group) => {
        // Single-link group (e.g. Dashboard) — always visible
        if (group.to && !group.items) {
          return group;
        }

        // Group with sub-items — filter children
        const visibleItems = (group.items || []).filter((item) => {
          // Superadmin-only routes
          if (SUPERADMIN_ONLY_ROUTES.includes(item.to)) {
            return isSuperadmin;
          }

          // Check route permissions
          const perms = ROUTE_PERMISSIONS[item.to];
          if (!perms || perms.length === 0) {
            // No permissions defined → always visible
            return true;
          }
          return canAny(perms);
        });

        // If no visible children → hide the entire group
        if (visibleItems.length === 0) return null;

        return { ...group, items: visibleItems };
      })
      .filter(Boolean);
  }, [canAny, isSuperadmin, isParent]);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-sm font-bold leading-none">MyDiaree</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-sidebar-muted">
                  Childcare Suite
                </p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-md p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {filteredNav.map((group) => {
              const Icon = group.icon;

              // Single-link group (Dashboard)
              if (group.to && !group.items) {
                const active = isActive(group.to);
                return (
                  <li key={group.key}>
                    <Link
                      to={group.to}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "text-sidebar-foreground/90 hover:bg-primary/15 hover:text-sidebar-foreground",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? group.label : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{group.label}</span>}
                    </Link>
                  </li>
                );
              }

              const open = !!expandedGroups[group.key];
              const hasActiveChild = group.items?.some((it) => isActive(it.to));

              return (
                <li key={group.key}>
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      hasActiveChild
                        ? "text-primary"
                        : "text-sidebar-foreground/90 hover:bg-primary/15 hover:text-sidebar-foreground",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? group.label : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{group.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            open && "rotate-180"
                          )}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {!collapsed && group.items && open && (
                    <ul className="mt-0.5 space-y-0.5 pl-7">
                      {group.items.map((item) => {
                        const SubIcon = item.icon;
                        const active = isActive(item.to);
                        return (
                          <li key={item.to}>
                            <Link
                              to={item.to}
                              onClick={() => setMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                                active
                                  ? "bg-primary/15 text-primary font-semibold"
                                  : "text-sidebar-foreground/75 hover:bg-primary/10 hover:text-sidebar-foreground"
                              )}
                            >
                              {SubIcon && <SubIcon className="h-3.5 w-3.5" />}
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-sidebar-border p-3">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <p className="text-xs font-semibold text-sidebar-foreground">
                Need help?
              </p>
              <p className="mt-1 text-[11px] text-sidebar-muted">
                Visit our help centre or contact support.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
