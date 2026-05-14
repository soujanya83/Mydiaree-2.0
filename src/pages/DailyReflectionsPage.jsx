import { useEffect, useMemo, useState } from "react";
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
  Calendar,
  FileText,
  UserCircle2,
  Users,
  Eye,
  Pencil,
  Video,
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
import { reflectionService } from "@/services/learning/reflectionService";
import {
  STATUS_FILTERS,
  DATE_FILTERS,
  inDateRange,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/reflection/reflectionsData";
import { NewReflectionTitleModal } from "@/components/reflection/NewReflectionTitleModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { DoorOpen } from "lucide-react";
import { toast } from "sonner";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 10;
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

const stripHtml = (value = "") => String(value).replace(/<[^>]*>/g, "");

const toIdList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getReflectionItems = (response) => {
  const reflection = response?.data?.reflection ?? response?.reflection ?? response?.data;
  const rows = reflection?.data ?? reflection;
  return Array.isArray(rows) ? rows : [];
};

const getMediaUrl = (media) => {
  const rawUrl = media?.mediaUrl || media?.url || "";
  if (!rawUrl) return "";
  return rawUrl.startsWith("http")
    ? rawUrl
    : `https://mydiaree.com.au/${rawUrl.replace(/^\/+/, "")}`;
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
  const { children } = useChildrenStore();

  const [isLoadingReflections, setIsLoadingReflections] = useState(false);
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
  const [isPrintingId, setIsPrintingId] = useState(null);

  useEffect(() => {
    const fetchReflections = async () => {
      if (!activeCentreId) return;
      setIsLoadingReflections(true);
      try {
        const response = await reflectionService.getAllReflections(activeCentreId);
        if (response.status) {
          setItems(getReflectionItems(response));
        }
      } catch (error) {
        console.error("Failed to fetch reflections:", error);
      } finally {
        setIsLoadingReflections(false);
      }
    };

    fetchReflections();
  }, [activeCentreId]);

  const childrenInRoom = useMemo(() => {
    if (!activeRoomId) return children;
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return [];
    return children.filter(
      (c) =>
        String(c.room) === String(activeRoomId) ||
        String(c.room) === String(room.id) ||
        String(c.room) === String(room.name),
    );
  }, [children, activeRoomId, rooms]);

  const filtered = useMemo(() => {
    const activeRoom = rooms.find((r) => String(r.id) === String(activeRoomId));
    const activeRoomMatches = [activeRoomId, activeRoom?.id, activeRoom?.roomid, activeRoom?.roomId]
      .filter((value) => value !== undefined && value !== null)
      .map(String);

    return items.filter((r) => {
      if (activeCentreId && String(r.centerid) !== String(activeCentreId)) return false;
      const reflectionRoomIds = toIdList(r.roomids);
      if (
        activeRoomId &&
        reflectionRoomIds.length > 0 &&
        !reflectionRoomIds.some((roomId) => activeRoomMatches.includes(String(roomId)))
      ) {
        return false;
      }

      if (status !== "all" && String(r.status).toLowerCase() !== status.toLowerCase()) return false;
      // Author in API is creator.name
      if (author !== "all" && r.creator?.name !== author) return false;
      // Child filtering
      if (childId !== "all") {
        const hasChild = r.children?.some((c) => String(c.childid) === String(childId));
        if (!hasChild) return false;
      }
      if (!inDateRange(r.created_at, dateRange)) return false;

      const cleanTitle = stripHtml(r.title);
      if (search && !cleanTitle.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, activeCentreId, activeRoomId, rooms, status, author, childId, dateRange, search]);

  const authors = useMemo(() => {
    const set = new Set(items.map((s) => s.creator?.name).filter(Boolean));
    return Array.from(set);
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        setItems((prev) => prev.filter((r) => r.id !== deleteModal.id));
        setDeleteModal({ open: false, id: null });
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
            <Button variant="outline" onClick={() => navigate("/daily-reflections/recycle-bin")}>
              <Recycle className="mr-1.5 h-4 w-4" />
              Recycle Bin
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

      {isLoadingReflections ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
        </div>
      ) : pageItems.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((r) => (
            <ReflectionCard
              key={r.id}
              refl={r}
              onDelete={() => setDeleteModal({ open: true, id: r.id })}
              onEdit={() => navigate(`/daily-reflections/${r.id}/edit`)}
              onOpen={() => navigate(`/daily-reflections/${r.id}`)}
              onPrint={() => handlePrint(r.id)}
              isPrinting={isPrintingId === r.id}
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

      <DeleteConfirmationModal
        open={deleteModal.open}
        isLoading={isDeleting}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Reflection?"
        description="This will permanently remove this reflection and its shared media. Families will no longer be able to view it."
      />
    </div>
  );
}

function ReflectionCard({ refl, onDelete, onEdit, onOpen, onPrint, isPrinting }) {
  const mediaItems = refl.media || [];
  const [imgIdx, setImgIdx] = useState(0);
  const cur = mediaItems[imgIdx];
  const childTags = refl.children || [];
  const staffTags = refl.staff || [];
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
      <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40 block">
        <button type="button" onClick={onOpen} className="block h-full w-full">
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
          <button onClick={onOpen} className="text-left hover:underline">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
              {cleanTitle}
            </h3>
          </button>
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

        <div className="mb-4 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold">By:</span> {refl.creator?.name || "Unknown"}
          </p>
          <p>{formatObsDate(refl.created_at)}</p>
        </div>

        {cleanAbout && (
          <p className="mb-4 line-clamp-2 text-xs text-muted-foreground italic">{cleanAbout}</p>
        )}

        {/* Dropdowns */}
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
                {childTags.map((c, idx) => (
                  <span
                    key={c.id || idx}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {getPersonName(c.child)}
                  </span>
                ))}
              </div>
            </details>
          )}

          {staffTags.length > 0 && (
            <details className="group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:bg-slate-800/50">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>Educators ({staffTags.length})</span>
                </div>
                <span className="transition duration-300 group-open:rotate-90">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </span>
              </summary>
              <div className="mt-1 flex flex-wrap gap-1 px-1 py-1.5">
                {staffTags.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {getPersonName(s.staff)}
                  </span>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={onOpen}
            title="View"
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <Eye className="h-4 w-4" />
          </button>
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
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
