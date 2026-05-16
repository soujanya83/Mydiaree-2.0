import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Recycle,
  Filter,
  Sparkles,
  X,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar,
  Users,
  User,
  DoorOpen,
  CalendarDays,
  Search,
  Inbox,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { ProgramPlanForm } from "@/components/programplan/ProgramPlanForm";
import { ProgramPlanView } from "@/components/programplan/ProgramPlanView";
import { MONTHS, YEARS } from "@/components/programplan/data";
import { programPlanService } from "@/services/learning/programPlanService";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48];
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

/* ---------- helpers (unchanged logic) ---------- */
const stripHtml = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const toIdList = (value) =>
  String(value || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

const toMonthName = (month) => MONTHS[Number(month) - 1] || String(month || "—");

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
    .map((p) => p.replace(/\*/g, "").trim())
    .filter(Boolean);
  if (!parts.length) return [];
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
  eylf: Array.from(String(plan.eylf || "").matchAll(/\b\d\.\d\b/g)).map((m) => m[0]),
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

/* ---------- tiny UI helpers ---------- */
const initials = (name = "") =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const AVATAR_COLORS = [
  "bg-gradient-to-br from-indigo-400 to-purple-500",
  "bg-gradient-to-br from-pink-400 to-rose-500",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
  "bg-gradient-to-br from-sky-400 to-blue-500",
  "bg-gradient-to-br from-fuchsia-400 to-pink-500",
];
const colorFor = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
};

