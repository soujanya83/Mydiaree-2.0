import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Filter, Building } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCentreStore } from "@/stores/centreStore";
import { AddCenterModal } from "@/components/centers/AddCenterModal";
import { centerService } from "@/services/centerService";
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
import { toast } from "sonner";

export default function SettingsPage() {
  const { centres, isLoading, fetchCentres } = useCentreStore();
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

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

      const res = data.id
        ? await centerService.updateCenter(formData)
        : await centerService.createCenter(formData);

      if (res.status) {
        toast.success(res.message || `Center ${data.id ? "updated" : "created"} successfully.`);
        fetchCentres();
      } else {
        toast.error(res.message || "Failed to save center.");
      }
    } catch (error) {
      toast.error("An error occurred while saving the center.");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      const res = await centerService.deleteCenter(confirm.id);
      if (res.status) {
        toast.success(res.message || "Center deleted successfully.");
        fetchCentres();
      } else {
        toast.error(res.message || "Failed to delete center.");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the center.");
      console.error(error);
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centers Settings"
        description="Manage all centers across your organization"
        breadcrumbs={[{ label: "Centers Settings" }]}
        actions={
          <Button onClick={() => setModal({ open: true, initial: null })} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Center
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-card text-primary">
          <Filter className="h-4 w-4" />
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by center name"
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl border bg-card/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Building className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No centers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className="absolute inset-0 -z-10 opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
                }}
              />
              <h3 className="text-base font-bold text-foreground">{c.name}</h3>
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="font-semibold">Street: </span>
                  <span className="text-muted-foreground">{c.addressStreet || "—"}</span>
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">City: </span>
                  <span className="text-muted-foreground">{c.addressCity || "—"}</span>
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">State: </span>
                  <span className="text-muted-foreground">{c.addressState || "—"}</span>
                </p>
                <p className="text-foreground">
                  <span className="font-semibold">Zip: </span>
                  <span className="text-muted-foreground">{c.addressZip || "—"}</span>
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModal({ open: true, initial: c })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({ open: true, id: c.id })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
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

      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this center?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The center will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
