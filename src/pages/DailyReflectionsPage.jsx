import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  Recycle,
  ImageIcon,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Baby,
  Calendar,
  Users,
  Pencil,
  Video,
  Loader2,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDateFilter } from "@/components/common/CustomDateFilter";
import { PersonFilterPicker } from "@/components/common/PersonFilterPicker";
import { useListFilterPeople } from "@/hooks/useListFilterPeople";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { reflectionService } from "@/services/learning/reflectionService";
import {
  STATUS_FILTERS,
  DATE_FILTERS,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/reflection/reflectionsData";
import { REFLECTION_DEFAULT_PER_PAGE } from "@/services/learning/reflectionService";
import { NewReflectionTitleModal } from "@/components/reflection/NewReflectionTitleModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { DoorOpen } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = REFLECTION_DEFAULT_PER_PAGE;
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, "");

const getReflectionItems = (response) => {
  const reflection = response?.data?.reflection ?? response?.reflection ?? response?.data;
  const rows = reflection?.data ?? reflection;
  return Array.isArray(rows) ? rows : [];
};

const getReflectionPagination = (response) => {
  const reflection = response?.data?.reflection ?? response?.reflection ?? {};
  return {
    currentPage: Number(reflection.current_page || 1),
    perPage: Number(reflection.per_page || PAGE_SIZE),
    total: Number(reflection.total || 0),
    lastPage: Number(reflection.last_page || 1),
  };
};

const getMediaUrl = (media) => {
  const rawUrl = media?.mediaUrl || media?.url || "";
  if (!rawUrl) return "";
  return rawUrl.startsWith("http")
    ? rawUrl
    : `https://mydiaree.com.au/${rawUrl.replace(/^\/+/, "")}`;
};

