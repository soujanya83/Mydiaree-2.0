import { useMemo, useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
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
        const response = await staffService.getStaffSettings(activeCentreId);
        const staff = response?.data?.staff || [];
        setStaffUsers(staff.filter((staffMember) => staffMember.status === "ACTIVE"));
      } catch (error) {
        console.error("Failed to load staff for permissions:", error);
        toast.error(error?.response?.data?.message || error?.message || "Failed to load staff");
        setStaffUsers([]);
      } finally {
        setIsStaffLoading(false);
      }
    };

    loadStaff();
  }, [activeCentreId]);

  // Sidebar Order & Icon Mapping
  const getModuleMetadata = (moduleName) => {
    const name = moduleName.toLowerCase();

    // Daily Operations
    if (name.includes("daily") || name.includes("diary") || name.includes("journal") || name.includes("head check") || name.includes("accident")) {
      return { weight: 1, icon: CalendarDays };
    }
    // Learning
    if (name.includes("program")) return { weight: 2, icon: ClipboardList };
    if (name.includes("observation")) return { weight: 2, icon: SlidersHorizontal };
    if (name.includes("snapshot")) return { weight: 2, icon: Camera };
    if (name.includes("learning") || name.includes("progress")) return { weight: 2, icon: GraduationCap };

    // Centre
    if (name.includes("room")) return { weight: 3, icon: DoorOpen };
    if (name.includes("child")) return { weight: 3, icon: Users2 };
    if (name.includes("event")) return { weight: 3, icon: Megaphone };
    if (name.includes("centre") || name.includes("service")) return { weight: 3, icon: Building2 };

    // Nutrition
    if (name.includes("menu")) return { weight: 4, icon: ChefHat };
    if (name.includes("eat") || name.includes("nutrition") || name.includes("recipe")) return { weight: 4, icon: UtensilsCrossed };

    // Compliance
    if (name.includes("qip") || name.includes("compliance") || name.includes("form")) return { weight: 5, icon: ListChecks };

    // Admin / Other
    if (name.includes("user") || name.includes("staff") || name.includes("admin") || name.includes("parent") || name.includes("other") || name.includes("permission")) {
      return { weight: 6, icon: Settings };
    }

    return { weight: 99, icon: Shield };
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
    if (group.submodules) {
      group.submodules.forEach((sub) => {
        if (sub.permissions) sub.permissions.forEach((p) => groupKeys.push(p.name));
      });
    }

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
        await updateRolePermissions(selectedRole.id, permissionsMap);
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
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger className="w-full sm:w-72 bg-background border-muted-foreground/20">
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
            <div className="flex h-10 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 text-sm animate-in fade-in slide-in-from-left-2">
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
              <Button variant="outline" className="h-10 min-w-[200px] justify-between border-muted-foreground/20 px-3 font-medium">
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
              {isStaffLoading ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground italic">
                  <div className="mb-2 h-4 w-4 animate-spin mx-auto rounded-full border-2 border-primary border-t-transparent" />
                  Loading staff members...
                </div>
              ) : (
                <>
                  {/* Selected Users Section */}
                  {selectedUsers.length > 0 && (
                    <div className="p-2 border-b">
                      <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary/70">
                        Selected ({selectedUsers.length})
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5 px-1">
                        {selectedUsers.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center gap-1.5 rounded-full bg-primary/10 pl-2.5 pr-1.5 py-1 text-xs font-semibold text-primary"
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

                  {/* Available Users Section */}
                  <div className="max-h-[250px] overflow-y-auto p-1">
                    <div className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                      Available Staff
                    </div>
                    {availableUsers.length === 0 ? (
                      <div className="px-3 py-4 text-center text-xs text-muted-foreground italic">
                        No more users available
                      </div>
                    ) : (
                      availableUsers.map((u) => (
                        <DropdownMenuItem
                          key={u.id}
                          onSelect={(e) => {
                            e.preventDefault();
                            addUser(u);
                          }}
                          className="flex items-center justify-between gap-3 rounded-lg py-2 cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{u.userType || u.role}</span>
                          </div>
                          <Plus className="h-4 w-4 text-muted-foreground/40" />
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-9 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/permissions/assigned")} className="h-9 px-3 text-xs font-bold uppercase tracking-wider hover:bg-muted/50">
              <Users className="h-3.5 w-3.5" />
              Assigned List
            </Button>
          </div>
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
