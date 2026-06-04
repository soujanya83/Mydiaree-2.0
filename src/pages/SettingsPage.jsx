import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Filter, Building, MapPin, Trash2, Loader2, Eye } from "lucide-react";
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
import { usePermissions } from "@/hooks/usePermissions";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCentreStore } from "@/stores/centreStore";
import { AddCenterModal } from "@/components/centers/AddCenterModal";
import { CenterDetailsModal } from "@/components/centers/CenterDetailsModal";
import { centerService } from "@/services/admin/centerService";
import { toast } from "sonner";

export default function SettingsPage() {
  const { centres, isLoading, fetchCentres } = useCentreStore();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ open: false, centerId: null });
  const { hasFullAccess } = usePermissions();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? centres.filter((c) => c.name.toLowerCase().includes(q)) : centres;
  }, [centres, query]);

  const handleSave = async (data) => {
    try {
      const formData = new FormData();
      if (data.id) formData.append("id", data.id);
      formData.append("centerName", data.name);
      formData.append("adressStreet", data.addressStreet);
      formData.append("addressCity", data.addressCity);
      formData.append("addressState", data.addressState);
      formData.append("addressZip", data.addressZip);
      if (data.adminName) formData.append("admin_name", data.adminName);
      if (data.adminEmail) formData.append("admin_email", data.adminEmail);
      if (data.adminPassword) formData.append("admin_password", data.adminPassword);

      const res = data.id
        ? await centerService.updateCenter(formData)
        : await centerService.createCenter(formData);

      if (res.status) {
        toast.success(res.message || `Center ${data.id ? "updated" : "created"} successfully.`);
        fetchCentres();
        return true;
      } else {
        toast.error(res.message || "Failed to save center.");
        throw res;
      }
    } catch (error) {
      const res = error?.response?.data || error;
      toast.error(res.message || "An error occurred while saving the center.");
      throw res;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await centerService.deleteCenter(deleteModal.id);
      if (res.status) {
        toast.success(res.message || "Center deleted successfully");
        fetchCentres();
        setDeleteModal({ open: false, id: null });
      } else {
        toast.error(res.message || "Failed to delete center");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete center");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Centers Settings
          </span>
        }
        description="Manage all centers across your organization"
        breadcrumbs={[{ label: "Centers Settings" }]}
        actions={
          <Button onClick={() => setModal({ open: true, initial: null })} className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" />
            Add Center
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card/60 text-primary shadow-sm backdrop-blur">
          <Filter className="h-5 w-5" />
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by center name"
            className="h-11 rounded-2xl border-border/60 bg-card/60 pl-10 backdrop-blur shadow-sm focus-visible:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl border border-border/60 bg-card/40 backdrop-blur" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 py-24 text-center backdrop-blur">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <Building className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">No Centers Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try adjusting your search filters." : "You haven't added any centers yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 h-full"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:bg-primary/20" />
              
              <div className="flex items-start gap-4 mb-5 relative">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary shadow-inner ring-1 ring-primary/30">
                  <Building className="h-6 w-6" />
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold leading-tight tracking-tight text-foreground line-clamp-2">
                    {c.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 text-sm mb-6 flex-grow relative">
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{c.addressStreet || "No street address"}</p>
                    <p className="text-xs">
                      {c.addressCity || "City"}, {c.addressState || "State"} {c.addressZip}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-end gap-2 border-t border-border/50 pt-4 relative">
                <button
                  type="button"
                  onClick={() => setDetailsModal({ open: true, centerId: c.id })}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-muted/50 px-4 text-xs font-bold text-foreground transition-colors hover:bg-muted active:scale-95"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  type="button"
                  onClick={() => setModal({ open: true, initial: c })}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-4 text-xs font-bold text-primary transition-colors hover:bg-primary/20 active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                {hasFullAccess && (
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ open: true, id: c.id })}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-destructive/10 px-4 text-xs font-bold text-destructive transition-colors hover:bg-destructive/20 active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCenterModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <CenterDetailsModal
        open={detailsModal.open}
        onOpenChange={(o) => setDetailsModal((m) => ({ ...m, open: o }))}
        centerId={detailsModal.centerId}
      />

      <AlertDialog open={deleteModal.open} onOpenChange={(o) => !isDeleting && setDeleteModal({ open: o, id: o ? deleteModal.id : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Center?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the center and its linked Centeradmin(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
