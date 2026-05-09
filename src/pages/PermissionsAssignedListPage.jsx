import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";

export default function PermissionsAssignedListPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { assignedUsers, isFetchingAssigned, fetchAssignedPermissions } = usePermissionStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (activeCentreId) {
      fetchAssignedPermissions(activeCentreId);
    }
  }, [activeCentreId, fetchAssignedPermissions]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (assignedUsers || []).filter((item) =>
      q ? item.user?.name?.toLowerCase().includes(q) : true
    );
  }, [query, assignedUsers]);

  return (
    <div>
      <PageHeader
        title="Permissions Assigned List"
        description="All users with assigned permissions"
        breadcrumbs={[
          { label: "Permissions Assign", to: "/permissions" },
          { label: "Assigned List" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/permissions")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search User Name..."
                className="w-64 pl-8"
              />
            </div>
          </>
        }
      />

      {/* Filter Row */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={activeCentreId} onValueChange={setActiveCentre}>
          <SelectTrigger className="w-full sm:w-64 bg-background">
            <SelectValue placeholder="Select Center" />
          </SelectTrigger>
          <SelectContent>
            {centres.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-foreground">User Name</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetchingAssigned ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-10">
                  Loading assigned users...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-10">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item) => {
                const u = item.user;
                if (!u) return null;
                // calculate count by counting keys with value 1 (excluding id, userid, centerid)
                const perms = item.permissions || {};
                const count = Object.keys(perms).filter(
                  (k) => !["id", "userid", "centerid"].includes(k) && perms[k] === 1
                ).length;

                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {count} permissions assigned
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/permissions/assigned/${u.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => navigate(`/permissions/assigned/${u.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}