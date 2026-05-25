import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  Loader2,
  RotateCcw,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCentreStore } from "@/stores/centreStore";
import { observationService } from "@/services/learning/observationService";
import { cn } from "@/lib/utils";

const IMG_BASE = "https://mydiaree.com.au/";

function getMediaUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
}

function stripHtml(value) {
  return (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateTime(value) {
  if (!value) return "-";
  const normalized = typeof value === "string" ? value.replace(" ", "T") : value;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isImageMedia(media) {
  const type = String(media?.type || "").toLowerCase();
  const url = String(media?.url || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|avif)(\?|#|$)/i.test(url);
}

export default function ObservationRecycleBinPage() {
  const navigate = useNavigate();
  const { activeCentreId } = useCentreStore();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [galleryObservation, setGalleryObservation] = useState(null);

  const fetchRecycleBin = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const res = await observationService.getRecycleBin(activeCentreId);
      if (res.success) {
        setItems(res.data || []);
      } else {
        toast.error(res.message || "Failed to load observation recycle bin");
      }
    } catch (error) {
      console.error("Failed to load observation recycle bin:", error);
      toast.error("Error loading observation recycle bin");
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    fetchRecycleBin();
  }, [fetchRecycleBin]);

  const handleRestore = async () => {
    if (!restoreConfirm) return;
    setIsRestoring(restoreConfirm.id);
    try {
      const res = await observationService.restoreObservation(restoreConfirm.id);
      if (res.success) {
        toast.success(res.message || "Observation restored");
        setItems((prev) => prev.filter((item) => item.id !== restoreConfirm.id));
        setRestoreConfirm(null);
      } else {
        toast.error(res.message || "Failed to restore observation");
      }
    } catch (error) {
      console.error("Failed to restore observation:", error);
      toast.error("Failed to restore observation");
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const res = await observationService.permanentlyDeleteObservation(deleteConfirm.id);
      if (res.success) {
        toast.success(res.message || "Observation permanently deleted");
        setItems((prev) => prev.filter((item) => item.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        toast.error(res.message || "Failed to permanently delete observation");
      }
    } catch (error) {
      console.error("Failed to permanently delete observation:", error);
      toast.error("Failed to permanently delete observation");
    } finally {
      setIsDeleting(false);
    }
  };

  const restoreTitle = stripHtml(restoreConfirm?.title) || "Untitled observation";

  return (
    <div>
      <PageHeader
        title="Observation Recycle Bin"
        description="Restore deleted observations or permanently remove them"
        breadcrumbs={[{ label: "Observation", to: "/observation" }, { label: "Recycle Bin" }]}
        actions={
          <Button variant="outline" onClick={() => navigate("/observation")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Observation
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader label="Loading recycle bin..." />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <ObservationRecycleCard
              key={item.id}
              item={item}
              isRestoring={isRestoring === item.id}
              onOpen={() => setGalleryObservation(item)}
              onRestore={() => setRestoreConfirm(item)}
              onDelete={() => setDeleteConfirm(item)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(restoreConfirm)}
        onOpenChange={(open) => !open && setRestoreConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this observation?</AlertDialogTitle>
            <AlertDialogDescription>
              "{restoreTitle}" will be moved back to the active observation list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(isRestoring)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={Boolean(isRestoring)}>
              {isRestoring ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteConfirm)}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this observation permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The observation and its media will be permanently
              removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {galleryObservation && (
        <ObservationGalleryModal
          observation={galleryObservation}
          onClose={() => setGalleryObservation(null)}
        />
      )}
    </div>
  );
}

function ObservationRecycleCard({ item, isRestoring, onOpen, onRestore, onDelete }) {
  const images = (item.media || []).filter(isImageMedia);
  const [currentIdx, setCurrentIdx] = useState(0);
  const cover = images[currentIdx];
  const title = stripHtml(item.title) || "Untitled observation";
  const children = item.children || [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="group relative h-48 w-full shrink-0 overflow-hidden bg-muted/40">
        <button type="button" onClick={onOpen} className="block h-full w-full cursor-pointer">
          {cover ? (
            <img
              key={cover.id || cover.url}
              src={getMediaUrl(cover.url)}
              alt={title}
              className="h-full w-full object-cover transition-opacity duration-700 animate-in fade-in"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </button>

        <span
          className={cn(
            "absolute left-2 top-2 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            item.status?.toLowerCase() === "published"
              ? "border-indigo-200 bg-indigo-50 text-indigo-600"
              : "border-orange-200 bg-orange-50 text-orange-600",
          )}
        >
          {item.status || "Draft"}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setCurrentIdx((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {images.map((image, index) => (
                <span
                  key={image.id || image.url || index}
                  className={cn(
                    "h-1.5 rounded-full bg-white/50 transition-all",
                    index === currentIdx && "w-4 bg-white",
                    index !== currentIdx && "w-1.5",
                  )}
                />
              ))}
            </div>
          </>
        )}

        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium text-white shadow-sm">
          <ImageIcon className="h-3 w-3" />
          {item.media_count || images.length || 0}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 min-h-[3rem]">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
            {title}
          </h3>
        </div>

        <div className="mb-4 grid gap-2 rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2 text-xs">
          <MetaRow icon={UserCircle2} label="Created by" value={item.creator || "-"} />
          <MetaRow icon={AlertTriangle} label="Deleted by" value={item.deleted_by || "-"} />
          <MetaRow icon={Calendar} label="Deleted at" value={formatDateTime(item.deleted_at)} />
        </div>

        <div className="mt-auto rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300">
          <div className="mb-2 flex items-center gap-1.5">
            <UserCircle2 className="h-4 w-4 text-slate-400" />
            <span>Children ({item.child_count ?? children.length})</span>
          </div>
          {children.length > 0 ? (
            <div className="flex max-h-20 flex-wrap gap-1.5 overflow-y-auto pr-1">
              {children.map((child) => (
                <span
                  key={child.id || child.name}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-300 text-[9px] text-white dark:bg-rose-600">
                    {child.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                  <span className="max-w-[130px] truncate">{child.name || "Unnamed child"}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No children linked</p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={onRestore}
            disabled={isRestoring}
            title="Restore"
            className="flex h-8 w-8 items-center justify-center rounded-md text-emerald-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50 dark:hover:bg-emerald-950/30"
          >
            {isRestoring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onOpen}
            title="View Images"
            className="flex h-8 w-8 items-center justify-center rounded-md text-primary transition-all duration-200 hover:bg-muted/50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isRestoring}
            title="Delete permanently"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="shrink-0 font-medium text-foreground">{label}:</span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}

function ObservationGalleryModal({ observation, onClose }) {
  const images = (observation.media || []).filter(isImageMedia);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const title = stripHtml(observation.title) || "Observation Images";

  useEffect(() => {
    if (images.length <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  const goTo = useCallback(
    (newIdx) => {
      if (images.length === 0) return;
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
    const handler = (event) => {
      if (event.key === "Escape") onClose();
      if (images.length > 1 && event.key === "ArrowLeft") goPrev();
      if (images.length > 1 && event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, images.length, onClose]);

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground">No Images</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This observation has no image media attached.
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
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{title}</h2>
            <p className="text-xs font-medium text-white/50">
              {idx + 1} of {images.length} images
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Close gallery"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center bg-black">
          <img
            key={images[idx]?.id || images[idx]?.url || idx}
            src={getMediaUrl(images[idx]?.url)}
            alt={`${title} - ${idx + 1}`}
            className="max-h-[70vh] w-full object-contain transition-opacity duration-500 animate-in fade-in"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
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
          <div className="flex items-center gap-2 overflow-x-auto border-t border-white/10 px-6 py-4">
            {images.map((media, index) => (
              <button
                key={media.id || media.url || index}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  index === idx
                    ? "scale-105 border-emerald-400 shadow-lg shadow-emerald-500/30"
                    : "border-transparent opacity-50 hover:opacity-80",
                )}
              >
                <img
                  src={getMediaUrl(media.url)}
                  alt={`Thumb ${index + 1}`}
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

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed bg-card p-12 text-center">
      <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <h3 className="text-lg font-semibold text-foreground">Recycle bin is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">Deleted observations will appear here.</p>
    </div>
  );
}
