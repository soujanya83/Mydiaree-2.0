import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * GuestRoute — wraps a page component that should only be accessible to unauthenticated users.
 * If the user is authenticated, they are redirected to the dashboard.
 *
 * Usage in App.jsx:
 *   <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
 */
export default function GuestRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
