import { useCallback, useState, useEffect, useRef } from "react";
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
import { CentreSelect } from "@/components/common/CentreSelect";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomDateFilter } from "@/components/common/CustomDateFilter";
import { PersonFilterPicker } from "@/components/common/PersonFilterPicker";
import { useListFilterPeople } from "@/hooks/useListFilterPeople";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { snapshotService } from "@/services/learning/snapshotService";
import { STATUS_FILTERS, DATE_FILTERS } from "@/components/snapshots/snapshotsData";
import { NewSnapshotTitleModal } from "@/components/snapshots/NewSnapshotTitleModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { Pagination } from "@/components/common/Pagination";
import { IMG_BASE_API } from "../api/imageapi";

const PAGE_SIZE = 12;
const IMG_BASE = IMG_BASE_API;
const SNAPSHOT_DATE_FILTERS = DATE_FILTERS.filter(
  (option) => option.value !== "yesterday" && option.value !== "last-month",
);
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

const getMediaUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
};

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getChildCenterId(child) {
  return (
    child?.center_id ??
    child?.centerid ??
    child?.centre_id ??
    child?.centreid ??
    child?.center?.id ??
    child?.centre?.id ??
    ""
  );
}

function isSuccessResponse(response) {
  return response?.success || response?.status === true || response?.status === "success";
}

const getPersonName = (person, fallback = "Unknown") =>
  [person?.name, person?.lastname].filter(Boolean).join(" ").trim() ||
  person?.username ||
  person?.email ||
  fallback;

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const getSnapshotItems = (response) => {
  if (Array.isArray(response?.snapshots)) return response.snapshots;
  if (Array.isArray(response?.snapshots?.data)) return response.snapshots.data;
  return [];
};

const getSnapshotPagination = (response) => {
  const source = response?.pagination || response?.snapshots || {};
  return {
    currentPage: Number(source.current_page || 1),
    perPage: Number(source.per_page || PAGE_SIZE),
    total: Number(source.total || 0),
    lastPage: Number(source.last_page || 1),
  };
};

function normalizeSnapshotItem(item) {
  return {
    ...item,
    title: stripHtml(item.title),
    about: stripHtml(item.about),
    media: Array.isArray(item.media) ? item.media : item.media ? [item.media] : [],
    rooms: Array.isArray(item.rooms) ? item.rooms : [],
    children: Array.isArray(item.children) ? item.children : [],
  };
}

