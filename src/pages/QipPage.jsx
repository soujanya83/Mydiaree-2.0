import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Plus, Sparkles, Pencil, Trash2, Copy, FileText, Printer,
  Search, ArrowUpDown, ChevronLeft, ChevronRight, Building2, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { useCentreStore } from "@/stores/centreStore";
import { qipService } from "@/services/admin/qipService";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import AddQipModal from "@/components/qip/AddQipModal";

const PAGE_SIZE = 10;

export default function QipPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const [qips, setQips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState({ key: "id", dir: "desc" });
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.qip;

  const fetchQips = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const res = await qipService.getQips(activeCentreId);
      if (res.status) {
        setQips(res.data.qips || []);
      } else {
        toast.error(res.message || "Failed to fetch QIPs");
      }
    } catch (error) {
      toast.error("Error fetching QIPs");
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    fetchQips();
  }, [fetchQips]);

  const filtered = useMemo(() => {
    let rows = [...qips];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      const k = sortBy.key;
      const av = a[k], bv = b[k];
      const cmp = typeof av === "string" ? av.localeCompare(bv) : av - bv;
      return sortBy.dir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [qips, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key) => {
    setSortBy((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
    );
  };

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setModalOpen(true); };

  const handleSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        center_id: activeCentreId,
      };
      let res;
      if (editing) {
        res = await qipService.updateQip(editing.id, payload);
      } else {
        res = await qipService.createQip(payload);
      }

      if (res.status) {
        toast.success(res.message || (editing ? "QIP updated" : "QIP created"));
        fetchQips();
        setModalOpen(false);
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await qipService.deleteQip(deleteId);
      if (res.status) {
        toast.success(res.message || "QIP deleted");
        fetchQips();
      } else {
        toast.error(res.message || "Failed to delete QIP");
      }
    } catch (error) {
      toast.error("Error deleting QIP");
    } finally {
      setDeleteId(null);
    }
  };

  const exportCsv = () => {
    const header = ["Sr. No.", "Name", "Created At"];
    const lines = filtered.map((r, i) => [
      i + 1,
      r.name,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "qip-list.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded");
  };

  const copyTable = async () => {
    const text = filtered
      .map((r, i) => `${i + 1}\t${r.name}\t${new Date(r.created_at).toLocaleDateString()}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const printTable = () => window.print();

  return (
    <div>
      <PageHeader
        title="Qip List"
        description="Quality Improvement Plans across your centres"
        breadcrumbs={[{ label: "QIP" }]}
        actions={
          <>
            {can(perms.add) && (
              <Button
                onClick={openAdd}
                className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Add New
              </Button>
            )}
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 min-w-[180px] rounded-full border-emerald-300 bg-card text-emerald-700">
                <Building2 className="h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <ToolbarButton icon={Copy} onClick={copyTable}>Copy</ToolbarButton>
            <ToolbarButton icon={FileText} onClick={exportCsv}>CSV</ToolbarButton>
            <ToolbarButton icon={Printer} onClick={printTable}>Print</ToolbarButton>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Search:</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-9 w-56 pl-8"
                placeholder="Search…"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <SortHead label="Sr. No." k="id" sort={sortBy} onSort={toggleSort} className="w-24" />
                <SortHead label="Name" k="name" sort={sortBy} onSort={toggleSort} />
                <SortHead label="Created At" k="created_at" sort={sortBy} onSort={toggleSort} />
                <TableHead className="font-semibold text-foreground">Edit</TableHead>
                <TableHead className="font-semibold text-foreground">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                      <p className="text-sm">Loading QIPs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-10 w-10 opacity-40" />
                      <p className="text-sm">No QIPs found.</p>
                      <Button size="sm" variant="outline" onClick={openAdd}>
                        <Plus className="h-4 w-4" /> Add New
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row, i) => {
                  const sr = (safePage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <TableRow key={row.id} className={cn(i % 2 === 1 && "bg-muted/20")}>
                      <TableCell className="font-medium text-muted-foreground">{sr}</TableCell>
                      <TableCell className="font-semibold">{row.name}</TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {can(perms.edit) && (
                          <Button
                            size="sm"
                            onClick={() => openEdit(row)}
                            className="h-8 rounded-md bg-sky-500 text-white hover:bg-sky-600"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {can(perms.delete) && (
                          <Button
                            size="sm"
                            onClick={() => setDeleteId(row.id)}
                            className="h-8 rounded-md bg-destructive text-destructive-foreground hover:opacity-90"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Button>
            {totalPages <= 5 ? (
              Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={i + 1 === safePage ? "default" : "outline"}
                  className={cn("min-w-[34px]", i + 1 === safePage && "bg-sky-500 hover:bg-sky-600")}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              <span className="px-2 text-muted-foreground">Page {safePage} of {totalPages}</span>
            )}
            <Button
              variant="outline" size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <AddQipModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleSubmit}
        initial={editing}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this QIP?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick, children }) {
  return (
    <Button
      variant="default"
      size="sm"
      onClick={onClick}
      className="h-8 rounded-md bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90"
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </Button>
  );
}

function SortHead({ label, k, sort, onSort, className }) {
  const active = sort.key === k;
  return (
    <TableHead className={cn("font-semibold text-foreground", className)}>
      <button
        type="button"
        onClick={() => onSort(k)}
        className="inline-flex items-center gap-1 hover:text-primary"
      >
        {label}
        <ArrowUpDown className={cn("h-3.5 w-3.5", active ? "text-primary" : "text-muted-foreground/60")} />
      </button>
    </TableHead>
  );
}