function AvatarGroup({ items = [], label }) {
  const visible = items.slice(0, 3);
  const extra = items.length - visible.length;
  if (!items.length) {
    return <span className="text-xs text-muted-foreground italic">No {label.toLowerCase()}</span>;
  }
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center -space-x-2">
        {visible.map((name, i) => (
          <Tooltip key={`${name}-${i}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "h-7 w-7 rounded-full ring-2 ring-background flex items-center justify-center text-[10px] font-semibold text-white shadow-sm transition-transform hover:scale-110 hover:z-10",
                  colorFor(String(name)),
                )}
              >
                {initials(String(name))}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{String(name)}</TooltipContent>
          </Tooltip>
        ))}
        {extra > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted text-[10px] font-semibold text-foreground/70 flex items-center justify-center shadow-sm">
                +{extra}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{items.slice(3).map(String).join(", ")}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

function StatusPill({ status, label }) {
  const isPublished = status === "published";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        "ring-1 ring-inset shadow-sm",
        isPublished
          ? "bg-gradient-to-r from-indigo-500/15 to-blue-500/15 text-indigo-700 dark:text-indigo-300 ring-indigo-500/30"
          : "bg-gradient-to-r from-amber-400/20 to-orange-400/20 text-amber-700 dark:text-amber-300 ring-amber-500/30",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isPublished
            ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.8)]"
            : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
        )}
      />
      {label || status}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm overflow-hidden">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between">
          <div className="h-6 w-32 rounded bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-7 w-16 rounded-full bg-muted" />
          <div className="h-7 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

function MetaRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-medium text-muted-foreground w-24">{label}</span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">{children}</span>
    </div>
  );
}

/* ---------- main page ---------- */
export default function ProgramPlanPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const user = useAuthStore((s) => s.user);
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.programPlan;

  const [records, setRecords] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [filters, setFilters] = useState({ roomId: "all", createdBy: "all", status: "all" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

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

  const roomNames = useMemo(
    () =>
      Array.from(
        new Set([...rooms.map((r) => r.name), ...records.map((r) => r.roomName)].filter(Boolean)),
      ),
    [records, rooms],
  );
  const creators = useMemo(
    () => Array.from(new Set(records.map((r) => r.createdBy).filter(Boolean))),
    [records],
  );

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
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const goCreate = (centreId, opts = {}) => {
    const params = new URLSearchParams();
    params.set("action", "create");
    params.set("centerid", centreId);
    if (opts.month) params.set("month", opts.month);
    if (opts.year) params.set("year", String(opts.year));
    setSearchParams(params);
  };
  const goEdit = (id) => setSearchParams(new URLSearchParams({ action: "edit", id }));
  const goList = () => setSearchParams({});

  const handleCreate = async (data) => {
    setIsSavingPlan(true);
    try {
      const r = await programPlanService.saveProgramPlan(data);
      if (r.status) {
        toast.success(r.message || "Program plan created.");
        goList();
        loadProgramPlans();
      } else toast.error(r.message || "Failed to create program plan.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to create program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const handleUpdate = async (data) => {
    setIsSavingPlan(true);
    try {
      const r = await programPlanService.saveProgramPlan({ ...data, planId: editId });
      if (r.status) {
        toast.success(r.message || "Program plan updated.");
        goList();
        loadProgramPlans();
      } else toast.error(r.message || "Failed to update program plan.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to update program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const handleSaveAsNew = async (data) => {
    setIsSavingPlan(true);
    try {
      const r = await programPlanService.saveProgramPlan(data);
      if (r.status) {
        toast.success(r.message || "Program plan duplicated.");
        goList();
        loadProgramPlans();
      } else toast.error(r.message || "Failed to duplicate program plan.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to duplicate program plan.");
    } finally {
      setIsSavingPlan(false);
    }
  };
  const handleDelete = async () => {
    if (!confirmId) return;
    setIsDeletingPlan(true);
    try {
      const r = await programPlanService.deleteProgramPlan(confirmId);
      if (r.success) {
        toast.success(r.message || "Program plan deleted successfully.");
        setRecords((p) => p.filter((x) => x.id !== confirmId));
        setConfirmId(null);
      } else toast.error(r.message || "Failed to delete program plan.");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete program plan.");
    } finally {
      setIsDeletingPlan(false);
    }
  };

  /* Routing modes (unchanged) */
  if (action === "create") {
    const centerId = searchParams.get("centerid") || activeCentreId;
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    return (
      <ProgramPlanForm
        mode="create"
        centerId={centerId}
        defaultMonth={month}
        defaultYear={year}
        onCancel={goList}
        onSubmit={handleCreate}
        isSubmitting={isSavingPlan}
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
        record={record}
        onCancel={goList}
        onSubmit={handleUpdate}
        onSaveAsNew={handleSaveAsNew}
        isSubmitting={isSavingPlan}
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

  const hasActiveFilters =
    filters.roomId !== "all" || filters.createdBy !== "all" || filters.status !== "all";

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <PageHeader
          title={
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Program Plans
            </span>
          }
          subtitle="Plan, organise and publish your monthly program at a glance."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select value={activeCentreId} onValueChange={setActiveCentre}>
                <SelectTrigger className="h-10 w-[180px] rounded-xl border-border/70 bg-background/70 backdrop-blur">
                  <SelectValue placeholder="Centre" />
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
                <SelectTrigger className="h-10 w-[160px] rounded-xl border-border/70 bg-background/70 backdrop-blur">
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
                className="h-10 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
              >
                <Activity className="mr-2 h-4 w-4" />
                Activities
              </Button>

              {user?.userType === "Superadmin" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/program-plan/recycle-bin")}
                  className="h-10 rounded-xl"
                >
                  <Recycle className="mr-2 h-4 w-4" />
                  Recycle Bin
                </Button>
              )}

              {can(perms.add) && (
                <Button
                  onClick={() => setPlanModalOpen(true)}
                  className="group h-10 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                  Add Program Plan
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filters
        </div>

        <Select
          value={filters.roomId}
          onValueChange={(v) => setFilters((p) => ({ ...p, roomId: v }))}
        >
          <SelectTrigger className="h-9 w-[170px] rounded-xl border-border/60 bg-background">
            <DoorOpen className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
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
          <SelectTrigger className="h-9 w-[180px] rounded-xl border-border/60 bg-background">
            <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Created by" />
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
          <SelectTrigger className="h-9 w-[150px] rounded-xl border-border/60 bg-background">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl text-muted-foreground hover:text-foreground"
            onClick={() => setFilters({ roomId: "all", createdBy: "all", status: "all" })}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <span>Rows</span>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="h-9 w-[80px] rounded-xl border-border/60 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-16 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 ring-1 ring-primary/30">
              <Inbox className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Program Plans yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Get started by creating your first plan — pick a month and we'll set you up.
          </p>
          {can(perms.add) && (
            <Button
              onClick={() => setPlanModalOpen(true)}
              className="mt-6 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Program Plan
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {pageStart}–{pageEnd}
              </span>{" "}
              of <span className="font-medium text-foreground">{filtered.length}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Page {safePage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {pageItems.map((r, idx) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur transition-shadow hover:shadow-xl hover:shadow-primary/5"
                >
                  {/* gradient ring on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-primary/30 transition-opacity group-hover:opacity-100" />
                  <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

                  {/* Top */}
                  <div className="relative flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Plan
                      </div>
                      <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                        {r.month} <span className="text-foreground/60 font-semibold">{r.year}</span>
                      </h3>
                    </div>
                    <StatusPill status={r.status} label={r.statusLabel} />
                  </div>

                  {/* Middle */}
                  <div className="relative mt-5 space-y-2.5">
                    <MetaRow icon={DoorOpen} label="Room(s)">
                      {r.roomName}
                    </MetaRow>
                    <MetaRow icon={User} label="Created By">
                      {r.createdBy || "—"}
                    </MetaRow>
                    <MetaRow icon={CalendarDays} label="Published">
                      {fmtDDMMYYYY(r.publishedAt)}
                    </MetaRow>
                  </div>

                  {/* Avatars */}
                  <div className="relative mt-4 flex flex-col gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Users className="h-3 w-3" /> Educators
                      </div>
                      <AvatarGroup items={r.educators} label="Educators" />
                    </div>
                    <div>
                      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Users className="h-3 w-3" /> Children
                      </div>
                      <AvatarGroup items={r.children} label="Children" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
                    <button
                      type="button"
                      onClick={() => setViewId(r.id)}
                      title="View"
                      className={CARD_PRIMARY_ACTION_CLASSES}
                      style={CARD_PRIMARY_ACTION_STYLE}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {can(perms.edit) && (
                      <button
                        type="button"
                        onClick={() => goEdit(r.id)}
                        title="Edit"
                        className={CARD_PRIMARY_ACTION_CLASSES}
                        style={CARD_PRIMARY_ACTION_STYLE}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {can(perms.delete) && (
                      <button
                        type="button"
                        onClick={() => setConfirmId(r.id)}
                        title="Delete"
                        disabled={isDeletingPlan}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50"
                      >
                        {isDeletingPlan && confirmId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4">
              <button
                onClick={() => setPage((c) => Math.max(1, c - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground transition-all hover:bg-muted disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={cn(
                    "h-9 min-w-9 rounded-xl px-3 text-sm font-medium transition-all",
                    n === safePage
                      ? "bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20"
                      : "border border-border/60 bg-card/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {n}
                </button>
              ))}

              <button
                onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/60 text-muted-foreground transition-all hover:bg-muted disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Add Plan modal */}
      <Dialog open={planModalOpen} onOpenChange={setPlanModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">New Program Plan</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Select Month</Label>
              <Select
                value={pending.month}
                onValueChange={(v) => setPending((p) => ({ ...p, month: v }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
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
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Select Year</Label>
              <Select
                value={String(pending.year)}
                onValueChange={(v) => setPending((p) => ({ ...p, year: Number(v) }))}
              >
                <SelectTrigger className="h-10 rounded-xl">
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
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setPlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setPlanModalOpen(false);
                goCreate(activeCentreId, pending);
              }}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
            >
              Continue
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
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The plan will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600"
            >
              {isDeletingPlan ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
