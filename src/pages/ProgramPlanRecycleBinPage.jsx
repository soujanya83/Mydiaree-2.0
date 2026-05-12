import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, RotateCcw, Sparkles, Trash2, UserCircle2 } from "lucide-react";
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

const DELETED_PROGRAM_PLANS = [
  {
    id: "pp-101",
    month: "May",
    year: 2026,
    roomName: "Kangaroo Room",
    status: "published",
    statusLabel: "Published",
    createdBy: "Jacob Marsh",
    deletedBy: "Amelia Stone",
    deletedOn: "2026-05-09",
  },
  {
    id: "pp-102",
    month: "April",
    year: 2026,
    roomName: "Koala Room",
    status: "draft",
    statusLabel: "Draft",
    createdBy: "Liam Carter",
    deletedBy: "Jacob Marsh",
    deletedOn: "2026-05-06",
  },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function ProgramPlanRecycleBinPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DELETED_PROGRAM_PLANS);
  const [confirm, setConfirm] = useState(null);

  const restoreItem = (item) => {
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    toast.success("Program plan restored");
  };

  const deleteItem = () => {
    setItems((prev) => prev.filter((row) => row.id !== confirm.id));
    toast.success("Program plan permanently deleted");
    setConfirm(null);
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

      {items.length === 0 ? (
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
                  {item.month} {item.year}
                </h3>
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    item.status === "published"
                      ? "bg-rose-500 text-white"
                      : "bg-indigo-500 text-white",
                  )}
                >
                  {item.statusLabel}
                </span>
              </div>

              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Room(s)" value={item.roomName} />
                <Row label="Created By" value={item.createdBy} />
                <Row label="Deleted By" value={item.deletedBy} />
                <Row label="Deleted On" value={formatDate(item.deletedOn)} />
              </dl>

              <div className="mt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => restoreItem(item)}
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Restore
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setConfirm(item)}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <PermanentDeleteDialog
        open={Boolean(confirm)}
        title="Delete this program plan permanently?"
        onClose={() => setConfirm(null)}
        onConfirm={deleteItem}
      />
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
