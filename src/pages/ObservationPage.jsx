import { useCallback, useEffect, useMemo, useState } from "react";
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
  DoorOpen,
  Loader2,
  AlertTriangle,
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
import { toast } from "sonner";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 13;

export default function ObservationPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children } = useChildrenStore();

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
      const res = await observationService.getObservations(activeCentreId, PAGE_SIZE, page);
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
  }, [activeCentreId, page]);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  const childrenInRoom = useMemo(() => {
    if (!activeRoomId) return children;
    const room = rooms.find((r) => r.id === activeRoomId);
    if (!room) return [];
    return children.filter((c) => String(c.room) === String(room.name));
  }, [children, activeRoomId, rooms]);

  const filtered = useMemo(() => {
    return items.filter((o) => {
      // Room filter: Only apply if a specific room is selected (not "all")
      if (activeRoomId) {
        const obsRoomStr = String(o.room || "");
        const targetIdStr = String(activeRoomId);
        // Check if targetId is in the comma-separated string or exactly matches
        const isMatch = obsRoomStr.split(",").some(r => r.trim() === targetIdStr) || 
                       obsRoomStr.includes(`"${targetIdStr}"`);
        if (!isMatch) return false;
      }

      if (status !== "all" && o.status.toLowerCase() !== status.toLowerCase()) return false;
      if (author !== "all" && o.user?.name !== author) return false;
      
      const rawTitle = o.obestitle || "";
      const cleanTitle = rawTitle.replace(/<[^>]*>/g, "");
      if (search && !cleanTitle.toLowerCase().includes(search.toLowerCase())) return false;
      
      if (!inDateRange(o.created_at, dateRange)) return false;
      return true;
    });
  }, [items, activeRoomId, status, author, dateRange, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
            <Select value={activeRoomId || "all"} onValueChange={(val) => setActiveRoom(val === "all" ? null : val)}>
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
          <Button className="mt-4" onClick={() => setTitleModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((o) => (
            <ObservationCard
              key={o.id}
              obs={o}
              onDelete={() => handleDelete(o.id)}
              onComment={() => setCommentModalId(o.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={n === page ? "default" : "outline"}
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
            disabled={page === totalPages}
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
            This action cannot be undone. All data and media associated with this observation will be permanently removed.
          </p>
        </div>
        <div className="flex gap-3 border-t border-border bg-muted/20 px-8 py-6">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-xl" disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            className="flex-1 rounded-xl bg-rose-600 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function ObservationCard({ obs, onDelete, onComment }) {
  const statusClasses = obs.status.toLowerCase() === "published" 
    ? "bg-emerald-500 text-white" 
    : "bg-amber-400 text-amber-950";

  return (
    <Link
      to={`/observation/${obs.id}`}
      className={`group relative flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Left media */}
      <div className={`relative flex h-32 w-40 shrink-0 items-center justify-center bg-muted/40 ${PATTERN_BG}`}>
        {obs.media?.length > 0 ? (
          <img src={obs.media[0].mediaUrl} className="h-full w-full object-cover" alt="obs" />
        ) : (
          <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
        )}
        <span
          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusClasses}`}
        >
          {obs.status}
        </span>
      </div>

      {/* Body */}
      <div className={`relative flex-1 p-4 ${PATTERN_BG}`}>
        <div 
          className="text-sm font-bold text-primary line-clamp-1"
          dangerouslySetInnerHTML={{ __html: obs.obestitle }} 
        />
        <p className="mt-1.5 text-xs text-foreground">
          <span className="font-semibold">By:</span> {obs.user?.name || "Unknown"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatObsDate(obs.created_at)}</p>

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onComment();
            }}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            {obs.child?.length || 0} Children
          </button>
          {obs.media?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              {obs.media.length} Media
            </div>
          )}
        </div>
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