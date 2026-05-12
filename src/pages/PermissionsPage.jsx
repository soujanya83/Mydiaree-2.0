import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Users, ChevronDown, X, Shield, Send } from "lucide-react";
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
import { PERMISSION_GROUPS as STATIC_GROUPS } from "@/components/permissions/permissionsData";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";
import { staffService } from "@/services/admin/staffService";

export default function PermissionsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const {
    roles,
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

  const dynamicGroups = useMemo(() => {
    const groups = [...STATIC_GROUPS.map((g) => ({ ...g, permissions: [] }))];
    const otherGroup = groups.find((g) => g.key === "other") || {
      key: "other",
      label: "Other",
      permissions: [],
    };
    if (!groups.find((g) => g.key === "other")) groups.push(otherGroup);

    (permissionColumns || []).forEach((col) => {
      const lowerName = col.name.toLowerCase();
      let assigned = false;
      for (const g of groups) {
        if (g.key !== "other" && lowerName.includes(g.key)) {
          g.permissions.push({ key: col.name, label: col.label, icon: "settings" });
          assigned = true;
          break;
        }
      }
      if (!assigned) {
        // try to extract resource name (e.g., addProgramPlan -> ProgramPlan)
        const match = col.name.match(/[A-Z].*/);
        if (match) {
          const resource = match[0];
          const resourceKey = resource.toLowerCase();
          let g = groups.find((x) => x.key === resourceKey);
          if (!g) {
            g = { key: resourceKey, label: resource + " Manage", permissions: [] };
            // insert before 'other'
            groups.splice(groups.length - 1, 0, g);
          }
          g.permissions.push({ key: col.name, label: col.label, icon: "settings" });
        } else {
          otherGroup.permissions.push({ key: col.name, label: col.label, icon: "settings" });
        }
      }
    });
    return groups.filter((g) => g.permissions.length > 0);
  }, [permissionColumns]);

  const allKeys = useMemo(
    () => dynamicGroups.flatMap((g) => g.permissions.map((p) => p.key)),
    [dynamicGroups],
  );

  const togglePermission = (_groupKey, permKey) => {
    setSelectedKeys((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey],
    );
  };

  const toggleGroupAll = (groupKey, on) => {
    const group = dynamicGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const groupKeys = group.permissions.map((p) => p.key);
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
    return <div className="py-20 text-center text-muted-foreground">Loading permissions...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Permissions Assign"
        description="Assign module-level permissions to users"
        breadcrumbs={[{ label: "Permissions Assign" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/permissions/roles")}>
              <Shield className="h-4 w-4" />
              Manage Role
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4" />
              {selectedRole ? "Save Role Permissions" : "Assign Permissions"}
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger className="w-full sm:w-64 bg-background">
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
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Multi-select user box */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-h-10 flex-1 min-w-[260px] flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 text-left text-sm transition-colors hover:border-primary/40"
              >
                {selectedUsers.length === 0 ? (
                  <span className="px-1.5 text-muted-foreground">Select users</span>
                ) : (
                  selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 rounded border bg-muted px-2 py-0.5 text-xs"
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeUser(u.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </span>
                      {u.name}
                    </span>
                  ))
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[280px]">
              {isStaffLoading ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Loading staff...
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  All users selected
                </div>
              ) : (
                availableUsers.map((u) => (
                  <DropdownMenuItem
                    key={u.id}
                    onSelect={(e) => {
                      e.preventDefault();
                      addUser(u);
                    }}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>{u.name}</span>
                    <span className="text-xs text-muted-foreground">{u.userType || u.role}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={selectAll}>
            <CheckCircle2 className="h-4 w-4" />
            Select All Permissions
          </Button>

          <Button variant="outline" onClick={() => navigate("/permissions/assigned")}>
            <Users className="h-4 w-4" />
            Assigned Users List
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <CheckCircle2 className="h-4 w-4" />
                {isFetchingRoles || isFetchingRoleDetails
                  ? "Loading Roles"
                  : selectedRole?.name || "Select Role"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            <div className="flex min-h-10 items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 text-sm">
              <span className="text-muted-foreground">Selected role:</span>
              <span className="font-medium text-primary">{selectedRole.name}</span>
              <button
                type="button"
                onClick={clearSelectedRole}
                className="rounded p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                aria-label="Clear selected role"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Permission grid */}
      <div className={cn("grid gap-4", "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        {dynamicGroups.map((group) => (
          <PermissionCard
            key={group.key}
            group={group}
            selectedKeys={selectedKeys}
            onToggle={togglePermission}
            onToggleAll={toggleGroupAll}
          />
        ))}
      </div>

      {/* Floating Submit Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="shadow-xl"
          onClick={handleSubmit}
          disabled={!selectedRole && selectedUsers.length === 0}
        >
          <Send className="h-4 w-4" />
          {selectedRole ? "Save Role Permissions" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
