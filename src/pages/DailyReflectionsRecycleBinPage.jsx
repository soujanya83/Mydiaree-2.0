import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  FileText,
  ImageIcon,
  RotateCcw,
  Trash2,
  UserCircle2,
  Users,
  Baby,
  AlertTriangle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { useCentreStore } from "@/stores/centreStore";
import { reflectionService } from "@/services/learning/reflectionService";
import { statusBadgeClasses } from "@/components/reflection/reflectionsData";
import { IMG_BASE_API } from "../api/imageapi";

const IMG_BASE = IMG_BASE_API;

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

function getMediaUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
};

export default function DailyReflectionsRecycleBinPage() {
  const navigate = useNavigate();
  const { activeCentreId } = useCentreStore();

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // item to permanently delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [restoreConfirm, setRestoreConfirm] = useState(null); // item to restore

  const fetchRecycleBin = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const res = await reflectionService.getRecycleBin(activeCentreId);
      if (res.success) {
        setItems(res.data || []);
      } else {
        toast.error(res.message || "Failed to load recycle bin");
      }
    } catch {
      toast.error("Error loading recycle bin");
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
      const res = await reflectionService.restoreReflection(restoreConfirm.id);
      if (res.success) {
        toast.success(res.message || "Reflection restored");
        setItems((prev) => prev.filter((i) => i.id !== restoreConfirm.id));
        setRestoreConfirm(null);
      } else {
        toast.error(res.message || "Failed to restore");
      }
    } catch {
      toast.error("Failed to restore reflection");
    } finally {
      setIsRestoring(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const res = await reflectionService.permanentlyDeleteReflection(deleteConfirm.id);
      if (res.success) {
        toast.success(res.message || "Reflection permanently deleted");
        setItems((prev) => prev.filter((i) => i.id !== deleteConfirm.id));
        setDeleteConfirm(null);
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete reflection");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Daily Reflections — Recycle Bin"
        description="Restore deleted reflections or permanently remove them"
        breadcrumbs={[
          { label: "Daily Reflections", to: "/daily-reflections" },
          { label: "Recycle Bin" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/daily-reflections")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Reflections
          </Button>
        }
      />

      {isLoading ? (
        <PageLoader label="Loading recycle bin…" />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ReflectionRecycleBinCard
              key={item.id}
              item={item}
              isRestoring={isRestoring === item.id}
              onRestore={() => setRestoreConfirm(item)}
              onDelete={() => setDeleteConfirm(item)}
            />
          ))}
        </div>
      )}

      {/* Permanent delete modal */}
      <DeleteConfirmationModal
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={`Permanently delete "${stripHtml(deleteConfirm?.title)}"?`}
        description="This reflection will be permanently removed along with all associated media and data. This action cannot be undone."
      />

      {/* Restore confirmation modal */}
      {restoreConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <RotateCcw className="h-5 w-5" />
                  <h2 className="text-lg font-bold">Restore Reflection</h2>
                </div>
                <button
                  onClick={() => setRestoreConfirm(null)}
                  disabled={isRestoring === restoreConfirm?.id}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-6 py-6">
                <p className="text-base font-semibold text-foreground">
                  Restore &quot;{stripHtml(restoreConfirm?.title)}&quot;?
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This reflection will be moved back to the active list and become accessible again.
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setRestoreConfirm(null)}
                  disabled={isRestoring === restoreConfirm?.id}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestore}
                  disabled={isRestoring === restoreConfirm?.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  {isRestoring === restoreConfirm?.id ? "Restoring…" : "Restore"}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function ReflectionRecycleBinCard({ item, isRestoring, onRestore, onDelete }) {
  const title = stripHtml(item.title) || "Untitled";
  const firstMedia = item.media?.[0];
  const mediaSrc = firstMedia ? getMediaUrl(firstMedia.url) : null;
  const isImage = firstMedia?.type?.toLowerCase() === "image";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* Card header */}
      <div className="flex items-center justify-between gap-3 bg-emerald-600 px-4 py-3 text-white">
        <h3 className="min-w-0 flex-1 truncate text-sm font-bold" title={title}>
          {title}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses(
            item.status?.toLowerCase(),
          )}`}
        >
          {item.status}
        </span>
      </div>

      {/* Media preview */}
      <div className="flex h-44 w-full items-center justify-center overflow-hidden bg-muted/40">
        {mediaSrc && isImage ? (
          <img
            src={mediaSrc}
            alt={title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <div
          className={`flex flex-col items-center gap-2 text-muted-foreground/60 ${mediaSrc && isImage ? "hidden" : ""}`}
        >
          <ImageIcon className="h-10 w-10" />
          <span className="text-xs font-semibold">
            {item.media_count > 0
              ? `${item.media_count} media file${item.media_count > 1 ? "s" : ""}`
              : "No media"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={`space-y-4 p-4 ${PATTERN_BG}`}>
        {/* Meta */}
        <div className="grid gap-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="font-medium text-foreground">Creator:</span> {item.creator || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
            <span className="font-medium text-foreground">Deleted by:</span>{" "}
            {item.deleted_by || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">Deleted on:</span>{" "}
            {formatDate(item.deleted_at)}
          </span>
        </div>

        {/* Children */}
        {item.children?.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground">
              <Baby className="h-3.5 w-3.5 text-emerald-600" />
              Children ({item.children_count})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.children.map((child) => (
                <span
                  key={child.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-300 text-[9px] text-white dark:bg-rose-600">
                    {child.name?.charAt(0)?.toUpperCase()}
                  </span>
                  <span className="max-w-[120px] truncate">{child.name}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={onRestore}
            disabled={isRestoring}
            className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {isRestoring ? "Restoring…" : "Restore"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            disabled={isRestoring}
            className="border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <h3 className="text-lg font-semibold text-foreground">Recycle bin is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">Deleted reflections will appear here.</p>
    </div>
  );
}
