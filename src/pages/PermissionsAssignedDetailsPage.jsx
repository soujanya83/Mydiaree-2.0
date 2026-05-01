import { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, ListChecks, CheckCircle2, XCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PERMISSION_GROUPS,
  PERMISSION_USERS,
  initialAssignments,
} from "@/components/permissions/permissionsData";
import { PermissionCard } from "@/components/permissions/PermissionCard";

export default function PermissionsAssignedDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.endsWith("/edit");

  const user = useMemo(
    () => PERMISSION_USERS.find((u) => u.id === userId),
    [userId]
  );

  const [selectedKeys, setSelectedKeys] = useState(
    () => initialAssignments[userId] || []
  );

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

  const totalPermissions = PERMISSION_GROUPS.reduce(
    (acc, g) => acc + g.permissions.length,
    0
  );
  const granted = selectedKeys.length;
  const notGranted = totalPermissions - granted;

  const togglePermission = (_groupKey, permKey) => {
    if (!isEdit) return;
    setSelectedKeys((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  };

  const toggleGroupAll = (groupKey, on) => {
    if (!isEdit) return;
    const group = PERMISSION_GROUPS.find((g) => g.key === groupKey);
    if (!group) return;
    const groupKeys = group.permissions.map((p) => p.key);
    setSelectedKeys((prev) => {
      const without = prev.filter((k) => !groupKeys.includes(k));
      return on ? [...without, ...groupKeys] : without;
    });
  };

  const handleSave = () => {
    initialAssignments[userId] = [...selectedKeys];
    toast.success(`Updated permissions for ${user.name}`);
    navigate("/permissions/assigned");
  };

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>Assigned Permissions - {user.name}</span>
      </nav>

      {/* Back button */}
      <div>
        <Button variant="default" onClick={() => navigate("/permissions/assigned")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

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
        {PERMISSION_GROUPS.map((group) => (
          <PermissionCard
            key={group.key}
            group={group}
            selectedKeys={selectedKeys}
            onToggle={togglePermission}
            onToggleAll={toggleGroupAll}
            readOnly={!isEdit}
            showAllToggle={false}
            showCount
          />
        ))}
      </div>

      {isEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Submit
          </Button>
        </div>
      )}
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