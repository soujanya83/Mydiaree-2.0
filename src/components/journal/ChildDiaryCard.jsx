import { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Coffee,
  CupSoda,
  Utensils,
  BedDouble,
  Cookie,
  Apple,
  Sun,
  Baby,
  Milk,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ActivityEditModal } from "./ActivityEditModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { IMG_BASE_API } from "../../api/imageapi";

const MULTI_ENTRY_ACTIVITIES = new Set(["sleep", "sunscreen", "toileting", "bottle"]);

const ACTIVITY_DEFS = [
  {
    key: "breakfast",
    label: "Breakfast",
    icon: Coffee,
    emptyStatus: { label: "NO UPDATE", tone: "info" },
  },
  {
    key: "morning_tea",
    label: "Morning Tea",
    icon: CupSoda,
    emptyStatus: { label: "NO UPDATE", tone: "info" },
  },
  {
    key: "lunch",
    label: "Lunch",
    icon: Utensils,
    emptyStatus: { label: "NO UPDATE", tone: "info" },
  },
  {
    key: "sleep",
    label: "Sleep",
    icon: BedDouble,
    emptyStatus: { label: "0 ENTRY", tone: "danger" },
  },
  {
    key: "afternoon_tea",
    label: "Afternoon Tea",
    icon: Cookie,
    emptyStatus: { label: "PENDING", tone: "muted_filled" },
  },
  {
    key: "late_snacks",
    label: "Late Snacks",
    icon: Apple,
    emptyStatus: { label: "PENDING", tone: "muted_filled" },
  },
  {
    key: "sunscreen",
    label: "Sunscreen",
    icon: Sun,
    emptyStatus: { label: "0 APPLICATIONS", tone: "danger" },
  },
  {
    key: "toileting",
    label: "Toileting",
    icon: Baby,
    emptyStatus: { label: "NO UPDATE", tone: "warning" },
  },
  {
    key: "bottle",
    label: "Bottle",
    icon: Milk,
    emptyStatus: { label: "PENDING", tone: "muted_filled" },
  },
];

function statusFor(def, entry) {
  if (Array.isArray(entry)) {
    if (entry.length === 0) return def.emptyStatus;
    const label =
      def.key === "sunscreen"
        ? `${entry.length} APPLICATION${entry.length === 1 ? "" : "S"}`
        : `${entry.length} ${entry.length === 1 ? "ENTRY" : "ENTRIES"}`;
    return { label, tone: "success" };
  }

  if (!entry) return def.emptyStatus;
  if (entry.status) {
    if (typeof entry.status === "object") return entry.status;
    const status = String(entry.status).toLowerCase();
    const tone = status === "solid" ? "danger" : status === "wet" ? "warning" : "success";
    return { label: status.toUpperCase(), tone };
  }

  // Generic in-progress/completed logic
  const hasTime = !!(entry.time || entry.sleepTime);
  const hasItem = !!entry.item;
  if (hasTime && hasItem) return { label: "COMPLETED", tone: "success" };
  if (hasTime || hasItem) return { label: "COMPLETED", tone: "success" };

  return def.emptyStatus;
}

const toneClasses = {
  muted: "border-border bg-muted text-muted-foreground",
  muted_filled: "border-border bg-muted text-muted-foreground",
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/35 bg-warning/10 text-warning",
  info: "border-info/30 bg-info/10 text-info",
  danger: "border-destructive/30 bg-destructive/10 text-destructive",
};

function detailFor(def, entry) {
  if (!entry) return "No update yet";

  // When mapping array items, detailFor is called per individual item
  if (Array.isArray(entry)) {
    if (entry.length === 0) return "No update yet";
    const latest = entry[entry.length - 1];
    const latestDetail = detailFor(def, latest);
    return entry.length === 1 ? latestDetail : `${entry.length} entries - latest ${latestDetail}`;
  }

  if (def.key === "sleep") {
    const sleepTime = entry.sleepTime || "No sleep";
    const wakeTime = entry.wakeTime || "Still resting";
    return `${sleepTime} - ${wakeTime}`;
  }

  if (def.key === "lunch") {
    const serve = entry.serve ?? entry.server ?? entry.noOfServe;
    return [entry.time, entry.item, serve ? `${serve} serve` : null].filter(Boolean).join(" - ");
  }

  return [entry.time, entry.item, entry.comments].filter(Boolean).join(" - ") || "Entry added";
}

