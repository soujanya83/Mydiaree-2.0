import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Users,
  ChevronDown,
  X,
  Shield,
  Send,
  CalendarDays,
  GraduationCap,
  Building2,
  UtensilsCrossed,
  ShieldCheck,
  Settings,
  BookOpen,
  ClipboardList,
  SlidersHorizontal,
  Camera,
  DoorOpen,
  Users2,
  Megaphone,
  ChefHat,
  ListChecks,
  Plus,
  CheckSquare,
  FileCheck,
  CalendarCheck,
  ClipboardPlus,
  PencilLine,
  ClipboardCheck,
  ShieldPlus,
  Moon,
  BarChart3,
  BookOpenCheck,
  Salad,
  Info,
  Monitor,
  Building,
  UserCog,
  KeyRound,
  ShieldAlert,
  Box,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";
import { staffService } from "@/services/admin/staffService";

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const {
    roles,
    modulePermissions,
    permissionColumns,
    isLoading,
    isFetchingRoles,
    isFetchingRoleDetails,
    fetchManagePermissions,
    fetchRoles,
    fetchRoleDetails,
    updateRolePermissions,
    bulkAssignPermissions,
  } = usePermissionStore();

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
      setStaffUsers([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (activeCentreId) {
      fetchManagePermissions(activeCentreId);
      fetchRoles(activeCentreId);
      setSelectedUsers([]);
      setSelectedKeys([]);
      setSelectedRole(null);
    }
  }, [activeCentreId, fetchManagePermissions, fetchRoles]);

  useEffect(() => {
    const loadStaff = async () => {
      if (!activeCentreId) {
        setStaffUsers([]);
        return;
      }

      setIsStaffLoading(true);
      try {
        const response = await staffService.getStaffSettings({
          center_id: activeCentreId,
          search: debouncedSearchQuery,
          page,
          per_page: 10,
        });
        const staff = response?.data?.staff?.data || response?.data?.staff || [];
        const activeStaff = staff.filter((staffMember) => staffMember.status === "ACTIVE");

        setStaffUsers((prev) => (page === 1 ? activeStaff : [...prev, ...activeStaff]));
        const pagination = response?.pagination || response?.data?.staff || {};
        setHasMore(pagination.current_page < pagination.last_page);
      } catch (error) {
        console.error("Failed to load staff for permissions:", error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to load staff");
        setStaffUsers([]);
      } finally {
        setIsStaffLoading(false);
      }
    };

    loadStaff();
  }, [activeCentreId, debouncedSearchQuery, page]);

  const lastStaffElementRef = useCallback(
    (node) => {
      if (isStaffLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isStaffLoading, hasMore],
  );

  // Sidebar Order & Icon Mapping
  const getModuleMetadata = (moduleName) => {
    const name = moduleName.toLowerCase();

    // 1. Daily Operations (100)
    if (name === "daily diary") return { weight: 101, icon: BookOpen };
    if (name === "head check") return { weight: 102, icon: ShieldPlus };
    if (name === "sleep check") return { weight: 103, icon: Moon };
    if (name === "accident form") return { weight: 104, icon: ClipboardPlus };

    // 2. Learning & Documentation (200)
    if (name === "program plan") return { weight: 201, icon: ClipboardList };
    if (name === "learning & progress") return { weight: 202, icon: BarChart3 };
    if (name === "daily reflections") return { weight: 203, icon: PencilLine };
    if (name === "observation") return { weight: 204, icon: SlidersHorizontal };
    if (name === "snapshots") return { weight: 205, icon: Camera };

    // 3. Centre Management (300)
    if (name === "rooms") return { weight: 301, icon: DoorOpen };
    if (name === "children") return { weight: 302, icon: Users2 };
    if (name === "events") return { weight: 303, icon: Megaphone };
    if (name === "service details") return { weight: 304, icon: Info };
    if (name === "ptm") return { weight: 305, icon: CalendarCheck };

    // 4. Nutrition (400)
    if (name === "menu") return { weight: 401, icon: ChefHat };
    if (name === "recipe") return { weight: 402, icon: BookOpenCheck };
    if (name === "ingredients") return { weight: 403, icon: Salad };

    // 5. Quality & Compliance (500)
    if (name === "qip") return { weight: 501, icon: ListChecks };
    if (name === "forms") return { weight: 502, icon: FileText };

    // 6. Administration (600)
    if (name === "ip management") return { weight: 601, icon: Monitor };
    if (name === "center settings") return { weight: 602, icon: Building };
    if (name === "staff settings") return { weight: 603, icon: UserCog };
    if (name === "super admin settings") return { weight: 604, icon: ShieldAlert };
    if (name === "parent settings") return { weight: 605, icon: Users };
    if (name === "manage permissions") return { weight: 606, icon: KeyRound };

    // Other / Extra Modules (Render at the end)
    if (name === "survey") return { weight: 901, icon: ClipboardCheck };
    if (name === "lesson") return { weight: 902, icon: BookOpen };
    if (name === "assessment") return { weight: 903, icon: FileCheck };
    if (name === "activity") return { weight: 904, icon: Activity };
    if (name === "modules") return { weight: 905, icon: Box };

    // Fallbacks
    if (name.includes("daily") || name.includes("diary")) return { weight: 101, icon: BookOpen };
    if (name.includes("learning") || name.includes("progress"))
      return { weight: 202, icon: BarChart3 };
    if (name.includes("admin") || name.includes("setting")) return { weight: 600, icon: Settings };

    return { weight: 999, icon: Shield };
  };

  const sortedGroups = useMemo(() => {
    return [...(modulePermissions || [])].sort((a, b) => {
      const metaA = getModuleMetadata(a.module);
      const metaB = getModuleMetadata(b.module);
      if (metaA.weight !== metaB.weight) return metaA.weight - metaB.weight;
      return a.module.localeCompare(b.module);
    });
  }, [modulePermissions]);

  const allKeys = useMemo(() => (permissionColumns || []).map((p) => p.name), [permissionColumns]);

  const togglePermission = (_moduleName, permName) => {
    setSelectedKeys((prev) =>
      prev.includes(permName) ? prev.filter((k) => k !== permName) : [...prev, permName],
    );
  };

  const toggleGroupAll = (moduleName, on) => {
    const group = modulePermissions.find((g) => g.module === moduleName);
    if (!group) return;

    const groupKeys = [];
    if (group.permissions) group.permissions.forEach((p) => groupKeys.push(p.name));

    setSelectedKeys((prev) => {
      const without = prev.filter((k) => !groupKeys.includes(k));
      return on ? [...without, ...groupKeys] : without;
    });
  };

  const selectAll = () => setSelectedKeys(allKeys);

  const permissionsMap = useMemo(() => {
    const map = {};
    permissionColumns.forEach((col) => {
      map[col.name] = selectedKeys.includes(col.name) ? 1 : 0;
    });
    return map;
  }, [permissionColumns, selectedKeys]);

  const addUser = (u) => {
    setSelectedUsers((prev) => (prev.find((x) => x.id === u.id) ? prev : [...prev, u]));
  };
  const removeUser = (id) => setSelectedUsers((prev) => prev.filter((x) => x.id !== id));

  const applyRole = async (role) => {
    setSelectedRole(role);
    const roleKeys = permissionColumns
      .filter((permission) => Number(role?.[permission.name]) === 1)
      .map((permission) => permission.name);
    setSelectedKeys(roleKeys);

    try {
      await fetchRoleDetails(role.id);
      toast.success(`Applied ${role.name} role`);
    } catch (error) {
      toast.error(error?.message || "Failed to load latest role details");
    }
  };

  const clearSelectedRole = () => {
    setSelectedRole(null);
    setSelectedKeys([]);
  };

  const handleSubmit = async () => {
    if (selectedRole) {
      try {
        await updateRolePermissions(selectedRole.id, permissionsMap, activeCentreId);
        await fetchRoleDetails(selectedRole.id);
        if (activeCentreId) await fetchRoles(activeCentreId);
        toast.success(`Permissions updated for ${selectedRole.name}`);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to update role");
      }
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      // Update all selected users in one bulk call
      await bulkAssignPermissions(
        selectedUsers.map((u) => u.id),
        permissionsMap,
        activeCentreId,
      );

      toast.success(`Permissions updated for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setSelectedKeys([]);
      navigate("/permissions/assigned");
    } catch (error) {
      toast.error(error?.message || "Failed to update permissions");
    }
  };

  const availableUsers = useMemo(
    () => staffUsers.filter((u) => !selectedUsers.find((s) => s.id === u.id)),
    [selectedUsers, staffUsers],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading permissions...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Permissions Assign"
        description="Assign module-level permissions to users"
        breadcrumbs={[{ label: "Permissions Assign" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/permissions/roles")}>
              <Shield className="h-4 w-4" />
              Manage Role
            </Button>
            <Button onClick={handleSubmit} className="shadow-sm">
              <Send className="h-4 w-4" />
              {selectedRole ? "Save Role Permissions" : "Assign Permissions"}
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="mb-6 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,680px)_1fr] xl:items-start">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Select value={activeCentreId} onValueChange={setActiveCentre}>
                <SelectTrigger className="w-full border-muted-foreground/20 bg-background sm:w-72">
                  <SelectValue placeholder="Select Center" />
                </SelectTrigger>
                <SelectContent>
                  {centres.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-muted-foreground/20">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {isFetchingRoles || isFetchingRoleDetails
                      ? "Loading Roles"
                      : selectedRole?.name || "Select Role"}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                  {roles.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No roles found
                    </div>
                  ) : (
                    roles.map((r) => (
                      <DropdownMenuItem key={r.id} onSelect={() => applyRole(r)}>
                        {r.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {selectedRole && (
                <div className="flex h-10 animate-in items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 text-sm fade-in slide-in-from-left-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  <span className="font-medium text-primary">{selectedRole.name}</span>
                  <button
                    type="button"
                    onClick={clearSelectedRole}
                    className="ml-1 rounded-full p-1 text-muted-foreground hover:bg-primary/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 min-w-[200px] justify-between border-muted-foreground/20 px-3 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {selectedUsers.length === 0 ? (
                        <span className="text-muted-foreground">Select users...</span>
                      ) : (
                        <span>{selectedUsers.length} users selected</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px]">
                  <div className="p-2 border-b">
                    <Input
                      placeholder="Search staff..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-xs"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {isStaffLoading && staffUsers.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs italic text-muted-foreground">
                      <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin text-primary" />
                      Loading staff members...
                    </div>
                  ) : (
                    <>
                      {selectedUsers.length > 0 && (
                        <div className="border-b p-2">
                          <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70">
                            Selected ({selectedUsers.length})
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                            {selectedUsers.map((u) => (
                              <div
                                key={u.id}
                                className="flex items-center gap-1.5 rounded-full bg-primary/10 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-primary"
                              >
                                {u.name}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    removeUser(u.id);
                                  }}
                                  className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-primary/20"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="max-h-[250px] overflow-y-auto p-1">
                        <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                          Available Staff
                        </div>
                        {availableUsers.length === 0 ? (
                          <div className="px-3 py-4 text-center text-xs italic text-muted-foreground">
                            No more users available
                          </div>
                        ) : (
                          availableUsers.map((u, index) => {
                            const isLast = availableUsers.length === index + 1;
                            return (
                              <DropdownMenuItem
                                key={u.id}
                                ref={isLast ? lastStaffElementRef : null}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  addUser(u);
                                }}
                                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg py-2"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{u.name}</span>
                                  <span className="text-[10px] uppercase text-muted-foreground">
                                    {u.userType || u.role}
                                  </span>
                                </div>
                                <Plus className="h-4 w-4 text-muted-foreground/40" />
                              </DropdownMenuItem>
                            );
                          })
                        )}
                        {isStaffLoading && (
                          <div className="flex justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="h-9 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/permissions/assigned")}
                  className="h-9 px-3 text-xs font-bold uppercase tracking-wider hover:bg-muted/50"
                >
                  <Users className="h-3.5 w-3.5" />
                  Assigned List
                </Button>
              </div>
            </div>
          </div>

          <SelectedUsersInline
            selectedUsers={selectedUsers}
            selectedKeys={selectedKeys}
            onRemoveUser={removeUser}
          />
        </div>
      </div>

      {/* Permission grid */}
      <div className={cn("grid gap-6", "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        {sortedGroups.map((group) => {
          const meta = getModuleMetadata(group.module);
          return (
            <PermissionCard
              key={group.module}
              group={{ ...group, icon: meta.icon }}
              selectedKeys={selectedKeys}
              onToggle={togglePermission}
              onToggleAll={toggleGroupAll}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {sortedGroups.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Shield className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-bold">No Permissions Found</h3>
          <p className="text-muted-foreground">Select a center or check your network connection.</p>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          className="h-14 rounded-full px-8 shadow-2xl transition-transform hover:scale-105 active:scale-95"
          onClick={handleSubmit}
          disabled={!selectedRole && selectedUsers.length === 0}
        >
          <Send className="mr-2 h-5 w-5" />
          {selectedRole ? "Save Changes" : "Assign Now"}
        </Button>
      </div>
    </div>
  );
}

function userInitials(user) {
  return (user?.name || "User")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SelectedUsersInline({ selectedUsers, selectedKeys, onRemoveUser }) {
  const visibleUsers = selectedUsers.slice(0, 5);
  const hiddenCount = Math.max(selectedUsers.length - visibleUsers.length, 0);

  return (
    <div className="min-h-24 rounded-xl border border-dashed border-border bg-muted/15 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Selected staff
            </p>
            <p className="text-sm font-semibold text-foreground">
              {selectedUsers.length} users, {selectedKeys.length} permissions
            </p>
          </div>
        </div>
      </div>

      {selectedUsers.length === 0 ? (
        <div className="flex h-11 items-center rounded-lg bg-background px-3 text-sm text-muted-foreground">
          Selected users will appear here.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              className="flex max-w-[190px] items-center gap-2 rounded-full border bg-background py-1.5 pl-1.5 pr-2 text-sm shadow-sm"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                {userInitials(user)}
              </span>
              <span className="truncate font-medium text-foreground">{user.name}</span>
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${user.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {hiddenCount > 0 && (
            <div className="flex h-10 items-center rounded-full border bg-background px-3 text-sm font-semibold text-muted-foreground">
              +{hiddenCount} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