export default function SnapshotsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms } = useRoomStore();
  const [localRoomId, setLocalRoomId] = useState("all");
  const parentChildren = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const {
    filteredStaff,
    filteredChildren,
    staffSearch,
    setStaffSearch,
    childrenSearch,
    setChildrenSearch,
    isStaffLoading,
    isChildrenLoading,
    loadMoreStaff,
    loadMoreChildren,
    hasMoreStaff,
    hasMoreChildren,
    clearPersonSearch,
  } = useListFilterPeople({ activeCentreId, activeRoomId: localRoomId, rooms });
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [items, setItems] = useState([]);
  const [snapshotPagination, setSnapshotPagination] = useState({
    currentPage: 1,
    perPage: PAGE_SIZE,
    total: 0,
    lastPage: 1,
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [author, setAuthor] = useState("all");
  const [childId, setChildId] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [gallerySnap, setGallerySnap] = useState(null);
  const [isPrinting, setIsPrinting] = useState(null);
  const { can, isParent, hasFullAccess } = usePermissions();
  const perms = ACTION_PERMISSIONS.snapshots;

  const fetchSnapshots = useCallback(async () => {
    if (isParent) {
      if (!selectedChildId) {
        setItems([]);
        setSnapshotPagination({
          currentPage: 1,
          perPage: PAGE_SIZE,
          total: 0,
          lastPage: 1,
        });
        return;
      }
    } else if (!activeCentreId) {
      return;
    }
    setIsLoadingSnapshots(true);
    try {
      const selectedChild = parentChildren.find((c) => String(c.id) === String(selectedChildId));
      const centerId = isParent ? getChildCenterId(selectedChild) : activeCentreId;

      if (!centerId) {
        setItems([]);
        setSnapshotPagination({
          currentPage: 1,
          perPage: PAGE_SIZE,
          total: 0,
          lastPage: 1,
        });
        return;
      }

      const response = await snapshotService.getAllSnapshots(centerId, {
        page,
        perPage: PAGE_SIZE,
        ...(isParent
          ? {
              childId: selectedChildId,
              status: "Published",
            }
          : {
              roomId: localRoomId && localRoomId !== "all" ? localRoomId : undefined,
              search,
              status,
              dateRange,
              customFrom,
              customTo,
              child_name: childId !== "all" ? childId : undefined,
              author: author !== "all" ? author : undefined,
            }),
      });
      if (isSuccessResponse(response)) {
        setItems(getSnapshotItems(response).map(normalizeSnapshotItem));
        setSnapshotPagination(getSnapshotPagination(response));
      } else {
        setItems([]);
        setSnapshotPagination({
          currentPage: 1,
          perPage: PAGE_SIZE,
          total: 0,
          lastPage: 1,
        });
        toast.error(response?.message || "Failed to fetch snapshots");
      }
    } catch (error) {
      console.error("Failed to fetch snapshots:", error);
      setItems([]);
      setSnapshotPagination({
        currentPage: 1,
        perPage: PAGE_SIZE,
        total: 0,
        lastPage: 1,
      });
      toast.error("Error loading snapshots");
    } finally {
      setIsLoadingSnapshots(false);
    }
  }, [
    activeCentreId,
    localRoomId,
    page,
    search,
    status,
    dateRange,
    customFrom,
    customTo,
    childId,
    author,
    isParent,
    selectedChildId,
    parentChildren,
  ]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  useEffect(() => {
    setPage(1);
  }, [
    activeCentreId,
    localRoomId,
    search,
    status,
    dateRange,
    customFrom,
    customTo,
    childId,
    author,
    selectedChildId,
  ]);

  useEffect(() => {
    setAuthor("all");
    setChildId("all");
  }, [localRoomId]);

  const totalPages = Math.max(1, snapshotPagination.lastPage);
  const safePage = Math.min(page, totalPages);
  const pageItems = items;

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

  const resetFilters = () => {
    setStatus("all");
    setDateRange("all");
    setCustomFrom("");
    setCustomTo("");
    setAuthor("all");
    setChildId("all");
    setSearch("");
    setLocalRoomId("all");
    clearPersonSearch();
  };

  return (
    <div>
      <PageHeader
        title="Snapshots"
        description="Photo moments shared with families"
        breadcrumbs={[{ label: "Snapshots" }]}
        actions={
          <>
            {!isParent && (
              <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
                <Filter className="mr-1.5 h-4 w-4" />
                Filters
              </Button>
            )}
            {hasFullAccess && (
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
            {!isParent && (
              <>
                <CentreSelect
                  icon={Building2}
                  triggerClassName="h-9 w-[200px] border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                  placeholder="Centre"
                />
                <Select value={localRoomId} onValueChange={setLocalRoomId}>
                  <SelectTrigger className="h-9 w-[180px] border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20">
                    <DoorOpen className="mr-1.5 h-4 w-4" />
                    <SelectValue placeholder="Room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </>
        }
      />

      {/* Hero banner */}
      <div className="mb-6 rounded-xl bg-emerald-500/80 px-6 py-5 text-center text-white shadow-sm">
        <h2 className="inline-flex items-center gap-2 text-2xl font-extrabold">
          <Camera className="h-6 w-6" /> Snapshot Gallery
        </h2>
      </div>

      {!isParent && filtersOpen && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
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
                  placeholder="Search by title..."
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
              <CustomDateFilter
                dateRange={dateRange}
                setDateRange={setDateRange}
                customFrom={customFrom}
                setCustomFrom={setCustomFrom}
                customTo={customTo}
                setCustomTo={setCustomTo}
                options={SNAPSHOT_DATE_FILTERS}
              />
            </div>
            <div>
              <PersonFilterPicker
                label="Author"
                value={author}
                onChange={setAuthor}
                items={filteredStaff}
                search={staffSearch}
                onSearchChange={setStaffSearch}
                isLoading={isStaffLoading}
                allLabel="All authors"
                searchPlaceholder="Search staff..."
                emptyMessage="No staff found in this center"
                maxVisibleRows={5}
                onLoadMore={loadMoreStaff}
                hasMore={hasMoreStaff}
              />
            </div>
            <div>
              <PersonFilterPicker
                label="Child"
                value={childId}
                onChange={setChildId}
                items={filteredChildren}
                search={childrenSearch}
                onSearchChange={setChildrenSearch}
                isLoading={isChildrenLoading}
                allLabel="All children"
                searchPlaceholder="Search children..."
                emptyMessage={
                  localRoomId && localRoomId !== "all"
                    ? "No children in this room"
                    : "No children found in this center"
                }
                maxVisibleRows={5}
                onLoadMore={loadMoreChildren}
                hasMore={hasMoreChildren}
              />
            </div>
          </div>
        </div>
      )}

      {isLoadingSnapshots ? (
        <PageLoader label="Loading snapshots…" />
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
              onOpen={() => setGallerySnap(s)}
              onViewGallery={() => setGallerySnap(s)}
              onPrint={() => handlePrint(s.id)}
              isPrinting={isPrinting === s.id}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
              canPrint={!isParent}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-8"
      />

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
        description="This will move the snapshot and its shared media to the recycle bin. Families will no longer be able to view it."
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
            src={getMediaUrl(images[idx]?.mediaUrl)}
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
                <img
                  src={getMediaUrl(m.mediaUrl)}
                  alt={`Thumb ${i + 1}`}
                  className="h-12 w-12 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChildAvatarStack({ childTags = [] }) {
  const visible = childTags.slice(0, 4);
  const extra = childTags.length - visible.length;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((tag) => {
          const child = tag.child || {};
          const name = getPersonName(child, `Child ${tag.childid || tag.id || ""}`.trim());
          return (
            <Tooltip key={tag.id || tag.childid || name}>
              <TooltipTrigger asChild>
                <div className="relative rounded-full transition-transform hover:z-10 hover:scale-110">
                  <SnapshotPersonAvatar person={child} name={name} sizeClass="h-7 w-7" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">{name}</TooltipContent>
            </Tooltip>
          );
        })}
        {extra > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground/70">
                +{extra}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              {childTags
                .slice(visible.length)
                .map((tag) =>
                  getPersonName(tag.child || {}, `Child ${tag.childid || tag.id || ""}`.trim()),
                )
                .join(", ")}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

function RoomChipRow({ rooms = [] }) {
  const visible = rooms.slice(0, 4);
  const extra = rooms.length - visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((room) => (
        <span
          key={room.id || room.name}
          className="max-w-[120px] truncate rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          title={room.name}
        >
          {room.name}
        </span>
      ))}
      {extra > 0 && (
        <span
          className="rounded bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground/70"
          title={rooms
            .slice(visible.length)
            .map((room) => room.name)
            .join(", ")}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}

function SnapshotPersonAvatar({ person, name, sizeClass = "h-8 w-8" }) {
  const displayName = name || getPersonName(person);
  const imageUrl = getMediaUrl(person?.imageUrl);

  return (
    <Avatar className={`${sizeClass} border border-background bg-primary/10 shadow-sm`}>
      {imageUrl && <AvatarImage src={imageUrl} alt={displayName} className="object-cover" />}
      <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
        {getInitials(displayName)}
      </AvatarFallback>
    </Avatar>
  );
}

function SnapshotCard({
  snap,
  onDelete,
  onEdit,
  onOpen,
  onViewGallery,
  onPrint,
  isPrinting,
  canEdit = true,
  canDelete = true,
  canPrint = true,
}) {
  const images = snap.media || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const childTags = snap.children || [];
  const roomTags = snap.rooms || [];
  const creatorName = getPersonName(snap.creator, "Unknown creator");
  const cleanTitle = (snap.title || "").replace(/<[^>]*>/g, "") || "Untitled snapshot";
  const cleanAbout = (snap.about || "").replace(/<[^>]*>/g, "");

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40">
        <button type="button" onClick={onOpen} className="block h-full w-full cursor-pointer">
          {images.length ? (
            <div
              className="flex h-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIdx * 100}%)` }}
            >
              {images.map((image, index) => (
                <div
                  key={image.id || index}
                  className="flex h-full w-full shrink-0 items-center justify-center bg-muted/40"
                >
                  <img
                    src={getMediaUrl(image.mediaUrl)}
                    alt={snap.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
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
        {images.length > 0 && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
            <ImageIcon className="h-3 w-3" /> {currentIdx + 1}/{images.length}
          </span>
        )}
      </div>

      {/* 2. Body (Title, Status, Dropdowns, Actions) */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex min-h-[2.5rem] items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-base font-semibold leading-tight text-foreground">
            {cleanTitle}
          </h3>
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

        <p className="mb-3 min-h-[2.5rem] line-clamp-2 text-sm text-muted-foreground">
          {cleanAbout || " "}
        </p>

        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2">
          <SnapshotPersonAvatar person={snap.creator} name={creatorName} sizeClass="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-muted-foreground">Created by</p>
            <p className="truncate text-sm font-semibold text-foreground">{creatorName}</p>
          </div>
        </div>

        {/* 3. Rooms and children */}
        <div className="mt-auto space-y-2">
          {roomTags.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-slate-400" />
                <span>Rooms</span>
              </div>
              <div className="mt-2">
                <RoomChipRow rooms={roomTags} />
              </div>
            </div>
          )}

          {childTags.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
              <div className="mb-2 flex items-center gap-1.5">
                <UserCircle2 className="h-4 w-4 text-slate-400" />
                <span>Children ({childTags.length})</span>
              </div>
              <ChildAvatarStack childTags={childTags} />
            </div>
          )}
        </div>

        {/* 4. Actions (Formal, not rang-birangi) */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          {canPrint && (
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
          )}
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