const getAvatarUrl = (imageUrl, name = "User", tone = "EEF2FF", color = "4338CA") => {
  const rawUrl = String(imageUrl || "").trim();
  if (rawUrl) {
    return rawUrl.startsWith("http")
      ? rawUrl
      : `https://mydiaree.com.au/${rawUrl.replace(/^\/+/, "")}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${tone}&color=${color}`;
};

const isImageMedia = (media) => {
  const type = String(media?.mediaType || "").toLowerCase();
  const url = getMediaUrl(media).toLowerCase();
  return type.includes("image") || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(url);
};

const isVideoMedia = (media) => {
  const type = String(media?.mediaType || "").toLowerCase();
  const url = getMediaUrl(media).toLowerCase();
  return type.includes("video") || /\.(mp4|webm|ogg|mov)(\?|$)/.test(url);
};

const getPersonName = (person) =>
  [person?.name, person?.lastname].filter(Boolean).join(" ").trim() || person?.name || "Unknown";

export default function DailyReflectionsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { can } = usePermissions();
  const {
    filteredStaff,
    filteredChildren,
    staffSearch,
    setStaffSearch,
    childrenSearch,
    setChildrenSearch,
    isChildrenLoading,
    clearPersonSearch,
  } = useListFilterPeople({ activeCentreId, activeRoomId, rooms });
  const perms = ACTION_PERMISSIONS.reflection;

  const [isLoadingReflections, setIsLoadingReflections] = useState(false);
  const [items, setItems] = useState([]);
  const [reflectionPagination, setReflectionPagination] = useState({
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
  const [isPrintingId, setIsPrintingId] = useState(null);
  const [galleryReflection, setGalleryReflection] = useState(null);

  const fetchReflections = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoadingReflections(true);
    try {
      const response = await reflectionService.getAllReflections(activeCentreId, {
        page,
        perPage: PAGE_SIZE,
        roomId: activeRoomId || undefined,
        search,
        status,
        dateRange,
        customFrom,
        customTo,
        childIds: childId !== "all" ? [childId] : [],
        authorIds: author !== "all" ? [author] : [],
      });
      if (response.status) {
        setItems(getReflectionItems(response));
        setReflectionPagination(getReflectionPagination(response));
      }
    } catch (error) {
      console.error("Failed to fetch reflections:", error);
    } finally {
      setIsLoadingReflections(false);
    }
  }, [
    activeCentreId,
    activeRoomId,
    page,
    search,
    status,
    dateRange,
    customFrom,
    customTo,
    childId,
    author,
  ]);

  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);

  useEffect(() => {
    setPage(1);
  }, [activeCentreId, activeRoomId, search, status, dateRange, customFrom, customTo, childId, author]);

  useEffect(() => {
    setAuthor("all");
    setChildId("all");
  }, [activeRoomId]);

  const totalPages = Math.max(1, reflectionPagination.lastPage);
  const safePage = Math.min(page, totalPages);
  const pageItems = items;

  const handleSubmitTitle = (title) => {
    setTitleModalOpen(false);
    navigate(`/daily-reflections/create?title=${encodeURIComponent(title)}`);
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setIsDeleting(true);
    try {
      const res = await reflectionService.deleteReflection(deleteModal.id);
      if (res.status) {
        toast.success("Reflection deleted successfully");
        setDeleteModal({ open: false, id: null });
        fetchReflections();
      } else {
        toast.error(res.message || "Failed to delete reflection");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = async (id) => {
    setIsPrintingId(id);
    try {
      const blob = await reflectionService.printReflection(id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate PDF for printing");
    } finally {
      setIsPrintingId(null);
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
    clearPersonSearch();
    setPage(1);
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
            {can(perms.delete) && (
              <Button variant="outline" onClick={() => navigate("/daily-reflections/recycle-bin")}>
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
                options={DATE_FILTERS}
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
                allLabel="All authors"
                searchPlaceholder="Search staff..."
                emptyMessage={
                  activeRoomId ? "No educators in this room" : "Select a room to filter by educator"
                }
                maxVisibleRows={5}
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
                  activeRoomId
                    ? "No children in this room"
                    : "Select a room to filter by child"
                }
                maxVisibleRows={5}
              />
            </div>
          </div>
        </div>
      )}

      {isLoadingReflections ? (
        <PageLoader label="Loading reflections…" />
      ) : pageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground">No reflections found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new reflection.
          </p>
          {can(perms.add) && (
            <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add New
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((r) => (
            <ReflectionCard
              key={r.id}
              refl={r}
              onDelete={() => setDeleteModal({ open: true, id: r.id })}
              onEdit={() => navigate(`/daily-reflections/${r.id}/edit`)}
              onViewGallery={() => setGalleryReflection(r)}
              onPrint={() => handlePrint(r.id)}
              isPrinting={isPrintingId === r.id}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
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

      <NewReflectionTitleModal
        open={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSubmit={handleSubmitTitle}
      />

      <DeleteConfirmationModal
        open={deleteModal.open}
        isLoading={isDeleting}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Reflection?"
        description="This will permanently remove this reflection and its shared media. Families will no longer be able to view it."
      />

      {galleryReflection && (
        <ReflectionGalleryModal
          reflection={galleryReflection}
          onClose={() => setGalleryReflection(null)}
        />
      )}
    </div>
  );
}

function ReflectionGalleryModal({ reflection, onClose }) {
  const mediaItems = (reflection.media || []).filter((item) => getMediaUrl(item));
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const cleanTitle = stripHtml(reflection.title) || "Reflection Gallery";

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % mediaItems.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [mediaItems.length]);

  const goTo = useCallback(
    (nextIdx) => {
      if (mediaItems.length === 0) return;
      setIdx(nextIdx);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaItems.length > 1) {
        timerRef.current = setInterval(() => {
          setIdx((prev) => (prev + 1) % mediaItems.length);
        }, 4000);
      }
    },
    [mediaItems.length],
  );

  const goPrev = useCallback(
    () => goTo((idx - 1 + mediaItems.length) % mediaItems.length),
    [goTo, idx, mediaItems.length],
  );
  const goNext = useCallback(
    () => goTo((idx + 1) % mediaItems.length),
    [goTo, idx, mediaItems.length],
  );

  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") onClose();
      if (mediaItems.length > 1 && event.key === "ArrowLeft") goPrev();
      if (mediaItems.length > 1 && event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, mediaItems.length, onClose]);

  if (mediaItems.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground">No Media</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This reflection has no media attached.
          </p>
          <Button onClick={onClose} className="mt-5 rounded-full" variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  const current = mediaItems[idx];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{cleanTitle}</h2>
            <p className="text-xs font-medium text-white/50">
              {idx + 1} of {mediaItems.length} media
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="relative flex items-center justify-center bg-black"
          style={{ minHeight: "420px" }}
        >
          {isVideoMedia(current) ? (
            <video
              key={current.id || idx}
              src={getMediaUrl(current)}
              className="max-h-[70vh] w-full object-contain"
              controls
              autoPlay
              muted
              playsInline
            />
          ) : (
            <img
              key={current.id || idx}
              src={getMediaUrl(current)}
              alt={`${cleanTitle} - ${idx + 1}`}
              className="max-h-[70vh] w-full object-contain transition-opacity duration-500 animate-in fade-in"
            />
          )}

          {mediaItems.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Next media"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {mediaItems.length > 1 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto border-t border-white/10 px-6 py-4">
            {mediaItems.map((item, itemIdx) => (
              <button
                key={item.id || itemIdx}
                onClick={() => goTo(itemIdx)}
                className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  itemIdx === idx
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {isVideoMedia(item) ? (
                  <div className="flex h-full w-full items-center justify-center bg-slate-900">
                    <Video className="h-5 w-5 text-white/80" />
                  </div>
                ) : (
                  <img
                    src={getMediaUrl(item)}
                    alt={`Thumb ${itemIdx + 1}`}
                    className="h-full w-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReflectionCard({
  refl,
  onDelete,
  onEdit,
  onViewGallery,
  onPrint,
  isPrinting,
  canEdit = true,
  canDelete = true,
}) {
  const mediaItems = refl.media || [];
  const [imgIdx, setImgIdx] = useState(0);
  const cur = mediaItems[imgIdx];
  const childTags = (refl.children || []).map((tag) => ({
    id: tag.childid || tag.child?.id || tag.id,
    name: tag.child ? getPersonName(tag.child) : `Child ${tag.childid || ""}`.trim(),
    imageUrl: tag.child?.imageUrl,
  }));
  const staffTags = (refl.staff || []).map((tag) => ({
    id: tag.staffid || tag.staff?.id || tag.id,
    name: tag.staff ? getPersonName(tag.staff) : `Educator ${tag.staffid || ""}`.trim(),
    imageUrl: tag.staff?.imageUrl,
  }));
  const creator = {
    name: getPersonName(refl.creator),
    imageUrl: refl.creator?.imageUrl,
    role: refl.creator?.userType || "Creator",
  };
  const cleanTitle = stripHtml(refl.title) || "Untitled reflection";
  const cleanAbout = stripHtml(refl.about);

  useEffect(() => {
    if (mediaItems.length <= 1) return;
    const interval = setInterval(() => {
      setImgIdx((prev) => (prev + 1) % mediaItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [mediaItems.length]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40">
        <button
          type="button"
          onClick={onViewGallery}
          className="block h-full w-full text-left"
          title="Open media gallery"
        >
          {cur ? (
            <div className="relative h-full w-full">
              {isImageMedia(cur) ? (
                <img
                  key={cur.id || imgIdx}
                  src={getMediaUrl(cur)}
                  alt={cleanTitle}
                  className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-900/10">
                  <Video className="h-10 w-10 text-slate-400" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </button>

        {mediaItems.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImgIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setImgIdx((prev) => (prev + 1) % mediaItems.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {mediaItems.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === imgIdx ? "w-4 bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          <ImageIcon className="h-3 w-3" /> {imgIdx + 1}/{Math.max(1, mediaItems.length)}
        </span>
      </div>

      {/* 2. Body */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
            {cleanTitle}
          </h3>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              refl.status?.toLowerCase() === "published"
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
            }`}
          >
            {refl.status}
          </span>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex min-w-0 items-center gap-2">
                  <AvatarImage
                    person={creator}
                    sizeClass="h-9 w-9"
                    fallbackTone="FEF3C7"
                    fallbackColor="B45309"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{creator.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{creator.role}</p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">{creator.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <p className="shrink-0 text-xs text-muted-foreground">{formatObsDate(refl.created_at)}</p>
        </div>

        {cleanAbout && (
          <p className="mb-4 line-clamp-2 text-xs text-muted-foreground italic">{cleanAbout}</p>
        )}

        <div className="mt-auto space-y-4 rounded-lg border border-border/70 bg-muted/20 p-3">
          <AvatarStack
            icon={Baby}
            label="Children"
            people={childTags}
            fallbackTone="FDF4FF"
            fallbackColor="C026D3"
          />
          <AvatarStack
            icon={Users}
            label="Educators"
            people={staffTags}
            fallbackTone="EEF2FF"
            fallbackColor="4338CA"
          />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={onPrint}
            title="Print"
            disabled={isPrinting}
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            {isPrinting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
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

function AvatarStack({
  icon: Icon,
  label,
  people = [],
  fallbackTone = "EEF2FF",
  fallbackColor = "4338CA",
}) {
  const visible = people.slice(0, 5);
  const hidden = Math.max(people.length - visible.length, 0);

  return (
    <div className="min-w-0">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
        <span className="text-muted-foreground/70">({people.length})</span>
      </p>
      {people.length === 0 ? (
        <span className="text-xs text-muted-foreground">None</span>
      ) : (
        <TooltipProvider delayDuration={120}>
          <div className="flex items-center">
            {visible.map((person, index) => (
              <Tooltip key={person.id || `${person.name}-${index}`}>
                <TooltipTrigger asChild>
                  <div
                    className={index > 0 ? "-ml-2" : ""}
                    style={{ zIndex: visible.length - index }}
                  >
                    <AvatarImage
                      person={person}
                      fallbackTone={fallbackTone}
                      fallbackColor={fallbackColor}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">{person.name}</TooltipContent>
              </Tooltip>
            ))}
            {hidden > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-semibold text-muted-foreground">
                    +{hidden}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {people
                    .slice(visible.length)
                    .map((person) => person.name)
                    .join(", ")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}

function AvatarImage({
  person,
  sizeClass = "h-8 w-8",
  fallbackTone = "EEF2FF",
  fallbackColor = "4338CA",
}) {
  const name = person?.name || "Unknown";
  return (
    <img
      src={getAvatarUrl(person?.imageUrl, name, fallbackTone, fallbackColor)}
      alt={name}
      title={name}
      className={`${sizeClass} rounded-full border-2 border-card bg-muted object-cover shadow-sm`}
      loading="lazy"
    />
  );
}
