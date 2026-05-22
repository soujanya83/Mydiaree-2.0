import { Bell, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { isParentUser } from "@/constants/parentAccess";
import { ParentChildSelect } from "@/components/dashboard/ParentChildSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleMobile = useUiStore((s) => s.toggleMobileSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const parentChildren = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentDashboardStore((s) => s.setSelectedChildId);
  const fetchParentChildren = useParentDashboardStore((s) => s.fetchChildren);
  const navigate = useNavigate();
  const isParent = isParentUser(user);

  const initials = (user?.name ?? "NA")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  useEffect(() => {
    if (isParent && activeCentreId) {
      fetchParentChildren(activeCentreId);
    }
  }, [isParent, activeCentreId, fetchParentChildren]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md">
      {/* Mobile menu */}
      <button
        onClick={toggleMobile}
        className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </button>

      {/* Search */}
      {/* <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search children, rooms, forms..."
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div> */}

      <div className="ml-auto flex items-center gap-2">
        {isParent && parentChildren.length > 0 && (
          <ParentChildSelect
            children={parentChildren}
            value={selectedChildId}
            onChange={setSelectedChildId}
            className="h-9 min-w-[180px] sm:w-[220px]"
          />
        )}
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-muted">
              <Avatar className="h-8 w-8">
                {user?.imageUrl && (
                  <AvatarImage src={`https://mydiaree.com.au/${user.imageUrl}`} alt={user.name} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <p className="text-xs font-semibold leading-none text-foreground">
                  {user?.name ?? "Nextgen Admin"}
                </p>
                <p className="mt-1 text-[10px] capitalize text-muted-foreground">
                  {user?.userType ?? "superadmin"}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/my-profile")}>My Profile</DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
