import { useMemo, useState } from "react";
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
import { cn } from "@/lib/utils";
import {
  PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  PERMISSION_USERS,
  ROLE_OPTIONS,
} from "@/components/permissions/permissionsData";
import { PermissionCard } from "@/components/permissions/PermissionCard";

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const togglePermission = (_groupKey, permKey) => {
    setSelectedKeys((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const toggleGroupAll = (groupKey, on) => {
    const group = PERMISSION_GROUPS.find((g) => g.key === groupKey);
    if (!group) return;
    const groupKeys = group.permissions.map((p) => p.key);
    setSelectedKeys((prev) => {
      const without = prev.filter((k) => !groupKeys.includes(k));
      return on ? [...without, ...groupKeys] : without;
    });
  };

  const selectAll = () => setSelectedKeys(ALL_PERMISSION_KEYS);

  const addUser = (u) => {
    setSelectedUsers((prev) => (prev.find((x) => x.id === u.id) ? prev : [...prev, u]));
  };
  const removeUser = (id) => setSelectedUsers((prev) => prev.filter((x) => x.id !== id));

  const applyRolePreset = (role) => {
    if (role === "admin") setSelectedKeys(ALL_PERMISSION_KEYS);
    else if (role === "viewer")
      setSelectedKeys(ALL_PERMISSION_KEYS.filter((k) => k.startsWith("view_")));
    else if (role === "manager")
      setSelectedKeys(
        ALL_PERMISSION_KEYS.filter(
          (k) => !k.startsWith("delete_") && !k.startsWith("deletesub_")
        )
      );
    else setSelectedKeys([]);
    toast.success(`Applied ${role} role preset`);
  };

  const handleAssign = () => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }
    toast.success(
      `Assigned ${selectedKeys.length} permissions to ${selectedUsers.length} user(s)`
    );
  };

  const availableUsers = useMemo(
    () => PERMISSION_USERS.filter((u) => !selectedUsers.find((s) => s.id === u.id)),
    [selectedUsers]
  );

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
            <Button onClick={handleAssign}>
              <Send className="h-4 w-4" />
              Assign Permissions
            </Button>
          </>
        }
      />

      {/* Toolbar */}
      <div className="mb-5 rounded-xl border bg-card p-3 shadow-sm">
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
              {availableUsers.length === 0 ? (
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
                    <span className="text-xs text-muted-foreground">{u.role}</span>
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
                Select Role
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ROLE_OPTIONS.map((r) => (
                <DropdownMenuItem key={r.value} onClick={() => applyRolePreset(r.value)}>
                  {r.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Permission grid */}
      <div className={cn("grid gap-4", "grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}>
        {PERMISSION_GROUPS.map((group) => (
          <PermissionCard
            key={group.key}
            group={group}
            selectedKeys={selectedKeys}
            onToggle={togglePermission}
            onToggleAll={toggleGroupAll}
          />
        ))}
      </div>
    </div>
  );
}
