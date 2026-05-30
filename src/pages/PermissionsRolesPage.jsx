import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Eye,
  Trash2,
  Search,
  Shield,
  Briefcase,
  Calendar,
  Filter,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
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
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <PageHeader
        title="Permission Roles"
        description="Define and manage role-based access control templates"
        breadcrumbs={[
          { label: "Permissions", to: "/permissions" },
          { label: "Role Templates" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/permissions")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              className="shadow-md"
              onClick={() => {
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create New Role
            </Button>
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
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            placeholder="Search role templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl border-muted-foreground/20 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      {/* Roles List Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-6 py-4 font-bold text-foreground w-16">#</th>
                <th className="px-6 py-4 font-bold text-foreground">Role Template</th>
                <th className="px-6 py-4 font-bold text-foreground text-center">Creation Date</th>
                <th className="px-6 py-4 font-bold text-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isFetchingRoles ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-4 rounded bg-muted" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-muted" />
                        <div className="h-4 w-32 rounded bg-muted" />
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="mx-auto h-4 w-24 rounded bg-muted" /></td>
                    <td className="px-6 py-4"><div className="ml-auto h-8 w-24 rounded bg-muted" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground/30">
                        <Briefcase className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">No roles defined yet</h3>
                      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        Roles allow you to quickly assign a preset group of permissions to staff members.
                      </p>
                      <Button variant="outline" className="mt-4" onClick={() => setModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Role
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id} className="group transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 text-muted-foreground/60 font-medium">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-105 border border-indigo-100 shadow-sm">
                          <Shield className="h-5 w-5" />
                        </div>
                        <span className="font-bold text-foreground text-base tracking-tight">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground border">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(r.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
                          onClick={() => navigate(`/permissions/roles/${r.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => setDeleteId(r.id)}
                          title="Delete Role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="h-4 w-px bg-muted mx-1" />
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-9 rounded-xl px-4 font-bold shadow-sm"
                          onClick={() => navigate(`/permissions/roles/${r.id}`)}
                        >
                          Manage
                          <ChevronRight className="ml-1 h-3.5 w-3.5 opacity-50" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddRoleModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        mode="add"
        isSaving={isLoading}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete Role Template?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this role? This action cannot be undone and will remove the template for future assignments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-muted-foreground/20">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isLoading}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
