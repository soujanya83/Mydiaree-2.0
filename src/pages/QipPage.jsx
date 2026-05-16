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
        title="QIP Management"
        description="Monitor and manage Quality Improvement Plans across your child care centres"
        breadcrumbs={[{ label: "QIP" }]}
        actions={
          <div className="flex items-center gap-3">
            {can(perms.add) && (
              <Button
                onClick={openAdd}
                className="h-10 gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Add New QIP
              </Button>
            )}
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-10 min-w-[200px] rounded-xl border-border/60 bg-card/50 backdrop-blur font-medium">
                <Building2 className="h-4 w-4 text-primary" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/60 backdrop-blur">
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="relative group overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-xl backdrop-blur transition-all">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:bg-primary/15" />
        <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl transition-opacity group-hover:bg-emerald-500/10" />

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/50 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            <ToolbarButton icon={Copy} onClick={copyTable}>Copy</ToolbarButton>
            <ToolbarButton icon={FileText} onClick={exportCsv}>CSV Export</ToolbarButton>
            <ToolbarButton icon={Printer} onClick={printTable}>Print</ToolbarButton>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group/search">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-64 pl-10 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/20 transition-all font-medium"
                placeholder="Search QIP by name..."
              />
            </div>
          </div>
        </div>v>

        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30 transition-none">
                <SortHead label="Sr. No." k="id" sort={sortBy} onSort={toggleSort} className="w-24 px-6 h-12 text-[11px] font-bold uppercase tracking-wider opacity-70" />
                <SortHead label="QIP Name" k="name" sort={sortBy} onSort={toggleSort} className="px-6 h-12 text-[11px] font-bold uppercase tracking-wider opacity-70" />
                <SortHead label="Date Created" k="created_at" sort={sortBy} onSort={toggleSort} className="px-6 h-12 text-[11px] font-bold uppercase tracking-wider opacity-70" />
                <TableHead className="px-6 h-12 text-[11px] font-bold uppercase tracking-wider opacity-70 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="relative">
                        <div className="absolute -inset-2 rounded-full bg-primary/20 blur-lg animate-pulse" />
                        <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                      </div>
                      <p className="text-sm font-bold tracking-wide uppercase opacity-70">Fetching QIP data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-5 text-muted-foreground">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div>
                        <p className="text-lg font-bold tracking-tight text-foreground">No QIPs Found</p>
                        <p className="text-sm font-medium mt-1">Start by creating your first quality improvement plan.</p>
                      </div>
                      <Button onClick={openAdd} className="h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold px-6 hover:bg-primary/20 transition-all active:scale-95">
                        <Plus className="h-4 w-4 mr-2" /> Create First QIP
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((row, i) => {
                  const sr = (safePage - 1) * PAGE_SIZE + i + 1;
                  return (
                    <TableRow 
                      key={row.id} 
                      className={cn(
                        "group/row border-b border-border/40 transition-colors hover:bg-primary/5",
                        i % 2 === 1 && "bg-muted/5"
                      )}
                    >
                      <TableCell className="px-6 py-4">
                        <span className="font-mono text-sm font-bold opacity-50 tracking-tighter">#{String(sr).padStart(2, '0')}</span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold group-hover/row:bg-primary group-hover/row:text-white transition-all duration-300">
                            {row.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold tracking-tight text-foreground group-hover/row:text-primary transition-colors">
                            {row.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground group-hover/row:text-foreground transition-colors">
                          <FileText className="h-3.5 w-3.5 opacity-60" />
                          {new Date(row.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all duration-200 translate-x-2 group-hover/row:translate-x-0">
                          {can(perms.edit) && (
                            <button
                              onClick={() => openEdit(row)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white shadow-sm active:scale-90"
                              title="Edit QIP"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {can(perms.delete) && (
                            <button
                              onClick={() => setDeleteId(row.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-500 hover:text-white shadow-sm active:scale-90"
                              title="Delete QIP"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 bg-muted/20 px-6 py-4 text-sm font-semibold">
          <p className="text-muted-foreground uppercase tracking-widest text-[10px]">
            Displaying <span className="text-foreground">{filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}</span> - <span className="text-foreground">{Math.min(safePage * PAGE_SIZE, filtered.length)}</span> of <span className="text-foreground">{filtered.length}</span> QIP Records
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="h-9 rounded-xl border-border/60 bg-background/50 font-bold transition-all hover:bg-background hover:text-primary disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <div className="hidden sm:flex items-center gap-1.5 px-2">
              {totalPages <= 5 ? (
                Array.from({ length: totalPages }).map((_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={i + 1 === safePage ? "default" : "ghost"}
                    className={cn(
                      "h-9 w-9 rounded-xl font-bold transition-all active:scale-90",
                      i + 1 === safePage 
                        ? "bg-gradient-to-tr from-primary to-indigo-600 text-white shadow-md shadow-primary/20" 
                        : "hover:bg-primary/10 hover:text-primary"
                    )}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))
              ) : (
                <span className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Page {safePage} <span className="opacity-40 mx-1">/</span> {totalPages}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="h-9 rounded-xl border-border/60 bg-background/50 font-bold transition-all hover:bg-background hover:text-primary disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
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
        <AlertDialogContent className="rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
              <Trash2 className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-center text-xl font-bold tracking-tight">Delete QIP Report?</AlertDialogTitle>
            <AlertDialogDescription className="text-center font-medium">
              Are you sure you want to delete this Quality Improvement Plan? This action is permanent and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-3 sm:justify-center">
            <AlertDialogCancel className="rounded-xl font-bold h-11 border-border/60 hover:bg-muted transition-all">
              Cancel, Keep it
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="rounded-xl h-11 px-8 bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20 hover:bg-rose-600 hover:shadow-lg transition-all active:scale-95"
            >
              Yes, Delete Plan
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
      variant="outline"
      size="sm"
      onClick={onClick}
      className="h-9 rounded-xl border-border/60 bg-background/50 font-bold transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/30 active:scale-95"
    >
      <Icon className="h-4 w-4 mr-2 opacity-70" /> {children}
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
