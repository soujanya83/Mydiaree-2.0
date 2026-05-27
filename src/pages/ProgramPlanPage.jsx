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
  Loader2,
  Calendar,
  Users,
  User,
  DoorOpen,
  CalendarDays,
  Inbox,
  Printer,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
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

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { ProgramPlanForm } from "@/components/programplan/ProgramPlanForm";
import { ProgramPlanView } from "@/components/programplan/ProgramPlanView";
import { MONTHS, YEARS } from "@/components/programplan/data";
import { programPlanService } from "@/services/learning/programPlanService";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Pagination } from "@/components/common/Pagination";

const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

/* ---------- helpers (unchanged logic) ---------- */
const toBlankString = (value) => (value === null || value === undefined ? "" : String(value));

const stripHtml = (value) =>
  toBlankString(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const toIdList = (value) =>
  String(value || "")
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

const toNameList = (value) =>
  toBlankString(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toMonthName = (month, fallback = "—") =>
  MONTHS[Number(month) - 1] || toBlankString(month) || fallback;

const toIsoDateOnly = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const parseActivityText = (value) => {
  const text = stripHtml(value);
  if (!text) return [];

  const groups = [];
  let current = null;

  const commit = () => {
    if (!current) return;
    if (current.activity || current.items.length) groups.push(current);
    current = null;
  };

  text
    .split(/\r?\n/)
    .flatMap((line) => line.split(/(?=•)/))
    .map((part) => part.replace(/\*/g, "").trim())
    .filter(Boolean)
    .forEach((part) => {
      if (part.startsWith("•")) {
        const item = part.replace(/^•\s*/, "").trim();
        if (!item) return;
        if (!current) current = { activity: "Activities", items: [] };
        current.items.push(item);
        return;
      }

      const headerMatch = part.match(/^(.+?)\s*-\s*(.*)$/);
      if (headerMatch) {
        commit();
        current = { activity: headerMatch[1].trim(), items: [] };
        const inlineItem = headerMatch[2].trim();
        if (inlineItem) current.items.push(inlineItem.replace(/^•\s*/, ""));
        return;
      }

      if (!current) {
        current = { activity: part, items: [] };
        return;
      }

      current.items.push(part.replace(/^•\s*/, ""));
    });

  commit();
  return groups;
};

const normalizeProgramPlan = (plan) => {
  // Support both old (full detail) and new (list) response formats
  const isFullDetail =
    plan.focus_area !== undefined ||
    plan.practical_life !== undefined ||
    plan.children !== undefined ||
    plan.educators !== undefined;
  const isListFormat = !isFullDetail && plan.month_name !== undefined;

  if (isListFormat) {
    return {
      raw: plan,
      id: String(plan.id),
      centreId: "",
      roomId: "",
      roomName: plan.room_name || "—",
      roomIds: [],
      month: plan.month_name || toMonthName(plan.month),
      year: Number(plan.years) || plan.years || "",
      educators: [],
      children: [],
      educatorNames: toNameList(plan.educator_names),
      childrenNames: toNameList(plan.children_names),
      focusArea: "",
      practicalLife: [],
      sensorial: [],
      math: [],
      language: [],
      culture: [],
      artCraft: "",
      eylf: [],
      outdoor: "",
      inquiry: "",
      sustainability: "",
      specialEvents: "",
      childrenVoices: "",
      familiesInput: "",
      groupExperience: "",
      spontaneous: "",
      mindfulness: "",
      whatIsWorking: "",
      whatIsNotWorking: "",
      status: String(plan.status || "Draft").toLowerCase(),
      statusLabel: plan.status || "Draft",
      createdBy: plan.creator_name || "—",
      publishedAt: plan.created_at_formatted || "—",
      updatedAt: plan.updated_at_formatted || "—",
      canEdit: plan.can_edit === 1,
      canDelete: plan.can_delete === 1,
    };
  }

  // Old full-detail format (for edit/view)
  return {
    raw: plan,
    id: String(plan.id),
    centreId: String(plan.centerid || ""),
    roomId: String(plan.room?.id || toIdList(plan.room_id)[0] || ""),
    roomName: plan.room?.name || toIdList(plan.room_id).join(", ") || "—",
    roomIds: toIdList(plan.room_id),
    month: toMonthName(plan.months, ""),
    year: Number(plan.years) || plan.years || "",
    educators: toIdList(plan.educators),
    children: toIdList(plan.children),
    educatorNames: toNameList(plan.educator_names),
    childrenNames: toNameList(plan.children_names),
    focusArea: stripHtml(plan.focus_area),
    practicalLife: parseActivityText(plan.practical_life),
    sensorial: parseActivityText(plan.sensorial),
    math: parseActivityText(plan.math),
    language: parseActivityText(plan.language),
    culture: parseActivityText(plan.culture),
    artCraft: stripHtml(plan.art_craft),
    eylf: String(plan.eylf || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
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
  };
};

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
  const { can, isParent, isSuperadmin } = usePermissions();
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const perms = ACTION_PERMISSIONS.programPlan;

  const [records, setRecords] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);
  const [isPrintingId, setIsPrintingId] = useState(null);
  const [filters, setFilters] = useState({
    room: "",
    createdBy: "",
    status: "",
    month: "",
    year: "",
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: null,
    to: null,
    per_page: 10,
  });

  const action = searchParams.get("action");
  const editId = searchParams.get("id");

  const [confirmId, setConfirmId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [isLoadingViewRecord, setIsLoadingViewRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isLoadingEditRecord, setIsLoadingEditRecord] = useState(false);

  const loadProgramPlans = useCallback(async () => {
    if (!activeCentreId) return;
    if (isParent && !selectedChildId) {
      setRecords([]);
      return;
    }
    setIsLoadingPlans(true);
    try {
      const response = await programPlanService.filterProgramPlans({
        center_id: activeCentreId,
        room: filters.room || "",
        created_by: filters.createdBy || "",
        status: filters.status || "",
        month: filters.month || "",
        year: filters.year || "",
        child_id: isParent ? selectedChildId : "",
        page,
      });
      if (response.status) {
        const programPlansData = response.data?.programPlans;
        const plans = programPlansData?.data || [];
        setRecords(plans.map(normalizeProgramPlan));
        setPagination(
          response.data?.pagination || {
            current_page: programPlansData?.current_page || 1,
            last_page: programPlansData?.last_page || 1,
            total: programPlansData?.total || 0,
            from: programPlansData?.from,
            to: programPlansData?.to,
            per_page: programPlansData?.per_page || 10,
          },
        );
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
  }, [activeCentreId, page, filters, isParent, selectedChildId]);

  useEffect(() => {
    loadProgramPlans();
  }, [loadProgramPlans]);

  const goList = useCallback(() => setSearchParams({}), [setSearchParams]);

  useEffect(() => {
    if (action === "edit" && editId) {
      const fetchDetails = async () => {
        setIsLoadingEditRecord(true);
        try {
          const response = await programPlanService.getProgramPlanDetails(editId);
          if (response.status && response.data) {
            setEditingRecord(normalizeProgramPlan(response.data));
          } else {
            toast.error(response.message || "Failed to load program plan details.");
            goList();
          }
        } catch (error) {
          console.error("Failed to load program plan details:", error);
          toast.error("Failed to load program plan details.");
          goList();
        } finally {
          setIsLoadingEditRecord(false);
        }
      };
      fetchDetails();
    } else {
      setEditingRecord(null);
    }
  }, [action, editId, goList]);

  useEffect(() => {
    if (!viewId) {
      setViewingRecord(null);
      return;
    }

    const fetchDetails = async () => {
      setIsLoadingViewRecord(true);
      try {
        const response = await programPlanService.getProgramPlanDetails(viewId);
        if (response.status && response.data) {
          setViewingRecord(normalizeProgramPlan(response.data));
        } else {
          toast.error(response.message || "Failed to load program plan details.");
          setViewId(null);
        }
      } catch (error) {
        console.error("Failed to load program plan details:", error);
        toast.error("Failed to load program plan details.");
        setViewId(null);
      } finally {
        setIsLoadingViewRecord(false);
      }
    };

    fetchDetails();
  }, [viewId]);

  const handleFilterChange = (key, value) => {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const roomNames = useMemo(() => rooms.map((r) => r.name).filter(Boolean), [rooms]);

  const totalPages = pagination.last_page || 1;
  const safePage = pagination.current_page || 1;
  const pageStart = pagination.from || 0;
  const pageEnd = pagination.to || 0;
  const totalRecords = pagination.total || 0;
  const pageItems = records;

  const goCreate = (centreId, opts = {}) => {
    const params = new URLSearchParams();
    params.set("action", "create");
    params.set("centerid", centreId);
    if (opts.month) params.set("month", opts.month);
    if (opts.year) params.set("year", String(opts.year));
    setSearchParams(params);
  };
  const goEdit = (id) => setSearchParams(new URLSearchParams({ action: "edit", id }));

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

  const handlePrint = async (id) => {
    setIsPrintingId(id);
    try {
      const blob = await programPlanService.printProgramPlan(id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print program plan.");
    } finally {
      setIsPrintingId(null);
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
    if (isLoadingEditRecord || !editingRecord) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <ProgramPlanForm
        mode="edit"
        record={editingRecord}
        onCancel={goList}
        onSubmit={handleUpdate}
        onSaveAsNew={handleSaveAsNew}
        isSubmitting={isSavingPlan}
      />
    );
  }
  if (viewId) {
    if (isLoadingViewRecord || !viewingRecord) {
      return (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    return (
      <ProgramPlanView
        record={viewingRecord}
        onBack={() => setViewId(null)}
        onEdit={() => {
          setViewId(null);
          goEdit(viewingRecord.id);
        }}
      />
    );
  }

  const hasActiveFilters =
    filters.room || filters.createdBy || filters.status || filters.month || filters.year;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/5 via-background to-background p-6 shadow-sm">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <PageHeader
          className="relative z-10"
          title={
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Program Plans
            </span>
          }
          subtitle="Plan, organise and publish your monthly program at a glance."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {!isParent && (
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
              )}

              {!isParent && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/observation/activity")}
                  className="h-10 rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Activities
                </Button>
              )}

              {isSuperadmin && (
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
                  onClick={() => goCreate(activeCentreId)}
                  className="group h-10 rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Sparkles className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
                  Create Program Plan
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Toolbar */}
      {!isParent && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <Select
            value={filters.room || "all"}
            onValueChange={(v) => handleFilterChange("room", v === "all" ? "" : v)}
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
            value={filters.status || "all"}
            onValueChange={(v) => handleFilterChange("status", v === "all" ? "" : v)}
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

          <Select
            value={filters.month || "all"}
            onValueChange={(v) => handleFilterChange("month", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[150px] rounded-xl border-border/60 bg-background">
              <Calendar className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m} value={m.toLowerCase()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.year || "all"}
            onValueChange={(v) => handleFilterChange("year", v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-[120px] rounded-xl border-border/60 bg-background">
              <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFilters({ room: "", createdBy: "", status: "", month: "", year: "" });
                setPage(1);
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Body */}
      {isLoadingPlans ? (
        <PageLoader label="Loading program plans…" />
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-card/40 p-16 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 ring-1 ring-primary/30">
              <Inbox className="h-9 w-9 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Program Plans yet</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Get started by creating your first plan.
          </p>
          {can(perms.add) && (
            <Button
              onClick={() => goCreate(activeCentreId)}
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
              of <span className="font-medium text-foreground">{totalRecords}</span>
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
                    <MetaRow icon={CalendarDays} label="Created">
                      {r.publishedAt || "—"}
                    </MetaRow>
                    {r.updatedAt && (
                      <MetaRow icon={CalendarDays} label="Updated">
                        {r.updatedAt}
                      </MetaRow>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
                    <button
                      type="button"
                      onClick={() => handlePrint(r.id)}
                      title="Print"
                      disabled={isPrintingId === r.id}
                      className={`${CARD_PRIMARY_ACTION_CLASSES} disabled:opacity-50`}
                      style={CARD_PRIMARY_ACTION_STYLE}
                    >
                      {isPrintingId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewId(r.id)}
                      title="View"
                      className={CARD_PRIMARY_ACTION_CLASSES}
                      style={CARD_PRIMARY_ACTION_STYLE}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {(r.canEdit !== undefined ? r.canEdit : can(perms.edit)) && (
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
                    {(r.canDelete !== undefined ? r.canDelete : can(perms.delete)) && (
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

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        </>
      )}

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
