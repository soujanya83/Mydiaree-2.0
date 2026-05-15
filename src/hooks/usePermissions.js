import { useAuthStore } from "@/stores/authStore";

/**
 * Central permissions hook.
 *
 * Usage:
 *   const { can, canAny, canAll, isSuperadmin } = usePermissions();
 *   if (can("addSnapshots")) { ... }
 *   if (canAny(["addSnapshots", "editSnapshots"])) { ... }
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const userPermissions = useAuthStore((s) => s.userPermissions);

  const isSuperadmin = user?.userType === "Superadmin";

  /**
   * Check if user has a specific permission.
   * Superadmin always returns true.
   */
  const can = (permissionName) => {
    if (isSuperadmin) return true;
    if (!userPermissions) return false;
    return userPermissions[permissionName] === 1;
  };

  /**
   * Check if user has ANY of the listed permissions.
   * If the array is empty, returns true (no restrictions).
   * Superadmin always returns true.
   */
  const canAny = (permissionNames = []) => {
    if (isSuperadmin) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    if (!userPermissions) return false;
    return permissionNames.some((name) => userPermissions[name] === 1);
  };

  /**
   * Check if user has ALL of the listed permissions.
   * Superadmin always returns true.
   */
  const canAll = (permissionNames = []) => {
    if (isSuperadmin) return true;
    if (!permissionNames || permissionNames.length === 0) return true;
    if (!userPermissions) return false;
    return permissionNames.every((name) => userPermissions[name] === 1);
  };

  return { can, canAny, canAll, isSuperadmin };
}
