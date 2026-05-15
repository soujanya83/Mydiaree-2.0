import { useState } from "react";
import {
  Plus,
  Pencil,
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ActivityEditModal } from "./ActivityEditModal";

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
  if (hasTime || hasItem) return { label: "IN PROGRESS", tone: "warning" };

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

  if (def.key === "sleep") {
    const sleepTime = entry.sleepTime || "No sleep";
    const wakeTime = entry.wakeTime || "No wake";
    return `${sleepTime} - ${wakeTime}`;
  }

  if (def.key === "lunch") {
    const serve = entry.serve ?? entry.server ?? entry.noOfServe;
    return [entry.time, entry.item, serve ? `${serve} serve` : null].filter(Boolean).join(" - ");
  }

  return [entry.time, entry.item, entry.comments].filter(Boolean).join(" - ") || "Entry added";
}

function ActivityTile({ def, entry, onSave }) {
  const [editOpen, setEditOpen] = useState(false);
  const Icon = def.icon;
  const status = statusFor(def, entry);

  return (
    <>
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="group flex min-h-[96px] flex-col justify-between rounded-xl border border-border bg-background/80 p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <span
            className={cn(
              "inline-flex max-w-[112px] items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase leading-4",
              toneClasses[status.tone],
            )}
          >
            {status.label}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{def.label}</p>
            {entry ? (
              <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            ) : (
              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            )}
          </div>
          <p className="line-clamp-2 min-h-8 text-xs leading-4 text-muted-foreground">
            {detailFor(def, entry)}
          </p>
        </div>
      </button>

      <ActivityEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        activityLabel={def.label}
        initial={entry}
        onSave={(payload) => onSave?.(def.key, payload)}
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

export function ChildDiaryCard({ child, date, entries = {}, onSaveEntry }) {
  const initials = (child.name || "Child")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const totalActivities = ACTIVITY_DEFS.length;
  const completedActivities = Object.keys(entries).length;
  const meals = ["breakfast", "lunch", "afternoon_tea"].filter((k) => entries[k]).length;
  const naps = entries.sleep ? 1 : 0; // Keeping it 1 for now as it's a single category
  const progress = Math.round((completedActivities / totalActivities) * 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-12 w-12 shrink-0 border border-primary/15 bg-primary/10">
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
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Activities
        </div>
        <div className="grid max-h-[304px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {ACTIVITY_DEFS.map((def) => (
            <ActivityTile
              key={def.key}
              def={def}
              entry={entries[def.key]}
              onSave={(key, payload) => onSaveEntry?.(child.id, key, payload)}
            />
          ))}
        </div>
      </div>
    </article>
  );
}

export default ChildDiaryCard;
