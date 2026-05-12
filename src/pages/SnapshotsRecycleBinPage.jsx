import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  DoorOpen,
  Eye,
  ImageIcon,
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

const DELETED_SNAPSHOTS = [
  {
    id: "snap-418",
    title: "Water play discoveries",
    about: "Photo set from sensory water exploration.",
    status: "Published",
    deletedBy: "Liam Carter",
    deletedOn: "2026-05-11",
    children: ["Ava", "Noah"],
    rooms: ["Outdoor Yard"],
    mediaCount: 4,
  },
  {
    id: "snap-421",
    title: "Mother's Day craft table",
    about: "Images of child-led card making and collage work.",
    status: "Draft",
    deletedBy: "Jacob Marsh",
    deletedOn: "2026-05-05",
    children: ["Mia", "Leo", "Aria"],
    rooms: ["Preschool Room"],
    mediaCount: 2,
  },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

export default function SnapshotsRecycleBinPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DELETED_SNAPSHOTS);
  const [confirm, setConfirm] = useState(null);

  const restoreItem = (item) => {
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    toast.success("Snapshot restored");
  };

  const deleteItem = () => {
    setItems((prev) => prev.filter((row) => row.id !== confirm.id));
    toast.success("Snapshot permanently deleted");
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Snapshots Recycle Bin"
        description="Restore deleted snapshots or permanently remove them"
        breadcrumbs={[{ label: "Snapshots", to: "/snapshots" }, { label: "Recycle Bin" }]}
        actions={
          <Button variant="outline" onClick={() => navigate("/snapshots")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Snapshots
          </Button>
        }
      />

      {items.length === 0 ? (
        <EmptyState label="No deleted snapshots" />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between bg-emerald-500/80 px-4 py-2.5 text-white">
                <h3 className="truncate text-sm font-bold">{item.title}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    item.status.toLowerCase() === "published"
                      ? "bg-emerald-200/90 text-emerald-800"
                      : "bg-amber-200/90 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="group relative flex h-40 w-full items-center justify-center overflow-hidden bg-muted/40">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white">
                  <ImageIcon className="h-3 w-3" /> {item.mediaCount}
                </span>
              </div>

              <div className="p-4">
                <p className="mb-3 line-clamp-2 text-sm text-foreground">{item.about}</p>

                <div className="mb-3 grid gap-1.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <UserCircle2 className="h-3.5 w-3.5" />
                    Deleted By: {item.deletedBy}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Deleted On: {formatDate(item.deletedOn)}
                  </span>
                </div>

                <TagSection icon={UserCircle2} title="Children" items={item.children} tone="rose" />
                <TagSection icon={DoorOpen} title="Rooms" items={item.rooms} tone="emerald" />

                <div className="flex items-center justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => restoreItem(item)}
                    title="Restore"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Preview"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(item)}
                    title="Delete permanently"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-white hover:bg-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PermanentDeleteDialog
        open={Boolean(confirm)}
        title="Delete this snapshot permanently?"
        onClose={() => setConfirm(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}

function TagSection({ icon: Icon, title, items, tone }) {
  return (
    <div className="mb-3">
      <h4 className="mb-1.5 inline-flex items-center gap-1 text-xs font-bold text-foreground">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className={
              tone === "rose"
                ? "inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700"
                : "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
            }
          >
            {tone === "rose" && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-300 text-[8px] text-white">
                {item.charAt(0)}
              </span>
            )}
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-12 text-center">
      <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
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
