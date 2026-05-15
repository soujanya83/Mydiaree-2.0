import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
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
import { cn } from "@/lib/utils";
import { useCentreStore } from "@/stores/centreStore";
import { programPlanService } from "@/services/learning/programPlanService";
import { MONTHS } from "@/components/programplan/data";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatTitle = (title) => {
  if (!title) return "—";
  const [m, y] = title.split(" ");
  const monthName = MONTHS[parseInt(m, 10) - 1];
  return monthName && y ? `${monthName} ${y}` : title;
};

export default function ProgramPlanRecycleBinPage() {
  const navigate = useNavigate();
  const { activeCentreId } = useCentreStore();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(null); // ID of item being restored
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const fetchRecycleBin = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const res = await programPlanService.getRecycleBin(activeCentreId);
      if (res.success) {
        setItems(res.data || []);
      } else {
        toast.error(res.message || "Failed to fetch recycle bin");
      }
    } catch (error) {
      toast.error("Error loading recycle bin");
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    fetchRecycleBin();
  }, [fetchRecycleBin]);

  const handleRestore = async (id) => {
    setIsRestoring(id);
    try {
      const res = await programPlanService.restoreProgramPlan(id);
      if (res.success) {
        toast.success(res.message || "Program plan restored");
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(res.message || "Failed to restore");
      }
    } catch (error) {
      toast.error("Error restoring program plan");
    } finally {
      setIsRestoring(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirm) return;
    setIsDeleting(true);
    try {
      const res = await programPlanService.permanentlyDeleteProgramPlan(confirm.id);
      if (res.success) {
        toast.success(res.message || "Program plan permanently deleted");
        setItems((prev) => prev.filter((item) => item.id !== confirm.id));
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (error) {
      toast.error("Error deleting program plan");
    } finally {
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Program Plan Recycle Bin"
        description="Restore deleted program plans or permanently remove them"
        breadcrumbs={[{ label: "Program Plan", to: "/program-plan" }, { label: "Recycle Bin" }]}
        actions={
          <Button variant="outline" onClick={() => navigate("/program-plan")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Program Plan
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState label="No deleted program plans" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-amber-50/40 to-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:from-amber-950/10"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
              />
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-foreground">
                  {formatTitle(item.title)}
                </h3>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    item.status?.toLowerCase() === "published"
                      ? "bg-rose-500 text-white"
                      : "bg-indigo-500 text-white",
                  )}
                >
                  {item.status}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Room(s)" value={item.rooms?.join(", ") || "—"} />
                <Row label="Created By" value={item.creator || "—"} />
                <Row label="Deleted By" value={item.deleted_by || "—"} />
                <Row label="Deleted On" value={formatDate(item.deleted_at)} />
              </dl>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => handleRestore(item.id)}
                  disabled={isRestoring === item.id}
                >
                  {isRestoring === item.id ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                  )}
                  Restore
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => setConfirm(item)}
                  disabled={isDeleting && confirm?.id === item.id}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this program plan permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The program plan will be permanently removed from the system.
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
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xs font-bold text-foreground">{label}:</span>
      <span className="truncate text-xs text-muted-foreground">{value}</span>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Deleted items will appear here.</p>
    </div>
  );
}