function EntryDetails({ def, entry }) {
  if (!entry) return <span className="italic">No update yet</span>;

  const renderRow = (label, value) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-1 min-w-0 max-w-full">
        <span className="font-medium text-foreground shrink-0">{label}:</span>
        <span className="truncate text-muted-foreground" title={String(value)}>
          {value}
        </span>
      </div>
    );
  };

  const hasContent =
    entry.time ||
    entry.item ||
    entry.comments ||
    entry.status ||
    entry.sleepTime ||
    entry.serve ||
    entry.server ||
    entry.noOfServe;
  if (!hasContent) return <span className="italic">Entry added</span>;

  if (def.key === "sleep") {
    const sleepTime = entry.sleepTime || "No sleep";
    const wakeTime = entry.wakeTime || "Still resting";
    return (
      <div className="flex flex-col gap-1 min-w-0 w-full">
        {renderRow("Sleep", sleepTime)}
        {renderRow("Wake", wakeTime)}
        {renderRow("Note", entry.comments)}
      </div>
    );
  }

  if (def.key === "lunch") {
    const serve = entry.serve ?? entry.server ?? entry.noOfServe;
    return (
      <div className="flex flex-col gap-1 min-w-0 w-full">
        {renderRow("Time", entry.time)}
        {renderRow("Item", entry.item)}
        {renderRow("Serve", serve)}
        {renderRow("Note", entry.comments)}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 min-w-0 w-full">
      {renderRow("Time", entry.time)}
      {renderRow("Item", entry.item)}
      {renderRow("Status", entry.status)}
      {renderRow("Note", entry.comments)}
    </div>
  );
}

