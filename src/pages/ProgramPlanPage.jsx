import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Sparkles,
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { ProgramPlanForm } from "@/components/programplan/ProgramPlanForm";
import { ProgramPlanView } from "@/components/programplan/ProgramPlanView";
import { MONTHS, YEARS } from "@/components/programplan/data";
import { programPlanService } from "@/services/learning/programPlanService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48];

const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toIdList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toMonthName = (month) => {
  const index = Number(month) - 1;
  return MONTHS[index] || String(month || "—");
};

const toIsoDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const parseActivityText = (value) => {
  const text = stripHtml(value);
  if (!text) return [];

  const parts = text
    .split(/(?:\r?\n|•)/)
    .map((part) => part.replace(/\*/g, "").trim())
    .filter(Boolean);

  if (parts.length === 0) return [];
  return [{ activity: parts[0].replace(/-\s*$/, "").trim(), items: parts.slice(1) }];
};

const normalizeProgramPlan = (plan) => ({
  raw: plan,
  id: String(plan.id),
  centreId: String(plan.centerid || ""),
  roomId: String(plan.room?.id || toIdList(plan.room_id)[0] || ""),
  roomName: plan.room?.name || toIdList(plan.room_id).join(", ") || "—",
  roomIds: toIdList(plan.room_id),
  month: toMonthName(plan.months),
  year: Number(plan.years) || plan.years || "",
  educators: toIdList(plan.educators),
  children: toIdList(plan.children),
  focusArea: stripHtml(plan.focus_area),
  practicalLife: parseActivityText(plan.practical_life),
  sensorial: parseActivityText(plan.sensorial),
  math: parseActivityText(plan.math),
  language: parseActivityText(plan.language),
  culture: parseActivityText(plan.culture),
  artCraft: stripHtml(plan.art_craft),
  eylf: Array.from(String(plan.eylf || "").matchAll(/\b\d\.\d\b/g)).map((match) => match[0]),
  outdoor: stripHtml(plan.outdoor_experiences),
  inquiry: stripHtml(plan.inquiry_topic),
  sustainability: stripHtml(plan.sustainability_topic),
  specialEvents: stripHtml(plan.special_events),
  childrenVoices: stripHtml(plan.children_voices),
  familiesInput: stripHtml(plan.families_input),
  groupExperience: stripHtml(plan.group_experience),
  spontaneous: stripHtml(plan.spontaneous_experience),
  mindfulness: stripHtml(plan.mindfulness_experiences),
  whatIsWorking: stripHtml(plan.working),
  whatIsNotWorking: stripHtml(plan.notworking),
  status: String(plan.status || "Draft").toLowerCase(),
  statusLabel: plan.status || "Draft",
  createdBy: plan.creator?.name || "—",
  publishedAt: toIsoDateOnly(plan.updated_at || plan.created_at),
});

function fmtDDMMYYYY(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  if (!y) return iso;
  return `${d}.${m}.${y}`;
}

