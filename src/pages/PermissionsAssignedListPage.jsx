import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, Search } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PERMISSION_USERS,
  initialAssignments,
} from "@/components/permissions/permissionsData";

export default function PermissionsAssignedListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PERMISSION_USERS.filter((u) =>
      q ? u.name.toLowerCase().includes(q) : true
    );
  }, [query]);

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

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold text-foreground">User Name</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground py-10">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u) => {
                const count = initialAssignments[u.id]?.length || 0;
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