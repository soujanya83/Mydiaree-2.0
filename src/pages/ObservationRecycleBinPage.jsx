import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  ImageIcon,
  MessageSquare,
  RotateCcw,
  Trash2,
  UserCircle2,
} from "lucide-react";
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

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const DELETED_OBSERVATIONS = [
  {
    id: "obs-204",
    title: "Fine motor puzzle observation",
    status: "Draft",
    author: "Liam Carter",
    createdAt: "2026-05-03",
    deletedBy: "Jacob Marsh",
    deletedOn: "2026-05-10",
    childrenCount: 2,
    mediaCount: 0,
  },
  {
    id: "obs-207",
    title: "Collaborative block play",
    status: "Published",
    author: "Amelia Stone",
    createdAt: "2026-05-01",
    deletedBy: "Sophia Green",
    deletedOn: "2026-05-08",
    childrenCount: 4,
    mediaCount: 3,
  },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

export default function ObservationRecycleBinPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DELETED_OBSERVATIONS);
  const [confirm, setConfirm] = useState(null);

  const restoreItem = (item) => {
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    toast.success("Observation restored");
  };

  const deleteItem = () => {
    setItems((prev) => prev.filter((row) => row.id !== confirm.id));
    toast.success("Observation permanently deleted");
    setConfirm(null);
  };

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

      {items.length === 0 ? (
        <EmptyState label="No deleted observations" />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`relative flex h-36 w-44 shrink-0 items-center justify-center bg-muted/40 ${PATTERN_BG}`}
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                <span
                  className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    item.status.toLowerCase() === "published"
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-400 text-amber-950"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className={`relative flex-1 p-4 ${PATTERN_BG}`}>
                <h3 className="text-sm font-bold text-primary line-clamp-1">{item.title}</h3>
                <p className="mt-1.5 text-xs text-foreground">
                  <span className="font-semibold">By:</span> {item.author}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>

                <div className="mt-3 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
                  <span className="inline-flex items-center gap-1.5">
                    <UserCircle2 className="h-3.5 w-3.5" />
                    Deleted By: {item.deletedBy}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Deleted On: {formatDate(item.deletedOn)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {item.childrenCount} Children
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ImageIcon className="h-3 w-3" />
                    {item.mediaCount} Media
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-start gap-2 border-l border-border bg-card/60 p-3">
                <button
                  type="button"
                  onClick={() => restoreItem(item)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-primary hover:bg-primary/10"
                  title="Restore"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm(item)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 hover:bg-rose-500/10"
                  title="Delete permanently"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <PermanentDeleteDialog
        open={Boolean(confirm)}
        title="Delete this observation permanently?"
        onClose={() => setConfirm(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-12 text-center">
      <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <h3 className="text-lg font-semibold text-foreground">{label}</h3>
      <p className="mt-1 text-sm text-muted-foreground">Deleted items will appear here.</p>
    </div>
  );
}

function PermanentDeleteDialog({ open, title, onClose, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This mock action removes the item from the recycle bin. Later it can call the permanent
            delete API.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete Permanently</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
