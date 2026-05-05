import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  MessageSquare,
  ImageIcon,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  DoorOpen
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import {
  mockObservations,
  STATUS_FILTERS,
  DATE_FILTERS,
  AUTHORS,
  inDateRange,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/observation/observationsData";
import { NewObservationTitleModal } from "@/components/observation/NewObservationTitleModal";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 10;

export default function ObservationPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading } = useChildrenStore();

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [author, setAuthor] = useState("all");
  const [childId, setChildId] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(mockObservations);

  const childrenInRoom = useMemo(() => {
    if (!activeRoomId) return children;
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return [];
    return children.filter((c) => String(c.room) === String(room.name));
  }, [children, activeRoomId, rooms]);

  const filtered = useMemo(() => {
    return items.filter((o) => {
      if (activeCentreId && o.centreId !== activeCentreId) return false;
      if (activeRoomId && String(o.roomId) !== String(activeRoomId)) return false;
      if (status !== "all" && o.status !== status) return false;
      if (author !== "all" && o.author !== author) return false;
      if (childId !== "all" && String(o.childId) !== String(childId)) return false;
      if (!inDateRange(o.createdAt, dateRange)) return false;
      if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, activeCentreId, activeRoomId, status, author, childId, dateRange, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSubmitTitle = (title) => {
    setTitleModalOpen(false);
    navigate(`/observation/create?title=${encodeURIComponent(title)}`);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this observation?")) return;
    setItems((prev) => prev.filter((o) => o.id !== id));
  };

  const activeCentre = centres.find((c) => c.id === activeCentreId);

  const resetFilters = () => {
    setStatus("all");
    setDateRange("all");
    setAuthor("all");
    setChildId("all");
    setSearch("");
  };

  return (
    <div>
      <PageHeader
        title="Observation"
        breadcrumbs={[{ label: "Observation" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
              <Filter className="mr-1.5 h-4 w-4" />
              Filters
            </Button>
            <Button onClick={() => setTitleModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New
            </Button>
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px] border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                <Building2 className="mr-1.5 h-4 w-4" />
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
              <SelectTrigger className="h-9 w-[180px] border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                <DoorOpen className="mr-1.5 h-4 w-4" />
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
          </>
        }
      />

      {/* Filters panel */}
      {filtersOpen && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter observations</h3>
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset all
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title…"
                  className="h-9 pl-8"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Author</label>
              <Select value={author} onValueChange={setAuthor}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {AUTHORS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Child</label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All children</SelectItem>
                  {childrenInRoom.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Observation list */}
      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Eye className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground">No observations found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new observation.
          </p>
          <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pageItems.map((o) => (
            <ObservationCard
              key={o.id}
              obs={o}
              onDelete={() => handleDelete(o.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={safePage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === safePage ? "default" : "outline"}
              size="sm"
              className="h-9 w-9"
              onClick={() => setPage(n)}
            >
              {n}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <NewObservationTitleModal
        open={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSubmit={handleSubmitTitle}
      />
    </div>
  );
}

function ObservationCard({ obs, onDelete }) {
  return (
    <Link
      to={`/observation/${obs.id}`}
      className={`group relative flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Left media */}
      <div className={`relative flex h-32 w-40 shrink-0 items-center justify-center bg-muted/40 ${PATTERN_BG}`}>
        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses(
            obs.status
          )}`}
        >
          {obs.status}
        </span>
      </div>

      {/* Body */}
      <div className={`relative flex-1 p-4 ${PATTERN_BG}`}>
        <h3 className="text-sm font-bold text-primary">{obs.title}</h3>
        <p className="mt-1.5 text-xs text-foreground">
          <span className="font-semibold">By:</span> {obs.author}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatObsDate(obs.createdAt)}</p>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); }}
          className="mt-3 inline-flex h-7 w-7 items-center justify-center rounded-md bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Comments"
        >
          <MessageSquare className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex flex-col items-center justify-start gap-2 border-l border-border bg-card/60 p-3">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); window.print(); }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Print"
        >
          <Printer className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); onDelete(); }}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-rose-500 hover:bg-rose-500/10"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}