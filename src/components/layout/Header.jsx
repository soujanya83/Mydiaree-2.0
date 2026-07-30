import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeSwitcher } from "@/components/common/ThemeSwitcher";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import logoLong from "@/assets/mydiaree_long_logo.png";
import logoShort from "@/assets/mydiearee_short_logo.png";

import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { isParentUser } from "@/constants/parentAccess";
import { ParentChildSelect } from "@/components/dashboard/ParentChildSelect";
import { ParentPortfolioDownload } from "@/components/layout/ParentPortfolioDownload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { IMG_BASE_API } from "../../api/imageapi";
import { EC2_IMG_BASE_API } from "../../api/imageapi";

export function Header() {
  const toggleMobile = useUiStore((s) => s.toggleMobileSidebar);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const parentChildren = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentDashboardStore((s) => s.setSelectedChildId);
  const navigate = useNavigate();
  const isParent = isParentUser(user);

  const initials = (user?.name ?? "NA")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

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

      {/* Logo in center on desktop, left on mobile */}
      <div
        className="flex items-center cursor-pointer lg:flex-1 lg:justify-center"
        onClick={() => navigate("/dashboard")}
      >
        <img src={logoLong} alt="MyDiaree" className="hidden lg:block h-14 sm:h-16 w-auto" />
        <img src={logoShort} alt="MyDiaree" className="block lg:hidden h-9 w-auto" />
      </div>

      {/* Search */}
      {/* <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search children, rooms, forms..."
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
        />
      </div> */}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {isParent && (
          <>
            <ParentChildSelect
              children={parentChildren}
              value={selectedChildId}
              onChange={setSelectedChildId}
              className="h-9 w-[110px] sm:w-[180px] md:w-[220px]"
            />
            <ParentPortfolioDownload selectedChildId={selectedChildId} />
          </>
        )}
        {/* Theme switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 transition hover:bg-muted">
              <Avatar className="h-8 w-8">
                {user?.imageUrl && (
                  <AvatarImage src={`${EC2_IMG_BASE_API}${user.imageUrl}`} alt={user.name} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block px-2 py-1">
                <p className="text-sm font-semibold leading-none text-foreground">
                  {user?.name ?? "Nextgen Admin"}
                </p>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {user?.userType?.toLowerCase() === "centeradmin"
                    ? "Admin"
                    : (user?.userType ?? "superadmin")}
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
