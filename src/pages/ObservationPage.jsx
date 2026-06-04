import { useCallback, useEffect, useRef, useState } from "react";
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
  CalendarRange,
  X,
  Mail,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CentreSelect } from "@/components/common/CentreSelect";
import { PageLoader } from "@/components/common/PageLoader";
import { PersonFilterPicker } from "@/components/common/PersonFilterPicker";
import { useListFilterPeople } from "@/hooks/useListFilterPeople";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import {
  STATUS_FILTERS,
  DATE_FILTERS,
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
import { IMG_BASE_API } from "../api/imageapi";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const PAGE_SIZE = 12;
const OBSERVATION_DATE_FILTERS = DATE_FILTERS.filter((option) =>
  ["all", "today", "this-week", "this-month"].includes(option.value),
);
const OBSERVATION_ROOM_FILTER_KEY = "observation-room-filter";
const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};
const IMG_BASE = IMG_BASE_API;

function getMediaUrl(raw) {
  if (!raw) return "";
  return String(raw).startsWith("http")
    ? String(raw)
    : `${IMG_BASE}${String(raw).replace(/^\/+/, "")}`;
}

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

function getObservationRows(response) {
  const observations = response?.observations ?? response?.data?.observations ?? response?.data;
  const rows = observations?.data ?? observations;
  return Array.isArray(rows) ? rows : [];
}

function getObservationTotal(response) {
  const observations = response?.observations ?? response?.data?.observations ?? {};
  const pagination = response?.pagination ?? response?.data?.pagination ?? {};
  return Number(pagination.total || observations.total || response?.count || 0);
}

function normalizeObservationItem(item) {
  const media = Array.isArray(item.media) ? item.media : item.media ? [item.media] : [];

  return {
    ...item,
    media,
    obestitle: item.obestitle || item.title || "",
    user: item.user || { name: item.userName || "Unknown" },
  };
}

