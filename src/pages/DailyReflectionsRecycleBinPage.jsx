import { useState } from "react";
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
import { statusBadgeClasses } from "@/components/reflection/reflectionsData";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

const DELETED_REFLECTIONS = [
  {
    id: "ref-311",
    title: "Quiet transitions after lunch",
    about: "Notes on calmer routines, music cues and rest preparation.",
    status: "Draft",
    centerName: "Melbourne Center",
    createdAt: "2026-05-02",
    deletedBy: "Sophia Green",
    deletedOn: "2026-05-07",
    children: ["Ava", "Noah"],
    educators: ["Jacob Marsh"],
  },
  {
    id: "ref-312",
    title: "Extending children's garden questions",
    about: "Educator reflection on inquiry prompts and next experiences.",
    status: "Published",
    centerName: "Brisbane Center",
    createdAt: "2026-05-01",
    deletedBy: "Amelia Stone",
    deletedOn: "2026-05-04",
    children: ["Mia", "Leo", "Aria"],
    educators: ["Liam Carter", "Sophia Green"],
  },
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });

export default function DailyReflectionsRecycleBinPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(DELETED_REFLECTIONS);
  const [confirm, setConfirm] = useState(null);

  const restoreItem = (item) => {
    setItems((prev) => prev.filter((row) => row.id !== item.id));
    toast.success("Reflection restored");
  };

  const deleteItem = () => {
    setItems((prev) => prev.filter((row) => row.id !== confirm.id));
    toast.success("Reflection permanently deleted");
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Daily Reflections Recycle Bin"
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

      {items.length === 0 ? (
        <EmptyState label="No deleted reflections" />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3 bg-emerald-600 px-4 py-3 text-white">
                <h3 className="min-w-0 flex-1 truncate text-left text-sm font-bold">
                  {item.title}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClasses(
                    item.status.toLowerCase(),
                  )}`}
                >
                  {item.status}
                </span>
              </div>

              <div className="flex h-52 w-full flex-col items-center justify-center gap-2 bg-muted/50 text-muted-foreground/60">
                <ImageIcon className="h-12 w-12" />
                <span className="text-xs font-semibold">No media</span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-foreground">
                  <Calendar className="h-3 w-3" /> {formatDate(item.createdAt)}
                </div>
                <div className="truncate text-xs font-medium text-muted-foreground">
                  {item.centerName}
                </div>
              </div>

              <div className={`relative p-4 ${PATTERN_BG}`}>
                <p className="mb-4 line-clamp-2 text-sm text-foreground">{item.about}</p>

                <div className="mb-4 grid gap-1.5 text-xs text-muted-foreground">
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
                <TagSection icon={Users} title="Educators" items={item.educators} tone="muted" />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => restoreItem(item)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase text-emerald-700 hover:bg-emerald-500/30 dark:text-emerald-400"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm(item)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-rose-500 px-3 py-1.5 text-xs font-bold uppercase text-white hover:bg-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <PermanentDeleteDialog
        open={Boolean(confirm)}
        title="Delete this reflection permanently?"
        onClose={() => setConfirm(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}

function TagSection({ icon: Icon, title, items, tone }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-foreground">
        <Icon className="h-3.5 w-3.5 text-emerald-600" /> {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={
              tone === "rose"
                ? "inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700"
                : "inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-muted/80 py-1 pl-1 pr-3 text-xs font-semibold text-foreground"
            }
          >
            <span
              className={
                tone === "rose"
                  ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-300 text-[9px] text-white"
                  : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700"
              }
            >
              {item.charAt(0)}
            </span>
            <span className="truncate">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-12 text-center">
      <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
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
