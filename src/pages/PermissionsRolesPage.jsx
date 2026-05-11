import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
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
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddRoleModal } from "@/components/permissions/AddRoleModal";
import { usePermissionStore } from "@/stores/permissionStore";
import { useCentreStore } from "@/stores/centreStore";

export default function PermissionsRolesPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { roles, isLoading, isFetchingRoles, fetchRoles, createRole, deleteRole } =
    usePermissionStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (activeCentreId) {
      fetchRoles(activeCentreId);
    }
  }, [activeCentreId, fetchRoles]);

  const filtered = useMemo(
    () => roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search],
  );

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleSave = async (name) => {
    if (!activeCentreId) {
      toast.error("Please select a center first");
      return false;
    }

    try {
      await createRole(activeCentreId, name);
      toast.success("Role added");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to add role");
      return false;
    }
  };

  const handleDelete = async () => {
    try {
      await deleteRole(deleteId, activeCentreId);
      toast.success("Role deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete role");
    }
  };

  return (
    <div>
      <PageHeader
        title="Permissions Role List"
        breadcrumbs={[{ label: "Permissions Assign", to: "/permissions" }, { label: "Role List" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/permissions")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => {
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger className="w-full bg-background sm:w-64">
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
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Role Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 px-4">S.No</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Created on</TableHead>
              <TableHead className="text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  {isFetchingRoles ? "Loading roles..." : "No roles found"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="px-4">{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-blue-600 px-3 text-white hover:bg-blue-700"
                        onClick={() => navigate(`/permissions/roles/${r.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-full px-3"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddRoleModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
        }}
        onSave={handleSave}
        mode="add"
        isSaving={isLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this role?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
