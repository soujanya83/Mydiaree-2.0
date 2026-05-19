import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Eye, Pencil, Wifi, Shield, ShieldCheck, ShieldAlert, Globe, MapPin, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/PageLoader";
import { Badge } from "@/components/ui/badge";
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

  const stats = useMemo(() => {
    const total = ips.length;
    const active = ips.filter((x) => x.status === "active").length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [ips]);

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

      toast.success(res.message || (data.id ? "IP configuration updated" : "New IP successfully allowed"));
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error, data.id ? "Failed to update IP" : "Failed to add IP"));
      throw error;
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
      toast.success(res.message || "Allowed network IP removed");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete IP configuration"));
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
        toast.success(res.message || `IP network access marked ${updated.status}`);
      } else {
        await fetchIps();
        toast.success(res.message || "IP status updated");
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update IP network status"));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="IP Management"
        description="Configure allowed static networks, office hotspots, and system connection restrictions"
        breadcrumbs={[{ label: "Setting" }, { label: "IP Restrictions" }]}
        actions={
          <Button
            onClick={openAdd}
            disabled={loading}
            className="rounded-xl bg-primary px-5 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            <Plus className="mr-1.5 h-4.5 w-4.5" />
            Add Allowed IP
          </Button>
        }
      />

      {/* Info Block / Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/0 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
              Network Access Control
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Secure Allowed <span className="text-primary font-black">Gateways</span>
            </h2>
            <p className="max-w-2xl text-sm font-medium text-muted-foreground leading-relaxed">
              Restrict access to authorised locations and IP subnets. Active configurations define which external public networks are whitelisted for your operators.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <ShieldCheck className="h-8 w-8 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Statistics Block */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Allowed IPs</span>
            <div className="rounded-xl bg-muted p-2 text-muted-foreground">
              <Globe className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-foreground">{stats.total}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">networks</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/10 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Active Whitelist</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-600">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-emerald-600">{stats.active}</span>
            <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">enabled</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-amber-500/10 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Suspended / Inactive</span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-600">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-600">{stats.inactive}</span>
            <span className="text-[10px] font-bold text-amber-600/70 uppercase tracking-widest">disabled</span>
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/20">
                <TableHead className="w-16 px-6 py-4 font-bold text-foreground text-center">#</TableHead>
                <TableHead className="px-6 py-4 font-bold text-foreground">Allowed Connection / IP</TableHead>
                <TableHead className="px-6 py-4 font-bold text-foreground">IP Name / Label</TableHead>
                <TableHead className="px-6 py-4 font-bold text-foreground">Location</TableHead>
                <TableHead className="px-6 py-4 font-bold text-foreground">Status</TableHead>
                <TableHead className="px-6 py-4 font-bold text-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/60">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-24">
                    <PageLoader label="Fetching allowed network addresses..." size="sm" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground/30 border border-dashed">
                        <Wifi className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-bold text-foreground">No Allowed Network IPs</h3>
                      <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
                        Currently, there are no IP restrictions configured. System users can connect from any network address.
                      </p>
                      <Button onClick={openAdd} variant="outline" className="mt-5 rounded-xl text-xs font-bold border-border">
                        <Plus className="mr-1 h-4 w-4" /> Allow First IP
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={row.id} className="group transition-colors hover:bg-muted/10">
                    <TableCell className="px-6 py-4 text-center font-bold text-muted-foreground/60 text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Globe className="h-4.5 w-4.5" />
                        </div>
                        <span className="font-mono text-sm font-semibold tracking-tight text-foreground">
                          {row.ip}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-bold text-foreground/80">
                      {row.name}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {row.location ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                          <MapPin className="h-3.5 w-3.5 opacity-60 text-primary" />
                          <span>{row.location}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/40 italic font-semibold">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => toggleStatus(row)}
                        disabled={togglingId === row.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border",
                          "disabled:pointer-events-none disabled:opacity-60",
                          row.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200"
                        )}
                        title={row.status === "active" ? "Mark Inactive" : "Mark Active"}
                      >
                        {togglingId === row.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : row.status === "active" ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : (
                          <ShieldAlert className="h-3.5 w-3.5" />
                        )}
                        {row.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-primary transition-all duration-200 hover:bg-primary/10 hover:text-primary active:scale-95 disabled:opacity-40"
                          onClick={() => openEdit(row)}
                          disabled={togglingId === row.id}
                          title="Edit Allowed IP"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/10 bg-card text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-40"
                          onClick={() => setDeleteId(row.id)}
                          disabled={togglingId === row.id}
                          title="Remove Restriction"
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
      </div>

      <AddIpModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSave={handleSave}
        saving={saving}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl max-w-md animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-extrabold text-foreground">
              Delete Allowed IP Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium text-muted-foreground leading-relaxed px-2">
              This action will immediately remove this IP address from the allowed gateways whitelist. Operators connecting from this address may lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full rounded-xl font-bold h-11 border-border bg-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-xl bg-red-500 text-white font-bold h-11 hover:bg-red-600 shadow-lg shadow-red-500/10"
            >
              {deleting ? "Removing..." : "Remove Gateway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
