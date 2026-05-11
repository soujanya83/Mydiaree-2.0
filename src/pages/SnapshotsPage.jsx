import { useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { snapshotService } from "@/services/learning/snapshotService";
import {
  STATUS_FILTERS,
  DATE_FILTERS,
  AUTHORS,
  inDateRange,
} from "@/components/snapshots/snapshotsData";
import { NewSnapshotTitleModal } from "@/components/snapshots/NewSnapshotTitleModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";

const PAGE_SIZE = 12;

export default function SnapshotsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, fetchChildren } = useChildrenStore();
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [items, setItems] = useState([]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [author, setAuthor] = useState("all");
  const [childId, setChildId] = useState("all");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSnapshots = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoadingSnapshots(true);
    try {
      const response = await snapshotService.getAllSnapshots(activeCentreId);
      if (response.status) {
        setItems(response.snapshots || []);
      }
    } catch (error) {
      console.error("Failed to fetch snapshots:", error);
    } finally {
      setIsLoadingSnapshots(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  useEffect(() => {
    if (!activeCentreId) return;
    fetchChildren({
      center_id: activeCentreId,
      room_id: activeRoomId || undefined,
    });
    setChildId("all");
  }, [activeCentreId, activeRoomId, fetchChildren]);

  const authors = useMemo(() => {
    const set = new Set(items.map((s) => s.creator?.name).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      // API already filters by centerId, but we double check
      if (activeCentreId && String(s.centerid) !== String(activeCentreId)) return false;

      if (status !== "all" && s.status.toLowerCase() !== status.toLowerCase()) return false;
      // Author in API is creator.name
      if (author !== "all" && s.creator?.name !== author) return false;
      // Child filtering
      if (childId !== "all") {
        const hasChild = s.children?.some((c) => String(c.childid) === String(childId));
        if (!hasChild) return false;
      }
      if (!inDateRange(s.created_at, dateRange)) return false;

      const cleanTitle = (s.title || "").replace(/<[^>]*>/g, "");
      if (search && !cleanTitle.toLowerCase().includes(search.toLowerCase())) return false;
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

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await snapshotService.deleteSnapshot(deleteModal.id);
      if (res.status) {
        toast.success("Snapshot deleted successfully");
        setItems((prev) => prev.filter((s) => s.id !== deleteModal.id));
        setDeleteModal({ open: false, id: null });
      } else {
        toast.error(res.message || "Failed to delete snapshot");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
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
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FILTERS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Author</label>
              <Select value={author} onValueChange={setAuthor}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All authors</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Child</label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All children</SelectItem>
                  {children.map((c) => (
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

      {isLoadingSnapshots ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : pageItems.length === 0 ? (
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
              onDelete={() => setDeleteModal({ open: true, id: s.id })}
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

      <DeleteConfirmationModal
        open={deleteModal.open}
        isLoading={isDeleting}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Snapshot?"
        description="This will permanently remove this snapshot and its shared media. Families will no longer be able to view it."
      />
    </div>
  );
}

function SnapshotCard({ snap, onDelete, onEdit, onOpen }) {
  const images = snap.media || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const cover = images[currentIdx];
  const childTags = snap.children || [];
  const roomTags = snap.rooms || [];

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-emerald-500/80 px-4 py-2.5 text-white">
        <h3
          className="truncate text-sm font-bold"
          dangerouslySetInnerHTML={{ __html: snap.title }}
        ></h3>
        <span className="rounded-full bg-emerald-200/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
          {snap.status}
        </span>
      </div>

      {/* Image Container */}
      <div className="group relative h-40 w-full overflow-hidden bg-muted/40">
        <button type="button" onClick={onOpen} className="block h-full w-full">
          {cover ? (
            <div className="relative h-full w-full">
              <img
                key={cover.id}
                src={
                  cover.mediaUrl.startsWith("http")
                    ? cover.mediaUrl
                    : `https://mydiaree.com.au/${cover.mediaUrl}`
                }
                alt={snap.title}
                className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </button>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-1 rounded-full transition-all ${i === currentIdx ? "w-3 bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
          <ImageIcon className="h-3 w-3" /> {currentIdx + 1}/{images.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <div
          className="mb-3 line-clamp-2 text-sm text-foreground"
          dangerouslySetInnerHTML={{ __html: snap.about }}
        />

        <div className="mb-3">
          <h4 className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            <UserCircle2 className="h-3.5 w-3.5" /> Children
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(snap.children || []).map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-300 text-[8px] text-white">
                  {c.child?.name?.charAt(0) || "?"}
                </span>
                {c.child?.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h4 className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-foreground">
            <DoorOpen className="h-3.5 w-3.5" /> Rooms
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {(snap.rooms || []).map((r) => (
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
