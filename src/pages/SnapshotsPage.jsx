import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  ImageIcon,
  Camera,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  UserCircle2,
  DoorOpen,
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
  mockSnapshots,
  STATUS_FILTERS,
  DATE_FILTERS,
  AUTHORS,
  inDateRange,
} from "@/components/snapshots/snapshotsData";
import { NewSnapshotTitleModal } from "@/components/snapshots/NewSnapshotTitleModal";

const PAGE_SIZE = 12;

export default function SnapshotsPage() {
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
  const [items, setItems] = useState(mockSnapshots);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      if (s.centreId !== activeCentreId) return false;
      if (status !== "all" && s.status !== status) return false;
      if (author !== "all" && s.author !== author) return false;
      if (childId !== "all" && !(s.childIds || []).includes(childId)) return false;
      if (!inDateRange(s.createdAt, dateRange)) return false;
      if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, activeCentreId, status, author, childId, dateRange, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSubmitTitle = (title) => {
    setTitleModalOpen(false);
    navigate(`/snapshots/create?title=${encodeURIComponent(title)}`);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this snapshot?")) return;
    setItems((prev) => prev.filter((s) => s.id !== id));
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
        title="Snapshots"
        description="Photo moments shared with families"
        breadcrumbs={[{ label: "Snapshots" }]}
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

      {/* Hero banner */}
      <div className="mb-6 rounded-xl bg-emerald-500/80 px-6 py-5 text-center text-white shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-2xl font-extrabold">
          <Camera className="h-6 w-6" /> Snapshot Gallery
        </h2>
      </div>

      {filtersOpen && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Filter snapshots</h3>
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
                  {children.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Camera className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground">No snapshots found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or capture a new snapshot.
          </p>
          <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((s) => (
            <SnapshotCard
              key={s.id}
              snap={s}
              onDelete={() => handleDelete(s.id)}
              onEdit={() => navigate(`/snapshots/${s.id}/edit`)}
              onOpen={() => navigate(`/snapshots/${s.id}`)}
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

      <NewSnapshotTitleModal
        open={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSubmit={handleSubmitTitle}
      />
    </div>
  );
}

function SnapshotCard({ snap, onDelete, onEdit, onOpen }) {
  const images = snap.media || [];
  const cover = images[0];
  const childTags = snap.childTags || [];
  const roomTags = snap.roomTags || [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-emerald-500/80 px-4 py-2.5 text-white">
        <h3 className="truncate text-sm font-bold">{snap.title}</h3>
        <span className="rounded-full bg-emerald-200/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
          {snap.status}
        </span>
      </div>

      {/* Image */}
      <button
        type="button"
        onClick={onOpen}
        className="relative block h-40 w-full overflow-hidden bg-muted/40"
      >
        {cover ? (
          <img
            src={cover.url}
            alt={snap.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
          <ImageIcon className="h-3 w-3" /> {images.length}/{images.length}
        </span>
      </button>

      {/* Body */}
      <div className="p-4">
        <p className="mb-3 line-clamp-2 text-sm text-foreground">{snap.details}</p>

        <div className="mb-3">
          <h4 className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            <UserCircle2 className="h-3.5 w-3.5" /> Children
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {childTags.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-300 text-[8px] text-white">
                  {c.name.charAt(0)}
                </span>
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            <DoorOpen className="h-3.5 w-3.5" /> Rooms
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {roomTags.map((r) => (
              <span
                key={r.id}
                className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
              >
                {r.name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-start gap-2 pt-1">
          <button
            type="button"
            onClick={() => window.print()}
            title="Print"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Printer className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onOpen}
            title="View"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-white hover:bg-violet-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
