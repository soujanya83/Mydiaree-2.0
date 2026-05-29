import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ListChecks,
  CheckCircle2,
  XCircle,
  Save,
  CalendarDays,
  GraduationCap,
  Building2,
  UtensilsCrossed,
  ShieldCheck,
  Settings,
  ClipboardList,
  SlidersHorizontal,
  PencilLine,
  Camera,
  ClipboardPlus,
  DoorOpen,
  Users2,
  Users,
  Megaphone,
  ChefHat,
  ListChecks as ListChecksIcon,
  Shield,
  User,
  Mail,
  Phone,
  ShieldAlert,
  Activity,
  BookOpen,
  CheckSquare,
  FileCheck,
  CalendarCheck,
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
  Box,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";
import { cn } from "@/lib/utils";
import { personAvatarUrl } from "@/utils/personDisplay";


export default function PermissionsAssignedDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    singleUserPermission,
    modulePermissions,
    isLoading,
    fetchUserPermission,
    fetchManagePermissions,
    updateUserPermissions,
    clearSingleUserPermission,
    permissionColumns,
  } = usePermissionStore();
  const { activeCentreId } = useCentreStore();

  const [localSelectedKeys, setLocalSelectedKeys] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchUserPermission(userId, activeCentreId);
    }
    // Also ensure we have the modules for rendering
    if (!modulePermissions || modulePermissions.length === 0) {
      fetchManagePermissions(activeCentreId);
    }
    return () => clearSingleUserPermission();
  }, [
    userId,
    fetchUserPermission,
    fetchManagePermissions,
    clearSingleUserPermission,
    modulePermissions.length,
  ]);

  const user = singleUserPermission?.user;

  const initialSelectedKeys = useMemo(() => {
    if (!singleUserPermission?.permissions) return [];
    return Object.keys(singleUserPermission.permissions).filter(
      (k) =>
        !["id", "userid", "centerid"].includes(k) &&
        Number(singleUserPermission.permissions[k]) === 1,
    );
  }, [singleUserPermission]);

  // Sync when API data changes
  useEffect(() => {
    setLocalSelectedKeys(initialSelectedKeys);
  }, [initialSelectedKeys]);

  // Sidebar Order & Icon Mapping (Shared Logic)
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
    if (name === "qip") return { weight: 501, icon: ListChecksIcon };
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

  const totalPermissions = useMemo(() => (permissionColumns || []).length, [permissionColumns]);

  const togglePermission = (_moduleName, permName) => {
    setLocalSelectedKeys((prev) =>
      prev.includes(permName) ? prev.filter((k) => k !== permName) : [...prev, permName],
    );
  };

  const toggleGroupAll = (moduleName, on) => {
    const group = modulePermissions.find((g) => g.module === moduleName);
    if (!group) return;

    const groupKeys = [];
    if (group.permissions) group.permissions.forEach((p) => groupKeys.push(p.name));

    setLocalSelectedKeys((prev) => {
      const without = prev.filter((k) => !groupKeys.includes(k));
      return on ? [...without, ...groupKeys] : without;
    });
  };

  const granted = localSelectedKeys.length;
  const notGranted = Math.max(0, totalPermissions - granted);

  const handleSave = async () => {
    try {
      const permsMap = {};
      permissionColumns.forEach((col) => {
        permsMap[col.name] = localSelectedKeys.includes(col.name) ? 1 : 0;
      });

      await updateUserPermissions(userId, permsMap, activeCentreId);
      toast.success(`Updated permissions for ${user.name}`);
      navigate("/permissions/assigned");
    } catch (error) {
      toast.error(error?.message || "Failed to save permissions");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground">Loading user permissions...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center shadow-sm">
        <ShieldAlert className="mb-4 h-12 w-12 text-destructive opacity-50" />
        <h3 className="text-lg font-bold">User Not Found</h3>
        <p className="max-w-xs text-sm text-muted-foreground">
          The user permissions you are looking for could not be retrieved.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => navigate("/permissions/assigned")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.name}`}
        description={`Manage permissions for ${user.username || user.email}`}
        breadcrumbs={[
          { label: "Permissions", to: "/permissions" },
          { label: "Assigned Users", to: "/permissions/assigned" },
          { label: "User Permissions" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/permissions/assigned")}>
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="shadow-md">
              <Save className="h-4 w-4" />
              Save Permissions
            </Button>
          </div>
        }
      />

      {/* User Info & Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User Card */}
        <div className="flex items-center gap-5 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-4 ring-background shadow-inner">
              {user.imageUrl ? (
                <img src={personAvatarUrl(user.imageUrl)} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background border shadow-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground leading-tight">{user.name}</h2>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>{user.userType || user.role}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<ListChecks className="h-6 w-6 text-primary" />}
            tone="bg-primary/5 text-primary border-primary/10"
            value={totalPermissions}
            label="Total Available"
          />
          <StatCard
            icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
            tone="bg-emerald-50 text-emerald-600 border-emerald-100"
            value={granted}
            label="Permissions Granted"
          />
          <StatCard
            icon={<XCircle className="h-6 w-6 text-rose-600" />}
            tone="bg-rose-50 text-rose-600 border-rose-100"
            value={notGranted}
            label="Not Granted"
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
              selectedKeys={localSelectedKeys}
              onToggle={togglePermission}
              onToggleAll={toggleGroupAll}
              readOnly={false}
            />
          );
        })}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          className="h-14 rounded-full px-8 shadow-2xl transition-transform hover:scale-105 active:scale-95"
          onClick={handleSave}
        >
          <Save className="mr-2 h-5 w-5" />
          Update Permissions
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon, tone, value, label }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border bg-card p-5 text-center shadow-sm",
        tone,
      )}
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-background/50 border shadow-sm">
        {icon}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</div>
    </div>
  );
}
