import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import { ROUTE_PERMISSIONS, SUPERADMIN_ONLY_ROUTES } from "@/constants/permissionMap";
import { isParentRouteAllowed } from "@/constants/parentAccess";
import { useAuthStore } from "@/stores/authStore";
import AccessDeniedPage from "@/pages/AccessDeniedPage";

/**
 * ProtectedRoute — wraps a page component and checks permissions
 * before rendering.
 *
 * Usage in App.jsx:
 *   <Route path="/snapshots" element={<ProtectedRoute path="/snapshots"><SnapshotsPage /></ProtectedRoute>} />
 *
 * @param {string} path — The route path to check permissions against
 * @param {React.ReactNode} children — The page component to render
 */
export default function ProtectedRoute({ path, children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const permissionsLoading = useAuthStore((s) => s.permissionsLoading);
  const userPermissions = useAuthStore((s) => s.userPermissions);
  const { canAny, isSuperadmin, isParent } = usePermissions();
  const { pathname } = useLocation();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for permissions to load after refresh before denying access
  if (!isSuperadmin && !isParent && permissionsLoading && !userPermissions) {
    return null;
  }

  if (isParent) {
    if (isParentRouteAllowed(pathname)) {
      return children;
    }
    return <AccessDeniedPage />;
  }

  // If route is superadmin-only, check userType
  if (SUPERADMIN_ONLY_ROUTES.includes(path)) {
    if (!isSuperadmin) {
      return <AccessDeniedPage />;
    }
    return children;
  }

  // If route has defined permissions, check them
  const requiredPermissions = ROUTE_PERMISSIONS[path];
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!canAny(requiredPermissions)) {
      return <AccessDeniedPage />;
    }
  }

  // No restrictions or user has permission — render the page
  return children;
}
