import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Filter,
  ClipboardList,
  CalendarDays,
  UserCircle2,
  Sparkles,
  X,
  Activity,
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
import { useAuthStore } from "@/stores/authStore";
import { ProgramPlanForm } from "@/components/programplan/ProgramPlanForm";
import { ProgramPlanView } from "@/components/programplan/ProgramPlanView";
import { MONTHS, YEARS } from "@/components/programplan/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const seed = [
  {
    id: "p1",
    centreId: "c1",
    roomId: "Sunflower Room",
    month: "April",
    year: 2026,
    educators: ["Deepti Sharma"],
    children: ["Emma Johnson", "Liam Smith"],
    focusArea: "Building independence and care for self.",
    practicalLife: ["Hand washing", "Pouring water"],
    sensorial: ["Pink Tower"],
    math: [],
    language: ["Sandpaper Letters"],
    culture: [],
    artCraft: "Spring leaf collage",
    eylf: ["1.2", "3.2"],
    outdoor: "Sandpit play, nature walk",
    inquiry: "",
    sustainability: "Compost bin observation",
    specialEvents: "14th April – Earth Day",
    childrenVoices: "",
    familiesInput: "",
    groupExperience: "",
    spontaneous: "",
    mindfulness: "Morning breathing circle",
    whatIsWorking: "Children settle quickly into the routine.",
    whatIsNotWorking: "",
    status: "published",
    createdBy: "Deepti",
    publishedAt: "2026-04-28",
  },
  {
    id: "p2",
    centreId: "c1",
    roomId: "Daisy Room",
    month: "March",
    year: 2026,
    educators: ["Mia Chen"],
    children: ["Olivia Brown"],
    focusArea: "",
    practicalLife: ["Sweeping"],
    sensorial: [],
    math: ["Number Rods"],
    language: [],
    culture: ["Continent Globe"],
    artCraft: "",
    eylf: ["4.1"],
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
    status: "draft",
    createdBy: "Staff",
    publishedAt: "2026-03-19",
  },
  {
    id: "p3",
    centreId: "c2",
    roomId: "Tulip Room",
    month: "April",
    year: 2026,
    educators: ["Daniel Park"],
    children: ["Ava Wilson", "Mason Taylor"],
    focusArea: "Math and counting fluency.",
    practicalLife: ["Tongs transfer"],
    sensorial: ["Brown Stair"],
    math: ["Spindle Box", "Bank Game"],
    language: [],
    culture: [],
    artCraft: "",
    eylf: ["4.2", "5.4"],
    outdoor: "",
    inquiry: "Where does our food come from?",
    sustainability: "",
    specialEvents: "",
    childrenVoices: "",
    familiesInput: "Parents shared family recipes.",
    groupExperience: "",
    spontaneous: "",
    mindfulness: "",
    whatIsWorking: "",
    whatIsNotWorking: "",
    status: "published",
    createdBy: "Deepti",
    publishedAt: "2026-04-07",
  },
];

function fmtDDMMYYYY(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
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
  const user = useAuthStore((s) => s.user);

  const [records, setRecords] = useState(seed);
  const [filters, setFilters] = useState({ roomId: "all", createdBy: "all", status: "all" });

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

  const roomNames = useMemo(() => {
    return rooms.map(r => r.name);
  }, [rooms]);

  const creators = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.createdBy).filter(Boolean)));
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (r.centreId !== activeCentreId) return false;
      if (filters.roomId !== "all" && r.roomId !== filters.roomId) return false;
      if (filters.createdBy !== "all" && r.createdBy !== filters.createdBy) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      return true;
    });
  }, [records, activeCentreId, filters]);

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

  const handleCreate = (data) => {
    const id = crypto.randomUUID();
    setRecords((p) => [
      {
        id,
        ...data,
        createdBy: user?.name || "Deepti",
        publishedAt: new Date().toISOString().slice(0, 10),
      },
      ...p,
    ]);
    toast.success("Program plan created.");
    goList();
  };

  const handleUpdate = (data) => {
    setRecords((p) => p.map((r) => (r.id === editId ? { ...r, ...data } : r)));
    toast.success("Program plan updated.");
    goList();
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== confirmId));
    toast.success("Plan deleted.");
    setConfirmId(null);
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
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeRoomId} onValueChange={setActiveRoom}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
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

        <Select value={filters.roomId} onValueChange={(v) => setFilters((p) => ({ ...p, roomId: v }))}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Room" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {roomNames.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.createdBy} onValueChange={(v) => setFilters((p) => ({ ...p, createdBy: v }))}>
          <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Created By" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Creators</SelectItem>
            {creators.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => setFilters((p) => ({ ...p, status: v }))}>
          <SelectTrigger className="h-9 w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
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
      </div>

      {/* Header banner */}
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-purple-500 px-5 py-4 text-primary-foreground shadow-md">
        <ClipboardList className="h-5 w-5" />
        <h2 className="text-base font-bold tracking-wide">Program Plans</h2>
      </div>

      {filtered.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
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
                      : "bg-indigo-500 text-white"
                  )}
                >
                  {r.status}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Room(s)" value={r.roomId} />
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
                  onClick={() => setConfirmId(r.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
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
              <Select value={pending.month} onValueChange={(v) => setPending((p) => ({ ...p, month: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-semibold text-primary">
                Select Year
              </Label>
              <Select
                value={String(pending.year)}
                onValueChange={(v) => setPending((p) => ({ ...p, year: Number(v) }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
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

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The plan will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
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