function ActivityTile({
  def,
  entry,
  onSave,
  onDelete,
  readOnly = false,
  canEdit: canEditProp,
  canDelete: canDeleteProp,
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, entryId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = def.icon;
  const status = statusFor(def, entry);
  const isMulti = MULTI_ENTRY_ACTIVITIES.has(def.key);
  const entries = Array.isArray(entry) ? entry : entry ? [entry] : [];
  const modalInitial = isMulti ? editingEntry : entry;
  const canEdit = !readOnly && !!onSave && canEditProp !== false;
  const canDelete = !readOnly && !!onDelete && canDeleteProp !== false;

  const openAdd = () => {
    if (!canEdit) return;
    setEditingEntry(null);
    setEditOpen(true);
  };

  const openEdit = (item) => {
    if (!canEdit) return;
    setEditingEntry(item);
    setEditOpen(true);
  };

  const openDelete = (entryId) => {
    setDeleteModal({ open: true, entryId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.entryId || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(def.key, deleteModal.entryId);
      setDeleteModal({ open: false, entryId: null });
    } catch {
      // error already toasted in parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn(
          "group flex flex-col rounded-xl border border-border bg-background/80 p-3 text-left shadow-sm transition-all hover:border-primary/35 hover:shadow-md",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <CollapsibleTrigger className="flex flex-1 items-start gap-3 text-left focus:outline-none">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{def.label}</p>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase leading-4",
                    toneClasses[status.tone],
                  )}
                >
                  {status.label}
                </span>
              </div>
            </div>
          </CollapsibleTrigger>

          {(canEdit || canDelete) && (
            <div className="flex shrink-0 items-center gap-1">
              {isMulti ? (
                canEdit && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90"
                    title={`Add ${def.label}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )
              ) : entry ? (
                <>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEdit(entries[0])}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                      title={`Edit ${def.label}`}
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                  {canDelete && entries[0]?.id && (
                    <button
                      type="button"
                      onClick={() => openDelete(entries[0].id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 bg-background shadow-sm hover:bg-destructive/10 hover:text-destructive"
                      title={`Delete ${def.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/70" />
                    </button>
                  )}
                </>
              ) : (
                canEdit && (
                  <button
                    type="button"
                    onClick={openAdd}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                    title={`Add ${def.label}`}
                  >
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <CollapsibleContent className="overflow-hidden transition-all duration-300 ease-in-out data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-collapsible-content-height)]">
          <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
            {entries.length > 0 ? (
              entries.map((item, index) => (
                <div
                  key={item.id || `${def.key}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-md bg-muted/40 px-3 py-2 text-sm transition hover:bg-muted/60 min-w-0"
                >
                  <div className="flex-1 text-xs leading-relaxed text-muted-foreground min-w-0 overflow-hidden">
                    <EntryDetails def={def} entry={item} />
                  </div>
                  {isMulti && (canEdit || canDelete) && (
                    <div className="mt-0.5 flex shrink-0 items-center gap-1">
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="rounded border border-border bg-background p-1.5 text-muted-foreground shadow-sm transition hover:bg-primary/10 hover:text-primary"
                          title="Edit"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                      {canDelete && item.id && (
                        <button
                          type="button"
                          onClick={() => openDelete(item.id)}
                          className="rounded border border-destructive/30 bg-background p-1.5 text-destructive/70 shadow-sm transition hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="px-1 py-1 text-xs italic text-muted-foreground">
                <EntryDetails def={def} entry={entry} />
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {canEdit && (
        <ActivityEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          activityLabel={def.label}
          initial={modalInitial}
          onSave={(payload) => onSave?.(def.key, payload)}
        />
      )}

      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, entryId: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title={`Delete ${def.label} entry?`}
        description="This entry will be permanently removed and cannot be recovered."
      />
    </>
  );
}

function formatDob(dob) {
  if (!dob) return "Not added";
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return dob;

  return parsed.toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ChildDiaryCard({
  child,
  date,
  entries = {},
  onSaveEntry,
  onDeleteEntry,
  readOnly = false,
  canEditEntries,
  canDeleteEntries,
}) {
  const canEdit = !readOnly && (canEditEntries ?? Boolean(onSaveEntry));
  const canDelete = !readOnly && (canDeleteEntries ?? Boolean(onDeleteEntry));
  const isReadOnly = !canEdit && !canDelete;
  const initials = (child.name || "Child")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalActivities = ACTIVITY_DEFS.length;
  const completedActivities = ACTIVITY_DEFS.filter((def) => {
    const entry = entries[def.key];
    return Array.isArray(entry) ? entry.length > 0 : Boolean(entry);
  }).length;
  const meals = ["breakfast", "lunch", "afternoon_tea"].filter((k) => entries[k]).length;
  const naps = Array.isArray(entries.sleep) ? entries.sleep.length : entries.sleep ? 1 : 0;
  const progress = Math.round((completedActivities / totalActivities) * 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0 border border-primary/15 bg-primary/10">
              {child.imageUrl && (
                <AvatarImage
                  src={
                    child.imageUrl.startsWith("http")
                      ? child.imageUrl
                      : `${IMG_BASE_API}${child.imageUrl}`
                  }
                  alt={child.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-sm font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-foreground">{child.name}</h3>
              <p className="text-xs text-muted-foreground">DOB: {formatDob(child.dob)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(date).toLocaleDateString("en-AU", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-center">
            <p className="text-lg font-bold leading-none text-primary">{progress}%</p>
            <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">Done</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Done", value: `${completedActivities}/${totalActivities}` },
              { label: "Meals", value: meals },
              { label: "Naps", value: naps },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-muted/50 px-2 py-2 text-center">
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Activities
          </div>
          {isReadOnly && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              View only
            </span>
          )}
        </div>
        <div className="flex max-h-[350px] flex-col gap-2 overflow-y-auto pr-1">
          {ACTIVITY_DEFS.map((def) => (
            <ActivityTile
              key={def.key}
              def={def}
              entry={entries[def.key]}
              readOnly={isReadOnly}
              canEdit={canEdit}
              canDelete={canDelete}
              onSave={(key, payload) => onSaveEntry?.(child.id, key, payload)}
              onDelete={(key, entryId) => onDeleteEntry?.(child.id, key, entryId)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export default ChildDiaryCard;
