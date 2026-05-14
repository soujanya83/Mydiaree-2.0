import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  SlidersHorizontal,
  PencilLine,
  Camera,
  ClipboardPlus,
  GraduationCap,
  DoorOpen,
  Users2,
  Users,
  Megaphone,
  Building2,
  ChefHat,
  UtensilsCrossed,
  ListChecks,
  Settings,
  Shield,
  BookOpen,
  FileCheck,
  Activity,
  CalendarCheck,
  ClipboardCheck,
  CheckSquare,
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
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PermissionCard } from "@/components/permissions/PermissionCard";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";
import { cn } from "@/lib/utils";

export default function PermissionsRoleDetailsPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();
  const { 
    selectedRoleDetails, 
    isFetchingRoleDetails, 
    modulePermissions,
    fetchRoleDetails, 
    fetchManagePermissions,
    clearSelectedRoleDetails 
  } = usePermissionStore();
  const { activeCentreId } = useCentreStore();

  useEffect(() => {
    if (roleId) {
      fetchRoleDetails(roleId);
    }
    if (!modulePermissions || modulePermissions.length === 0) {
      fetchManagePermissions(activeCentreId);
    }
    return () => clearSelectedRoleDetails();
  }, [roleId, fetchRoleDetails, fetchManagePermissions, clearSelectedRoleDetails, modulePermissions.length, activeCentreId]);

  const role = selectedRoleDetails?.role;
  const permissions = useMemo(() => selectedRoleDetails?.permissions || [], [selectedRoleDetails]);

  const selectedKeys = useMemo(
    () => permissions.filter((p) => Number(p.value) === 1).map((p) => p.name),
    [permissions],
  );

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
    if (name.includes("learning") || name.includes("progress")) return { weight: 202, icon: BarChart3 };
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedGroups.map((group) => {
          const meta = getModuleMetadata(group.module);
          return (
            <PermissionCard
              key={group.module}
              group={{ ...group, icon: meta.icon }}
              selectedKeys={selectedKeys}
              readOnly
            />
          );
        })}
      </div>
    </div>
  );
}