export default function ProgramPlanPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();

  const [records, setRecords] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [filters, setFilters] = useState({ roomId: "all", createdBy: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Mode driven by query params: ?action=create|edit&id=...
  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  const [confirmId, setConfirmId] = useState(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [pending, setPending] = useState({
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
  });
  const [viewId, setViewId] = useState(null);

  const loadProgramPlans = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoadingPlans(true);
    try {
      const response = await programPlanService.getProgramPlans(activeCentreId);
      if (response.status) {
        const plans = response.data?.programPlans || response.programPlans || [];
        setRecords(plans.map(normalizeProgramPlan));
      } else {
        setRecords([]);
        toast.error(response.message || "Failed to load program plans.");
      }
    } catch (error) {
      console.error("Failed to load program plans:", error);
      setRecords([]);
      toast.error("Failed to load program plans.");
    } finally {
      setIsLoadingPlans(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    loadProgramPlans();
  }, [loadProgramPlans]);

  const roomNames = useMemo(() => {
    return Array.from(
      new Set([...rooms.map((r) => r.name), ...records.map((r) => r.roomName)].filter(Boolean)),
    );
  }, [records, rooms]);

  const creators = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.createdBy).filter(Boolean)));
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (activeCentreId && String(r.centreId) !== String(activeCentreId)) return false;
      if (filters.roomId !== "all" && r.roomName !== filters.roomId) return false;
      if (filters.createdBy !== "all" && r.createdBy !== filters.createdBy) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      return true;
    });
  }, [records, activeCentreId, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const pageEnd = Math.min(safePage * pageSize, filtered.length);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeCentreId, filters, pageSize]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goCreate = (centreId, opts = {}) => {
    const params = new URLSearchParams();
    params.set("action", "create");
    params.set("centerid", centreId);
    if (opts.month) params.set("month", opts.month);
    if (opts.year) params.set("year", String(opts.year));
    setSearchParams(params);
  };

  const goEdit = (id) => {
    const params = new URLSearchParams({ action: "edit", id });
    setSearchParams(params);
  };

  const goList = () => setSearchParams({});

  const handleCreate = async (data) => {
    setIsSavingPlan(true);
    try {
      const response = await programPlanService.saveProgramPlan(data);
      if (response.status) {
        toast.success(response.message || "Program plan created.");
        goList();
        loadProgramPlans();
      } else {
        toast.error(response.message || "Failed to create program plan.");
      }
    } catch (error) {
      console.error("Failed to create program plan:", error);
      toast.error("Failed to create program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleUpdate = async (data) => {
    setIsSavingPlan(true);
    try {
      const response = await programPlanService.saveProgramPlan({ ...data, planId: editId });
      if (response.status) {
        toast.success(response.message || "Program plan updated.");
        goList();
        loadProgramPlans();
      } else {
        toast.error(response.message || "Failed to update program plan.");
      }
    } catch (error) {
      console.error("Failed to update program plan:", error);
      toast.error("Failed to update program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleSaveAsNew = async (data) => {
    setIsSavingPlan(true);
    try {
      const response = await programPlanService.saveProgramPlan(data);
      if (response.status) {
        toast.success(response.message || "Program plan duplicated.");
        goList();
        loadProgramPlans();
      } else {
        toast.error(response.message || "Failed to duplicate program plan.");
      }
    } catch (error) {
      console.error("Failed to duplicate program plan:", error);
      toast.error("Failed to duplicate program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setIsDeletingPlan(true);
    try {
      const response = await programPlanService.deleteProgramPlan(confirmId);
      if (response.success) {
        toast.success(response.message || "Program plan deleted successfully.");
        setRecords((p) => p.filter((r) => r.id !== confirmId));
        setConfirmId(null);
      } else {
        toast.error(response.message || "Failed to delete program plan.");
      }
    } catch (error) {
      console.error("Failed to delete program plan:", error);
      toast.error("Failed to delete program plan.");
    } finally {
      setIsDeletingPlan(false);
    }
  };

  // Routing modes
  if (action === "create") {
    const centerId = searchParams.get("centerid") || activeCentreId;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    return (
      <ProgramPlanForm
        mode="create"
        defaults={{
          centreId: centerId,
          ...(month ? { month } : {}),
          ...(year ? { year: Number(year) } : {}),
        }}
        onCancel={goList}
        onSubmit={handleCreate}
        isSaving={isSavingPlan}
      />
    );
  }
  if (action === "edit") {
    const record = records.find((r) => r.id === editId);
    if (!record) {
      goList();
      return null;
    }
    return (
      <ProgramPlanForm
        mode="edit"
        initial={record}
        onCancel={goList}
        onSubmit={handleUpdate}
        onSaveAsNew={handleSaveAsNew}
        isSaving={isSavingPlan}
      />
    );
  }
  if (viewId) {
    const record = records.find((r) => r.id === viewId);
    if (record) {
      return (
        <ProgramPlanView
          record={record}
          onBack={() => setViewId(null)}
          onEdit={() => {
            setViewId(null);
            goEdit(record.id);
          }}
        />
      );
    }
  }

  // LIST VIEW
  return (
    <div>
      <PageHeader
        title="Program Plan"
        description="Monthly program planning across centres and rooms"
        breadcrumbs={[{ label: "Program Plan" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeRoomId} onValueChange={setActiveRoom}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => navigate("/observation/activity")}
              className="border-primary/40 text-primary hover:bg-primary/10"
            >
              <Activity className="mr-1.5 h-4 w-4" />
              Activities
            </Button>
            <Button onClick={() => setPlanModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Program Plan
            </Button>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Filter className="h-4 w-4" />
        </div>

        <Select
          value={filters.roomId}
          onValueChange={(v) => setFilters((p) => ({ ...p, roomId: v }))}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {roomNames.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.createdBy}
          onValueChange={(v) => setFilters((p) => ({ ...p, createdBy: v }))}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Created By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Creators</SelectItem>
            {creators.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((p) => ({ ...p, status: v }))}
        >
          <SelectTrigger className="h-9 w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        {(filters.roomId !== "all" || filters.createdBy !== "all" || filters.status !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({ roomId: "all", createdBy: "all", status: "all" })}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Rows</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="h-9 w-[84px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Header banner */}
      {/* <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-purple-500 px-5 py-4 text-primary-foreground shadow-md">
        <ClipboardList className="h-5 w-5" />
        <h2 className="text-base font-bold tracking-wide">Program Plans</h2>
      </div> */}

      {isLoadingPlans ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Program Plans</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click "Add Program Plan" to create your first plan.
          </p>
          <Button className="mt-5" onClick={() => setPlanModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add Program Plan
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Showing {pageStart}-{pageEnd} of {filtered.length} program plans
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pageItems.map((r) => (
              <article
                key={r.id}
                className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-50/40 to-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:from-amber-950/10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
                />
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-foreground">
                    {r.month} {r.year}
                  </h3>
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      r.status === "published"
                        ? "bg-rose-500 text-white"
                        : "bg-indigo-500 text-white",
                    )}
                  >
                    {r.statusLabel || r.status}
                  </span>
                </div>

                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Room(s)" value={r.roomName} />
                  <Row label="Created By" value={r.createdBy || "—"} />
                  <Row label="Published on" value={fmtDDMMYYYY(r.publishedAt)} />
                </dl>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-primary hover:bg-primary/10"
                    onClick={() => setViewId(r.id)}
                    aria-label="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-9 w-9 bg-sky-500 hover:bg-sky-600"
                    onClick={() => goEdit(r.id)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-9 w-9"
                    disabled={isDeletingPlan}
                    onClick={() => setConfirmId(r.id)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
              <Button
                variant="outline"
                size="icon"
                disabled={safePage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === safePage ? "default" : "outline"}
                  size="sm"
                  className="h-9 w-9"
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                disabled={safePage === totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Plan modal — pick month/year then route to create */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Program Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-primary">
                Select Month
              </Label>
              <Select
                value={pending.month}
                onValueChange={(v) => setPending((p) => ({ ...p, month: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-primary">Select Year</Label>
              <Select
                value={String(pending.year)}
                onValueChange={(v) => setPending((p) => ({ ...p, year: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanModalOpen(false)}>
              <X className="mr-1.5 h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={() => {
                setPlanModalOpen(false);
                goCreate(activeCentreId, pending);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmId}
        onOpenChange={(o) => {
          if (!o && !isDeletingPlan) setConfirmId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The plan will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingPlan}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeletingPlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingPlan ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}:</span>
      <span className="truncate text-xs text-muted-foreground">{value}</span>
    </div>
  );
}
