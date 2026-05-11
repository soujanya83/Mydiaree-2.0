import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PERMISSION_GROUPS as STATIC_GROUPS } from "@/components/permissions/permissionsData";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";

export default function PermissionsRoleDetailsPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { selectedRoleDetails, isFetchingRoleDetails, fetchRoleDetails, clearSelectedRoleDetails } =
    usePermissionStore();

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails(roleId);
    }
    return () => clearSelectedRoleDetails();
  }, [roleId, fetchRoleDetails, clearSelectedRoleDetails]);

  const role = selectedRoleDetails?.role;
  const permissions = useMemo(() => selectedRoleDetails?.permissions || [], [selectedRoleDetails]);

  const selectedKeys = useMemo(
    () => permissions.filter((p) => Number(p.value) === 1).map((p) => p.name),
    [permissions],
  );

  const dynamicGroups = useMemo(() => {
    const groups = [...STATIC_GROUPS.map((g) => ({ ...g, permissions: [] }))];
    const otherGroup = groups.find((g) => g.key === "other") || {
      key: "other",
      label: "Other",
      permissions: [],
    };
    if (!groups.find((g) => g.key === "other")) groups.push(otherGroup);

    permissions.forEach((permission) => {
      const lowerName = permission.name.toLowerCase();
      let assigned = false;
      for (const group of groups) {
        if (group.key !== "other" && lowerName.includes(group.key)) {
          group.permissions.push({
            key: permission.name,
            label: permission.label,
            icon: "settings",
          });
          assigned = true;
          break;
        }
      }

      if (!assigned) {
        const match = permission.name.match(/[A-Z].*/);
        if (match) {
          const resource = match[0];
          const resourceKey = resource.toLowerCase();
          let group = groups.find((x) => x.key === resourceKey);
          if (!group) {
            group = { key: resourceKey, label: resource + " Manage", permissions: [] };
            groups.splice(groups.length - 1, 0, group);
          }
          group.permissions.push({
            key: permission.name,
            label: permission.label,
            icon: "settings",
          });
        } else {
          otherGroup.permissions.push({
            key: permission.name,
            label: permission.label,
            icon: "settings",
          });
        }
      }
    });

    return groups.filter((group) => group.permissions.length > 0);
  }, [permissions]);

  if (isFetchingRoleDetails) {
    return <div className="py-20 text-center text-muted-foreground">Loading role details...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Role Details"
        breadcrumbs={[
          { label: "Permissions Assign", to: "/permissions" },
          { label: "Role List", to: "/permissions/roles" },
          { label: "Details" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/permissions/roles")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />
      <div className="mb-5 rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-sm text-muted-foreground">Role Name</p>
        <p className="mt-1 text-lg font-semibold">{role?.name || "-"}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dynamicGroups.map((group) => (
          <PermissionCard
            key={group.key}
            group={group}
            selectedKeys={selectedKeys}
            readOnly
            showAllToggle={false}
            showCount
          />
        ))}
      </div>
    </div>
  );
}
