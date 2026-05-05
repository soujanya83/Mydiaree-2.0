import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  ImageIcon,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCircle2,
  Users,
  Pencil,
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
  mockReflections,
  STATUS_FILTERS,
  DATE_FILTERS,
  AUTHORS,
  inDateRange,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/reflection/reflectionsData";
import { NewReflectionTitleModal } from "@/components/reflection/NewReflectionTitleModal";
import { DoorOpen } from "lucide-react";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 10;

export default function DailyReflectionsPage() {
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
  const [items, setItems] = useState(mockReflections);

  const childrenInRoom = useMemo(() => {
    if (!activeRoomId) return children;
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return [];
    return children.filter((c) => String(c.room) === String(room.name));
  }, [children, activeRoomId, rooms]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (activeCentreId && r.centreId !== activeCentreId) return false;
      if (activeRoomId && !(r.roomIds || []).includes(activeRoomId)) return false;
      if (status !== "all" && r.status !== status) return false;
      if (author !== "all" && r.author !== author) return false;
      if (childId !== "all" && !(r.childIds || []).includes(childId)) return false;
      if (!inDateRange(r.createdAt, dateRange)) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, activeCentreId, activeRoomId, status, author, childId, dateRange, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSubmitTitle = (title) => {
    setTitleModalOpen(false);
    navigate(`/daily-reflections/create?title=${encodeURIComponent(title)}`);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this reflection?")) return;
    setItems((prev) => prev.filter((r) => r.id !== id));
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
        title="Daily Reflections"
        description="Educator reflections and insights"
        breadcrumbs={[{ label: "Daily Reflections" }]}
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

      {filtersOpen && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter reflections</h3>
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

      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground">No reflections found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new reflection.
          </p>
          <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pageItems.map((r) => (
            <ReflectionCard
              key={r.id}
              refl={r}
              onDelete={() => handleDelete(r.id)}
              onEdit={() => navigate(`/daily-reflections/${r.id}/edit`)}
              onOpen={() => navigate(`/daily-reflections/${r.id}`)}
            />
          ))}
        </div>
      )}

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

      <NewReflectionTitleModal
        open={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSubmit={handleSubmitTitle}
      />
    </div>
  );
}

function ReflectionCard({ refl, onDelete, onEdit, onOpen }) {
  const images = refl.media || [];
  const [imgIdx, setImgIdx] = useState(0);
  const cur = images[imgIdx];
  const childTags = refl.childTags || [];
  const educators = refl.educators || [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Hero image */}
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-56 w-full overflow-hidden bg-muted/40"
      >
        {cur ? (
          <img
            src={cur.url}
            alt={refl.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide shadow ${statusBadgeClasses(
            refl.status
          )}`}
        >
          {refl.status}
        </span>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
              />
            ))}
          </div>
        )}
      </button>

      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-500/30 px-5 py-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-left text-base font-bold text-foreground hover:text-primary"
        >
          {refl.title}
        </button>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
          <Calendar className="h-3 w-3" /> {formatObsDate(refl.createdAt)}
        </div>
      </div>

      {/* Body */}
      <div className={`relative p-5 ${PATTERN_BG}`}>
        {/* Children */}
        <div className="mb-4">
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            <UserCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Children
          </h4>
          {childTags.length === 0 ? (
            <p className="text-xs text-muted-foreground">No children tagged.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {childTags.map((c) => (
                <div
                  key={c.id}
                  className="flex w-24 flex-col items-center rounded-lg border border-border bg-card p-2 text-center shadow-sm"
                >
                  <div className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-50 text-emerald-700">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <p className="truncate w-full text-[11px] font-semibold text-foreground">
                    {c.name.split(" ")[0]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Educators */}
        <div className="mb-4">
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Users className="h-3.5 w-3.5 text-emerald-600" /> Educators
          </h4>
          <div className="flex flex-wrap gap-2">
            {educators.map((e) => (
              <div
                key={e}
                className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 py-1 pl-1 pr-3 text-xs font-semibold text-foreground"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-emerald-400 bg-rose-100 text-[10px] text-rose-700">
                  {e.charAt(0)}
                </span>
                {e}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase text-emerald-700 hover:bg-emerald-500/30 dark:text-emerald-400"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase text-emerald-700 hover:bg-emerald-500/30 dark:text-emerald-400"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}