export default function ObservationPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms } = useRoomStore();
  const { can, isParent, hasFullAccess } = usePermissions();
  const parentChildren = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);
  const [localRoomId, setLocalRoomId] = useState(() => {
    if (typeof window === "undefined") return "all";
    return window.localStorage.getItem(OBSERVATION_ROOM_FILTER_KEY) || "all";
  });
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
    clearPersonSearch,
    hasMoreStaff,
  } = useListFilterPeople({ activeCentreId, activeRoomId: localRoomId, rooms });
  const perms = ACTION_PERMISSIONS.observation;

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [titleModalOpen, setTitleModalOpen] = useState(false);
  const [commentModalId, setCommentModalId] = useState(null);
  const [commentRefreshTicks, setCommentRefreshTicks] = useState({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [author, setAuthor] = useState("all");
  const [childId, setChildId] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchObservations = useCallback(async () => {
    if (isParent) {
      if (!selectedChildId) {
        setItems([]);
        setTotal(0);
        return;
      }
    } else if (!activeCentreId) {
      return;
    }
    setIsLoading(true);
    try {
      const selectedChild = parentChildren.find((c) => String(c.id) === String(selectedChildId));
      const centerId = isParent ? getChildCenterId(selectedChild) : activeCentreId;

      if (!centerId) {
        setItems([]);
        setTotal(0);
        return;
      }

      const res = await observationService.getObservations(centerId, {
        page,
        perPage: PAGE_SIZE,
        ...(isParent
          ? {
              childId: selectedChildId,
            }
          : {
              roomId: localRoomId !== "all" ? localRoomId : undefined,
              search,
              status,
              dateRange,
              customFrom,
              customTo,
              childIds: childId !== "all" ? [childId] : [],
              authorIds: author !== "all" ? [author] : [],
            }),
      });
      if (isSuccessResponse(res)) {
        setItems(getObservationRows(res).map(normalizeObservationItem));
        setTotal(getObservationTotal(res));
      } else {
        setItems([]);
        setTotal(0);
        toast.error("Failed to fetch observations");
      }
    } catch (error) {
      console.error("Error loading observations:", error);
      setItems([]);
      setTotal(0);
      toast.error("Error loading observations");
    } finally {
      setIsLoading(false);
    }
  }, [
    activeCentreId,
    page,
    localRoomId,
    status,
    search,
    author,
    childId,
    dateRange,
    customFrom,
    customTo,
    isParent,
    selectedChildId,
    parentChildren,
  ]);

  useEffect(() => {
    fetchObservations();
  }, [fetchObservations]);

  useEffect(() => {
    setPage(1);
  }, [
    localRoomId,
    status,
    search,
    author,
    childId,
    dateRange,
    customFrom,
    customTo,
    activeCentreId,
    selectedChildId,
  ]);

  useEffect(() => {
    setAuthor("all");
    setChildId("all");
  }, [localRoomId]);

  useEffect(() => {
    window.localStorage.setItem(OBSERVATION_ROOM_FILTER_KEY, localRoomId);
  }, [localRoomId]);

  useEffect(() => {
    if (localRoomId === "all" || rooms.length === 0) return;
    const roomExists = rooms.some((room) => String(room.id) === String(localRoomId));
    if (!roomExists) setLocalRoomId("all");
  }, [localRoomId, rooms]);

  const filtered = items;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPrintingId, setIsPrintingId] = useState(null);
  const [galleryObservation, setGalleryObservation] = useState(null);
  const [shareObservation, setShareObservation] = useState(null);

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
    setLocalRoomId("all");
    setStatus("all");
    setDateRange("all");
    setCustomFrom("");
    setCustomTo("");
    setAuthor("all");
    setChildId("all");
    setSearch("");
    clearPersonSearch();
  };

  return (
    <div>
      <PageHeader
        title="Observation"
        breadcrumbs={[{ label: "Observation" }]}
        actions={
          <>
            {!isParent && (
              <Button variant="outline" onClick={() => setFiltersOpen((v) => !v)}>
                <Filter className="mr-1.5 h-4 w-4" />
                Filters
              </Button>
            )}
            {hasFullAccess && (
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
            {!isParent && (
              <CentreSelect
                icon={Building2}
                triggerClassName="h-9 w-[200px] border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                placeholder="Centre"
              />
            )}
          </>
        }
      />

      {/* Filters panel */}
      {!isParent && filtersOpen && (
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
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search By Title</label>
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
                options={OBSERVATION_DATE_FILTERS}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Room</label>
              <Select value={localRoomId} onValueChange={setLocalRoomId}>
                <SelectTrigger className="h-9">
                  <DoorOpen className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="All Rooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  localRoomId !== "all" ? "No children in this room" : "No children found"
                }
                maxVisibleRows={5}
              />
            </div>
          </div>
        </div>
      )}

      {/* Observation list */}
      {isLoading ? (
        <PageLoader label="Loading observations…" />
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
              onOpenGallery={() => setGalleryObservation(o)}
              onShare={() => setShareObservation(o)}
              onEdit={() => navigate(`/observation/${o.id}/edit`)}
              onPrint={() => handlePrint(o.id)}
              onStatusChange={async (newStatus) => {
                try {
                  const res = await observationService.updateStatus(o.id, newStatus);
                  if (res.status || res.success) {
                    toast.success(res.message || "Observation status updated successfully.");
                    fetchObservations();
                  } else {
                    toast.error(res.message || "Failed to update status");
                  }
                } catch (error) {
                  toast.error("Error updating status");
                }
              }}
              isPrinting={isPrintingId === o.id}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
              canShare={isParent}
              isParent={isParent}
              commentRefreshTick={commentRefreshTicks[o.id] || 0}
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
        observationId={commentModalId}
        onClose={() => {
          if (commentModalId) {
            setCommentRefreshTicks((prev) => ({
              ...prev,
              [commentModalId]: (prev[commentModalId] || 0) + 1,
            }));
          }
          setCommentModalId(null);
        }}
      />

      {galleryObservation && (
        <ObservationGalleryModal
          obs={galleryObservation}
          onClose={() => setGalleryObservation(null)}
        />
      )}

      <ObservationShareModal
        open={Boolean(shareObservation)}
        obs={shareObservation}
        onClose={() => setShareObservation(null)}
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

function ObservationShareModal({ open, obs, onClose }) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      setRecipientEmail("");
      setMessage("");
      setEmailError("");
    }
  }, [open, obs?.id]);

  const handleSend = async () => {
    const email = recipientEmail.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email) {
      setEmailError("Recipient email is required.");
      return;
    }

    if (!isValidEmail) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setEmailError("");
    setIsSending(true);
    try {
      const res = await observationService.shareObservation(obs.id, email, message.trim());
      if (res.status || res.success) {
        toast.success(res.message || "Observation shared successfully!");
        onClose();
      } else {
        if (res.errors && res.errors.recipient_email) {
          setEmailError(res.errors.recipient_email[0]);
        } else {
          toast.error(res.message || "Failed to share observation");
        }
      }
    } catch (error) {
      console.error("Error sharing observation:", error);
      toast.error("An error occurred while sharing the observation.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl">
        <div className="relative shrink-0 flex items-center gap-3 bg-gradient-to-br from-primary via-primary/90 to-primary/75 px-8 py-6 text-primary-foreground [&_.dialog-close]:text-primary-foreground">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <Mail className="h-5 w-5" />
          </div>
          <div className="relative min-w-0 flex-1">
            <h2 className="text-xl font-bold tracking-tight">Share via Email</h2>
            <p className="mt-1 text-sm text-primary-foreground/80">
              {obs ? stripHtml(obs.obestitle) || "Observation" : "Observation"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-muted/10 px-8 py-7">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Recipient Email
              </label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="Enter recipient's email address"
                className="h-12 rounded-xl border-border/60 bg-background px-4 text-base shadow-sm"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                You can enter a single email address.
              </p>
              {emailError ? (
                <p className="mt-2 text-sm font-medium text-destructive">{emailError}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                Message <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a short message..."
                className="min-h-[160px] w-full rounded-2xl border border-border/60 bg-background px-4 py-3 text-base text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border/50 bg-card px-8 py-5 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="rounded-xl px-6" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 font-semibold text-primary-foreground shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ObservationGalleryModal({ obs, onClose }) {
  const images = (obs.media || []).filter((m) => m?.mediaUrl);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

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

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const cleanTitle = stripHtml(obs.obestitle) || "Observation Gallery";

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground">No Images</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This observation has no media attached.
          </p>
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
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{cleanTitle}</h2>
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

        <div
          className="relative flex items-center justify-center bg-black p-6"
          style={{ minHeight: "420px" }}
        >
          <img
            key={images[idx]?.id || idx}
            src={getMediaUrl(images[idx]?.mediaUrl)}
            alt={`${cleanTitle} - ${idx + 1}`}
            className="max-h-[70vh] w-full object-contain transition-opacity duration-500 animate-in fade-in rounded-lg"
          />

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

function ObservationCard({
  obs,
  onDelete,
  onComment,
  onOpen,
  onOpenGallery,
  onShare,
  onEdit,
  onPrint,
  onStatusChange,
  isPrinting,
  canEdit = true,
  canDelete = true,
  canShare = false,
  isParent = false,
  commentRefreshTick = 0,
}) {
  const images = obs.media || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [commentCount, setCommentCount] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const handleStatusToggle = async (e) => {
    e.preventDefault();
    if (isTogglingStatus || !canEdit || isParent) return;
    const newStatus = obs.status?.toLowerCase() === "published" ? "Draft" : "Published";
    setIsTogglingStatus(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    let cancelled = false;
    observationService
      .getComments(obs.id)
      .then((res) => {
        if (!cancelled && res.status) {
          setCommentCount(res.comments?.length ?? 0);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [obs.id, commentRefreshTick]);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <div
        onClick={onOpenGallery}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpenGallery();
          }
        }}
        role="button"
        tabIndex={0}
        className="group relative block h-48 w-full shrink-0 cursor-pointer overflow-hidden bg-muted/40"
      >
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
                  alt={stripHtml(obs.obestitle) || "Observation Media"}
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
      </div>

      {/* 2. Body (Title, Status, Details, Dropdowns, Actions) */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <Link to={`/observation/${obs.id}`} className="hover:underline">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
              {stripHtml(obs.obestitle) || "Untitled observation"}
            </h3>
          </Link>

          {canEdit && !isParent ? (
            <button
              onClick={handleStatusToggle}
              disabled={isTogglingStatus}
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                obs.status?.toLowerCase() === "published"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
              }`}
            >
              {isTogglingStatus && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {obs.status || "Draft"}
            </button>
          ) : (
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                obs.status?.toLowerCase() === "published"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
              }`}
            >
              {obs.status || "Draft"}
            </span>
          )}
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
          {canShare && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onShare();
              }}
              title="Share via Email"
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
            >
              <Mail className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onComment();
            }}
            title={`Comments${commentCount !== null ? ` (${commentCount})` : ""}`}
            className={`relative ${CARD_PRIMARY_ACTION_CLASSES}`}
            style={CARD_PRIMARY_ACTION_STYLE}
          >
            <MessageSquare className="h-4 w-4" />
            {commentCount !== null && commentCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground shadow">
                {commentCount > 99 ? "99+" : commentCount}
              </span>
            )}
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
