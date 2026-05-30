import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "@/components/common/Pagination";
import {
  ArrowLeft,
  Eye,
  Pencil,
  Search,
  ShieldCheck,
  User,
  MoreVertical,
  Filter,
  Shield,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CentreSelect } from "@/components/common/CentreSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";
import { cn } from "@/lib/utils";
import { personAvatarUrl } from "@/utils/personDisplay";

export default function PermissionsAssignedListPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { assignedUsers, assignedPagination, isFetchingAssigned, fetchAssignedPermissions } =
    usePermissionStore();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (activeCentreId) {
      fetchAssignedPermissions(activeCentreId, {
        page,
        per_page: 10,
        search: debouncedQuery,
      });
    }
  }, [activeCentreId, page, debouncedQuery, fetchAssignedPermissions]);

  const rows = useMemo(() => {
    return assignedUsers || [];
  }, [assignedUsers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assigned Permissions"
        description="Manage and review module access for all staff members"
        breadcrumbs={[{ label: "Permissions", to: "/permissions" }, { label: "Assigned Users" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/permissions")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search staff name..."
                className="w-full sm:w-72 pl-10 h-10 rounded-xl border-muted-foreground/20 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        }
      />

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Filter className="h-5 w-5" />
          </div>
          <CentreSelect
            icon={null}
            triggerClassName="w-full sm:w-64 bg-background border-muted-foreground/20 rounded-xl"
            placeholder="Select Center"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-bold text-foreground">{rows.length}</span> of{" "}
          <span className="font-bold text-foreground">{assignedPagination?.total || 0}</span>{" "}
          assigned users
        </div>
      </div>

      {/* Content Grid/Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-4 font-bold text-foreground">User Details</th>
                <th className="px-6 py-4 font-bold text-foreground">Permission Summary</th>
                <th className="px-6 py-4 font-bold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isFetchingAssigned ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 rounded bg-muted" />
                          <div className="h-3 w-24 rounded bg-muted" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 w-20 rounded-full bg-muted" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="ml-auto h-8 w-20 rounded bg-muted" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                        <Shield className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <h3 className="text-lg font-bold">No assigned users found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or select another center.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const u = item.user;
                  if (!u) return null;

                  const perms = item.permissions || {};
                  const count = Object.keys(perms).filter(
                    (k) => !["id", "userid", "centerid"].includes(k) && Number(perms[k]) === 1,
                  ).length;

                  return (
                    <tr key={u.id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-primary/10 transition-transform group-hover:scale-105">
                            {u.imageUrl ? (
                              <img
                                src={personAvatarUrl(u.imageUrl)}
                                alt={u.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{u.name}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {u.userType || u.role}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent px-3 py-1 font-bold"
                          >
                            {count} Permissions
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
                            onClick={() => navigate(`/permissions/assigned/${u.id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-9 rounded-xl px-4 font-bold shadow-sm"
                            onClick={() => navigate(`/permissions/assigned/${u.id}/edit`)}
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            Manage
                            <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {assignedPagination && assignedPagination.last_page > 1 && (
          <div className="border-t border-border/50 bg-muted/10 px-6 py-4 flex justify-center">
            <Pagination
              currentPage={assignedPagination.current_page}
              totalPages={assignedPagination.last_page}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
