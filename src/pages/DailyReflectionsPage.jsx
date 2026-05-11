import { useEffect, useMemo, useState } from "react";
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
  FileText,
  UserCircle2,
  Users,
  Pencil,
  Video,
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
    try {
      const blob = await reflectionService.printReflection(id);
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to generate PDF for printing");
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
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pageItems.map((r) => (
            <ReflectionCard
              key={r.id}
              refl={r}
              onDelete={() => setDeleteModal({ open: true, id: r.id })}
              onEdit={() => navigate(`/daily-reflections/${r.id}/edit`)}
              onOpen={() => navigate(`/daily-reflections/${r.id}`)}
              onPrint={() => handlePrint(r.id)}
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

function ReflectionCard({ refl, onDelete, onEdit, onOpen, onPrint }) {
  const mediaItems = refl.media || [];
  const [imgIdx, setImgIdx] = useState(0);
  const cur = mediaItems[imgIdx];
  const childTags = refl.children || [];
  const cleanTitle = stripHtml(refl.title) || "Untitled reflection";
  const cleanAbout = stripHtml(refl.about);

  useEffect(() => {
    if (imgIdx >= mediaItems.length) {
      setImgIdx(0);
    }
  }, [imgIdx, mediaItems.length]);

  const goToPreviousMedia = (event) => {
    event.stopPropagation();
    setImgIdx((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const goToNextMedia = (event) => {
    event.stopPropagation();
    setImgIdx((prev) => (prev + 1) % mediaItems.length);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3 bg-emerald-600 px-4 py-3 text-white">
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 truncate text-left text-sm font-bold hover:underline"
          title={cleanTitle}
        >
          {cleanTitle}
        </button>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses(
            String(refl.status || "").toLowerCase(),
          )}`}
        >
          {refl.status}
        </span>
      </div>

      <div className="group relative h-52 w-full overflow-hidden bg-muted/50">
        <button type="button" onClick={onOpen} className="block h-full w-full">
          {cur && isImageMedia(cur) ? (
            <img
              key={cur.id || getMediaUrl(cur)}
              src={getMediaUrl(cur)}
              alt={cleanTitle}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : cur && isVideoMedia(cur) ? (
            <video
              key={cur.id || getMediaUrl(cur)}
              src={getMediaUrl(cur)}
              className="h-full w-full object-cover"
              muted
              controls
            />
          ) : cur ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <FileText className="h-10 w-10" />
              <span className="text-xs font-semibold">Attachment</span>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground/60">
              <ImageIcon className="h-12 w-12" />
              <span className="text-xs font-semibold">No media</span>
            </div>
          )}
        </button>

        {mediaItems.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPreviousMedia}
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToNextMedia}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
              aria-label="Next media"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
              {mediaItems.map((item, i) => (
                <button
                  type="button"
                  key={item.id || i}
                  onClick={(event) => {
                    event.stopPropagation();
                    setImgIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imgIdx ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                  aria-label={`Show media ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
          {cur && isVideoMedia(cur) ? (
            <Video className="h-3 w-3" />
          ) : (
            <ImageIcon className="h-3 w-3" />
          )}
          {mediaItems.length ? `${imgIdx + 1}/${mediaItems.length}` : "0/0"}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
          <Calendar className="h-3 w-3" /> {formatObsDate(refl.created_at)}
        </div>
        <div className="truncate text-xs font-medium text-muted-foreground">
          {refl.center?.centerName || "No centre"}
        </div>
      </div>

      <div className={`relative p-4 ${PATTERN_BG}`}>
        {cleanAbout && <p className="mb-4 line-clamp-2 text-sm text-foreground">{cleanAbout}</p>}

        <div className="mb-4">
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            <UserCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Children
          </h4>
          {childTags.length === 0 ? (
            <p className="text-xs text-muted-foreground">No children tagged.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(refl.children || []).map((c) => (
                <span
                  key={c.id}
                  className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-300 text-[9px] text-white">
                    {getPersonName(c.child).charAt(0)}
                  </span>
                  <span className="truncate">{getPersonName(c.child)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Users className="h-3.5 w-3.5 text-emerald-600" /> Educators
          </h4>
          {(refl.staff || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No educators tagged.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(refl.staff || []).map((s) => (
                <span
                  key={s.id}
                  className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-muted/80 py-1 pl-1 pr-3 text-xs font-semibold text-foreground"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">
                    {getPersonName(s.staff).charAt(0)}
                  </span>
                  <span className="truncate">{getPersonName(s.staff)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

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
            onClick={onPrint}
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
