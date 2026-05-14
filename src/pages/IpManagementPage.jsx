import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
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
import { cn } from "@/lib/utils";
import { AddIpModal } from "@/components/ipmanagement/AddIpModal";
import { ipManagementService } from "@/services/admin/ipManagementService";

const normalizeStatus = (status) => {
  if (status === 1 || status === "1" || String(status).toLowerCase() === "active") {
    return "active";
  }
  return "inactive";
};

const normalizeIp = (ip) => ({
  id: ip.id,
  ip: ip.wifi_ip || "",
  name: ip.wifi_name || "",
  location: ip.wifi_address || "",
  status: normalizeStatus(ip.status),
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

export default function IpManagementPage() {
  const [ips, setIps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const rows = useMemo(() => ips, [ips]);

  const fetchIps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ipManagementService.getIps();
      setIps(Array.isArray(res.data) ? res.data.map(normalizeIp) : []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load IP list"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIps();
  }, [fetchIps]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const res = data.id
        ? await ipManagementService.updateIp(data.id, data)
        : await ipManagementService.createIp(data);

      if (res.data) {
        const saved = normalizeIp(res.data);
        setIps((arr) =>
          data.id ? arr.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...arr],
        );
      } else {
        await fetchIps();
      }

      toast.success(res.message || (data.id ? "IP updated" : "IP added"));
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, data.id ? "Failed to update IP" : "Failed to add IP"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await ipManagementService.deleteIp(deleteId);
      setIps((arr) => arr.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      toast.success(res.message || "IP deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete IP"));
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (row) => {
    setTogglingId(row.id);
    try {
      const res = await ipManagementService.toggleIpStatus(row.id);
      if (res.data) {
        const updated = normalizeIp(res.data);
        setIps((arr) => arr.map((x) => (x.id === updated.id ? updated : x)));
        toast.success(res.message || `IP marked ${updated.status}`);
      } else {
        await fetchIps();
        toast.success(res.message || "IP status updated");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update IP status"));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="IP Management"
        description="Allowed networks and restrictions"
        breadcrumbs={[{ label: "Setting" }, { label: "IP List" }]}
        actions={
          <Button onClick={openAdd} variant="outline" disabled={loading}>
            <Plus className="h-4 w-4" />
            Add New IP
          </Button>
        }
      />

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 font-semibold text-foreground">#</TableHead>
              <TableHead className="font-semibold text-foreground">IP</TableHead>
              <TableHead className="font-semibold text-foreground">IP Name</TableHead>
              <TableHead className="font-semibold text-foreground">IP Location</TableHead>
              <TableHead className="font-semibold text-foreground">IP Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Loader className="py-10" label="Loading IPs..." />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No IPs added yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{row.ip}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.location || "--"}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleStatus(row)}
                      disabled={togglingId === row.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                        "disabled:pointer-events-none disabled:opacity-60",
                        row.status === "active"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      <Eye className="h-3 w-3" />
                      {row.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        className={CARD_PRIMARY_ACTION_CLASSES}
                        style={CARD_PRIMARY_ACTION_STYLE}
                        onClick={() => openEdit(row)}
                        disabled={togglingId === row.id}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30"
                        onClick={() => setDeleteId(row.id)}
                        disabled={togglingId === row.id}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddIpModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this IP?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The IP will be removed from the allowed list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
