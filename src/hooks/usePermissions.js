import { useAuthStore } from "@/stores/authStore";
import { isParentUser } from "@/constants/parentAccess";

/**
 * Central permissions hook.
 *
 * Usage:
 *   const { can, canAny, canAll, isSuperadmin, isParent } = usePermissions();
 *   if (can("addSnapshots")) { ... }
 *   if (canAny(["addSnapshots", "editSnapshots"])) { ... }
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const userPermissions = useAuthStore((s) => s.userPermissions);

  const isSuperadmin = user?.userType === "Superadmin";
  const isCenteradmin = user?.userType === "Centeradmin";
  const isStaff = String(user?.userType || "").toLowerCase() === "staff";
  const hasFullAccess = isSuperadmin || isCenteradmin;
  const isParent = isParentUser(user);

  /**
   * Check if user has a specific permission.
   * Superadmin / Centeradmin always return true. Parents never have write permissions.
   */
  const can = (permissionName) => {
    if (isParent) return false;
    if (hasFullAccess) return true;
    if (!userPermissions) return false;
    return userPermissions[permissionName] === 1;
  };

  /**
   * Check if user has ANY of the listed permissions.
   * If the array is empty, returns true (no restrictions).
   * Superadmin always returns true.
   */
  const canAny = (permissionNames = []) => {
    if (isParent) return true;
    if (hasFullAccess) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    if (!userPermissions) return false;
    return permissionNames.some((name) => userPermissions[name] === 1);
  };

  /**
   * Check if user has ALL of the listed permissions.
   * Superadmin always returns true.
   */
  const canAll = (permissionNames = []) => {
    if (hasFullAccess) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    if (!userPermissions) return false;
    return permissionNames.every((name) => userPermissions[name] === 1);
  };

  return { can, canAny, canAll, isSuperadmin, isCenteradmin, hasFullAccess, isParent, isStaff };
}
