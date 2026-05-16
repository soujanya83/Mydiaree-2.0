import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Filter,
  Printer,
  Trash2,
  Recycle,
  MessageSquare,
  ImageIcon,
  Eye,
  Pencil,
  Search,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  Loader2,
  AlertTriangle,
  UserCircle2,
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
  STATUS_FILTERS,
  DATE_FILTERS,
  AUTHORS,
  inDateRange,
  formatObsDate,
} from "@/components/observation/observationsData";
import { NewObservationTitleModal } from "@/components/observation/NewObservationTitleModal";
import { ObservationCommentModal } from "@/components/observation/ObservationCommentModal";
import { observationService } from "@/services/learning/observationService";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { Pagination } from "@/components/common/Pagination";
import { cn } from "@/lib/utils";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 13;
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

export default function ObservationPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children } = useChildrenStore();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.observation;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [commentModalId, setCommentModalId] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [author, setAuthor] = useState("all");
  const [childId, setChildId] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchObservations = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const filters = {
        room_id: activeRoomId || undefined,
        status: status !== "all" ? status : undefined,
        search: search || undefined,
        author: author !== "all" ? author : undefined,
        // For date range, we might need specific logic if server supports it,
        // but for now let's pass it as is or handle it client-side if needed.
        date_range: dateRange !== "all" ? dateRange : undefined,
      };
      const res = await observationService.getObservations(activeCentreId, PAGE_SIZE, page, filters);
      if (res.success) {
        setItems(res.observations.data || []);
        setTotal(res.observations.total || 0);
      } else {
        toast.error("Failed to fetch observations");
      }
    } catch (error) {
      toast.error("Error loading observations");
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId, page, activeRoomId, status, search, author, dateRange]);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeRoomId, status, search, author, dateRange, activeCentreId]);

  const childrenInRoom = useMemo(() => {
    if (!activeRoomId) return children;
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return [];
    return children.filter((c) => String(c.room) === String(room.name));
  }, [children, activeRoomId, rooms]);

  const filtered = items; // Now using server-side filtering

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrintingId, setIsPrintingId] = useState(null);

  const handleSubmitTitle = (title) => {
    setTitleModalOpen(false);
    navigate(`/observation/create?title=${encodeURIComponent(title)}`);
  };

  const handleDelete = (id) => {
    setDeleteModalId(id);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    setIsDeleting(true);
    try {
      const res = await observationService.deleteObservation(deleteModalId);
      if (res.status || res.success) {
        toast.success(res.message || "Observation deleted successfully");
        fetchObservations(); // Refresh list
      } else {
        toast.error(res.message || "Failed to delete observation");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the observation");
    } finally {
      setIsDeleting(false);
      setDeleteModalId(null);
    }
  };

  const handlePrint = async (id) => {
    setIsPrintingId(id);
    try {
      const blob = await observationService.printObservation(id);
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
        title="Observation"
        breadcrumbs={[{ label: "Observation" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
              <Filter className="mr-1.5 h-4 w-4" />
              Filters
            </Button>
            {can(perms.delete) && (
              <Button variant="outline" onClick={() => navigate("/observation/recycle-bin")}>
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
            <Select
              value={activeRoomId || "all"}
              onValueChange={(val) => setActiveRoom(val === "all" ? null : val)}
            >
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
        }
      />

      {/* Filters panel */}
      {filtersOpen && (
        <div className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
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
                  {AUTHORS.map((a) => (
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

      {/* Observation list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
          <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary opacity-40" />
          <h3 className="text-base font-semibold text-foreground">Loading observations...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
          <Eye className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold text-foreground">No observations found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or add a new observation.
          </p>
          {can(perms.add) && (
            <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add New
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((o) => (
            <ObservationCard
              key={o.id}
              obs={o}
              onDelete={() => handleDelete(o.id)}
              onComment={() => setCommentModalId(o.id)}
              onOpen={() => navigate(`/observation/${o.id}`)}
              onEdit={() => navigate(`/observation/${o.id}/edit`)}
              onPrint={() => handlePrint(o.id)}
              isPrinting={isPrintingId === o.id}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        className="mt-8"
      />

      <NewObservationTitleModal
        open={titleModalOpen}
        onClose={() => setTitleModalOpen(false)}
        onSubmit={handleSubmitTitle}
      />

      <ObservationCommentModal
        open={Boolean(commentModalId)}
        onClose={() => setCommentModalId(null)}
        observationId={commentModalId}
      />

      <DeleteConfirmationModal
        open={Boolean(deleteModalId)}
        onClose={() => setDeleteModalId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}

function DeleteConfirmationModal({ open, onClose, onConfirm, isLoading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Delete Observation?</h2>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. All data and media associated with this observation will
            be permanently removed.
          </p>
        </div>
        <div className="flex gap-3 border-t border-border bg-muted/20 px-8 py-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 rounded-xl"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-[0.98]"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function ObservationCard({ obs, onDelete, onComment, onOpen, onEdit, onPrint, isPrinting, canEdit = true, canDelete = true }) {
  const images = obs.media || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const cover = images[currentIdx];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <Link to={`/observation/${obs.id}`} className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40 block">
        {cover ? (
          <div className="relative h-full w-full">
            <img
              key={cover.id || currentIdx}
              src={
                cover.mediaUrl.startsWith("http")
                  ? cover.mediaUrl
                  : `https://mydiaree.com.au/${cover.mediaUrl}`
              }
              alt="Observation Media"
              className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
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
          <ImageIcon className="h-3 w-3" /> {currentIdx + 1}/{Math.max(1, images.length)}
        </span>
      </Link>

      {/* 2. Body (Title, Status, Details, Dropdowns, Actions) */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link to={`/observation/${obs.id}`} className="hover:underline">
            <h3
              className="line-clamp-2 text-base font-semibold leading-tight text-foreground"
              dangerouslySetInnerHTML={{ __html: obs.obestitle }}
            ></h3>
          </Link>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              obs.status?.toLowerCase() === "published"
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
            }`}
          >
            {obs.status}
          </span>
        </div>

        <div className="mb-4 flex flex-col gap-0.5 text-xs text-muted-foreground">
          <p>
            <span className="font-semibold">By:</span> {obs.user?.name || "Unknown"}
          </p>
          <p>{formatObsDate(obs.created_at)}</p>
        </div>


        {/* 4. Actions (Formal, not rang-birangi) */}
        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onOpen();
            }}
            title="View"
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onEdit();
              }}
              title="Edit"
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onComment();
            }}
            title="Comments"
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPrint();
            }}
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
          {canDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
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
