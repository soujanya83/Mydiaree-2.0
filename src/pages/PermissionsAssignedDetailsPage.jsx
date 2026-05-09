import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ListChecks, CheckCircle2, XCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

import {
  PERMISSION_GROUPS as STATIC_GROUPS,
} from "@/components/permissions/permissionsData";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";

export default function PermissionsAssignedDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.endsWith("/edit");

  const {
    singleUserPermission,
    isLoading,
    fetchUserPermission,
    fetchManagePermissions,
    updateUserPermissions,
    clearSingleUserPermission,
    permissionColumns,
  } = usePermissionStore();


  useEffect(() => {
    if (userId) {
      fetchUserPermission(userId);
    }
    // Also ensure we have the columns for grouping
    if (!permissionColumns || permissionColumns.length === 0) {
      fetchManagePermissions();
    }
    return () => clearSingleUserPermission();
  }, [userId, fetchUserPermission, fetchManagePermissions, clearSingleUserPermission, permissionColumns]);


  const user = singleUserPermission?.user;
  
  const selectedKeys = useMemo(() => {
    if (!singleUserPermission?.permissions) return [];
    return Object.keys(singleUserPermission.permissions).filter(
      (k) => !["id", "userid", "centerid"].includes(k) && singleUserPermission.permissions[k] === 1
    );
  }, [singleUserPermission]);

  const [localSelectedKeys, setLocalSelectedKeys] = useState([]);

  // Sync when API data changes
  useEffect(() => {
    setLocalSelectedKeys(selectedKeys);
  }, [selectedKeys]);

  const dynamicGroups = useMemo(() => {
    const groups = [...STATIC_GROUPS.map((g) => ({ ...g, permissions: [] }))];
    const otherGroup = groups.find((g) => g.key === "other") || { key: "other", label: "Other", permissions: [] };
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
        const match = col.name.match(/[A-Z].*/);
        if (match) {
          const resource = match[0];
          const resourceKey = resource.toLowerCase();
          let g = groups.find((x) => x.key === resourceKey);
          if (!g) {
            g = { key: resourceKey, label: resource + " Manage", permissions: [] };
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



  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Loading user permissions...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">User not found.</p>
        <Button className="mt-4" onClick={() => navigate("/permissions/assigned")}>
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </div>
    );
  }

  const totalPermissions = dynamicGroups.reduce(
    (acc, g) => acc + g.permissions.length,
    0
  );
  // Note: For now, this is just a read-only or simulated edit logic since API might not save here yet

  const togglePermission = (_groupKey, permKey) => {
    setLocalSelectedKeys((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };


  const toggleGroupAll = (groupKey, on) => {
    const group = dynamicGroups.find((g) => g.key === groupKey);
    if (!group) return;
    const groupKeys = group.permissions.map((p) => p.key);
    setLocalSelectedKeys((prev) => {
      const without = prev.filter((k) => !groupKeys.includes(k));
      return on ? [...without, ...groupKeys] : without;
    });
  };


  const granted = localSelectedKeys.length;
  const notGranted = totalPermissions - granted;

  const handleSave = async () => {
    try {
      const permsMap = {};
      permissionColumns.forEach((col) => {
        permsMap[col.name] = localSelectedKeys.includes(col.name) ? 1 : 0;
      });

      await updateUserPermissions(userId, permsMap);
      toast.success(`Updated permissions for ${user.name}`);
      navigate("/permissions/assigned");
    } catch (error) {
      toast.error(error?.message || "Failed to save permissions");
    }
  };


  return (
    <div className="space-y-5">
      <PageHeader
        title={`${user.name} / ${user.userType || user.role}`}
        description="Update user permissions"
        breadcrumbs={[
          { label: "Permissions Assign", to: "/permissions" },
          { label: "Assigned List", to: "/permissions/assigned" },
          { label: "Update Permissions" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/permissions/assigned")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />


      {/* User card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-lg font-bold uppercase text-primary">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold">
              {user.name} <span className="text-muted-foreground">/ {user.role}</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Assigned Permissions Overview
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ListChecks className="h-6 w-6 text-primary" />}
          tone="bg-primary/10"
          value={totalPermissions}
          label="Total Permissions"
        />
        <StatCard
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
          tone="bg-emerald-100"
          value={granted}
          label="Granted"
        />
        <StatCard
          icon={<XCircle className="h-6 w-6 text-rose-600" />}
          tone="bg-rose-100"
          value={notGranted}
          label="Not Granted"
        />
      </div>

      {/* Permission grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dynamicGroups.map((group) => (
          <PermissionCard
            key={group.key}
            group={group}
            selectedKeys={localSelectedKeys}
            onToggle={togglePermission}
            onToggleAll={toggleGroupAll}
            readOnly={false}
            showAllToggle={true}
            showCount
          />

        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" />
          Submit
        </Button>
      </div>

    </div>
  );
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div className="rounded-xl border bg-card p-5 text-center shadow-sm">
      <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${tone}`}>
        {icon}
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}