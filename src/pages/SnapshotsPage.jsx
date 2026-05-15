import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  Recycle,
  ImageIcon,
  Camera,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  UserCircle2,
  DoorOpen,
  X,
  Loader2,
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
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

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
  const [gallerySnap, setGallerySnap] = useState(null);
  const [isPrinting, setIsPrinting] = useState(null);

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

  const handlePrint = async (id) => {
    setIsPrinting(id);
    try {
      const blob = await snapshotService.printSnapshot(id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate PDF for printing");
    } finally {
      setIsPrinting(null);
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

  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.snapshots;

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
            {can(perms.delete) && (
              <Button variant="outline" onClick={() => navigate("/snapshots/recycle-bin")}>
                <Recycle className="mr-1.5 h-4 w-4" />
                Recycle Bin
              </Button>
            )}
            {can(perms.add) && (
              <Button onClick={() => setTitleModalOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add New
              </Button>
            )}
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
          {can(perms.add) && (
            <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add New
            </Button>
          )}
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
              onViewGallery={() => setGallerySnap(s)}
              onPrint={() => handlePrint(s.id)}
              isPrinting={isPrinting === s.id}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
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

      {gallerySnap && (
        <SnapshotGalleryModal snap={gallerySnap} onClose={() => setGallerySnap(null)} />
      )}
    </div>
  );
}

function SnapshotGalleryModal({ snap, onClose }) {
  const images = (snap.media || []).filter((m) => m.mediaUrl);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const getUrl = (m) =>
    m.mediaUrl.startsWith("http") ? m.mediaUrl : `https://mydiaree.com.au/${m.mediaUrl}`;

  // Auto-scroll every 4 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  // Reset timer on manual navigation
  const goTo = useCallback(
    (newIdx) => {
      setIdx(newIdx);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 4000);
    },
    [images.length],
  );

  const goPrev = useCallback(
    () => goTo((idx - 1 + images.length) % images.length),
    [goTo, idx, images.length],
  );
  const goNext = useCallback(() => goTo((idx + 1) % images.length), [goTo, idx, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const cleanTitle = (snap.title || "").replace(/<[^>]*>/g, "");

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground">No Images</h3>
          <p className="mt-1 text-sm text-muted-foreground">This snapshot has no media attached.</p>
          <Button onClick={onClose} className="mt-5 rounded-full" variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{cleanTitle || "Snapshot Gallery"}</h2>
            <p className="text-xs font-medium text-white/50">
              {idx + 1} of {images.length} images
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image area */}
        <div
          className="relative flex items-center justify-center bg-black"
          style={{ minHeight: "420px" }}
        >
          <img
            key={images[idx]?.id || idx}
            src={getUrl(images[idx])}
            alt={`${cleanTitle} - ${idx + 1}`}
            className="max-h-[70vh] w-full object-contain transition-opacity duration-500 animate-in fade-in"
          />

          {/* Prev/Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators + thumbnail strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 px-6 py-4">
            {images.map((m, i) => (
              <button
                key={m.id || i}
                onClick={() => goTo(i)}
                className={`overflow-hidden rounded-lg border-2 transition-all ${
                  i === idx
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={getUrl(m)} alt={`Thumb ${i + 1}`} className="h-12 w-12 object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SnapshotCard({ snap, onDelete, onEdit, onOpen, onViewGallery, onPrint, isPrinting, canEdit = true, canDelete = true }) {
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
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === currentIdx ? "w-4 bg-white" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          <ImageIcon className="h-3 w-3" /> {currentIdx + 1}/{images.length}
        </span>
      </div>

      {/* 2. Body (Title, Status, Dropdowns, Actions) */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3
            className="line-clamp-2 text-base font-semibold leading-tight text-foreground"
            dangerouslySetInnerHTML={{ __html: snap.title }}
          ></h3>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              snap.status?.toLowerCase() === "published"
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
            }`}
          >
            {snap.status}
          </span>
        </div>

        {snap.about && (
          <div
            className="mb-4 line-clamp-2 text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: snap.about }}
          />
        )}

        {/* 3. Dropdowns for Children and Rooms */}
        <div className="mt-auto space-y-2">
          {childTags.length > 0 && (
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  <span>Children ({childTags.length})</span>
                </div>
                <span className="transition duration-300 group-open:rotate-90">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </span>
              </summary>
              <div className="mt-1 flex flex-wrap gap-1 px-1 py-1.5">
                {childTags.map((c) => (
                  <span
                    key={c.id}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {c.child?.name}
                  </span>
                ))}
              </div>
            </details>
          )}

          {roomTags.length > 0 && (
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <DoorOpen className="h-4 w-4 text-slate-400" />
                  <span>Rooms ({roomTags.length})</span>
                </div>
                <span className="transition duration-300 group-open:rotate-90">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </span>
              </summary>
              <div className="mt-1 flex flex-wrap gap-1 px-1 py-1.5">
                {roomTags.map((r) => (
                  <span
                    key={r.id}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* 4. Actions (Formal, not rang-birangi) */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={onPrint}
            title="Print"
            disabled={isPrinting}
            className={`${CARD_PRIMARY_ACTION_CLASSES} disabled:opacity-50`}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onViewGallery}
            title="View Gallery"
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
