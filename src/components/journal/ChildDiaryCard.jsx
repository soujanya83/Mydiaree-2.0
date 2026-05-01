import { useState } from "react";
import {
  ChevronDown,
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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ActivityEditModal } from "./ActivityEditModal";

export const ACTIVITY_DEFS = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "morning_tea", label: "Morning Tea", icon: CupSoda },
  { key: "lunch", label: "Lunch", icon: Utensils },
  { key: "sleep", label: "Sleep", icon: BedDouble },
  { key: "afternoon_tea", label: "Afternoon Tea", icon: Cookie },
  { key: "late_snacks", label: "Late Snacks", icon: Apple },
  { key: "sunscreen", label: "Sunscreen", icon: Sun },
  { key: "toileting", label: "Toileting", icon: Baby },
  { key: "bottle", label: "Bottle", icon: Milk },
];

function statusFor(entry) {
  if (!entry) return { label: "NO UPDATE", tone: "muted" };
  if (entry.status) return entry.status;
  if (entry.time && entry.item) return { label: "COMPLETED", tone: "success" };
  if (entry.time || entry.item) return { label: "IN PROGRESS", tone: "warning" };
  return { label: "NO UPDATE", tone: "muted" };
}

const toneClasses = {
  muted: "bg-muted text-muted-foreground border-border",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
};

function ActivitySection({ def, entry, onSave }) {
  const [open, setOpen] = useState(def.key === "breakfast");
  const [editOpen, setEditOpen] = useState(false);
  const Icon = def.icon;
  const status = statusFor(entry);

  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30"
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{def.label}</span>
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              toneClasses[status.tone]
            )}
          >
            {status.label}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="relative rounded-lg border border-border bg-muted/20 p-3 pl-4">
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-primary/60" />
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 grid-cols-1 gap-1 text-xs sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-foreground">Time: </span>
                  <span className="text-muted-foreground">
                    {entry?.time || "No Update"}
                  </span>
                </p>
                <p>
                  <span className="font-semibold text-foreground">Item: </span>
                  <span className="text-muted-foreground">
                    {entry?.item || "No Update"}
                  </span>
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-foreground">Comments: </span>
                  <span className="text-muted-foreground">
                    {entry?.comments || "No Update"}
                  </span>
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => setEditOpen(true)}
                aria-label={entry ? "Edit entry" : "Add entry"}
              >
                {entry ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ActivityEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        activityLabel={def.label}
        initial={entry}
        onSave={(payload) => onSave?.(def.key, payload)}
      />
    </div>
  );
}

export function ChildDiaryCard({ child, date, entries = {}, onSaveEntry }) {
  const initials = `${child.firstName[0]}${child.lastName[0]}`;
  const totalActivities = Object.keys(entries).length;
  const meals = ["breakfast", "morning_tea", "lunch", "afternoon_tea", "late_snacks"]
    .filter((k) => entries[k]).length;
  const naps = entries.sleep ? 1 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 p-4 text-primary-foreground">
        <Avatar className="h-12 w-12 border-2 border-white/40">
          <AvatarFallback className="bg-white/20 text-sm font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-base font-bold">
            {child.firstName} {child.lastName}
          </h3>
          <p className="text-xs text-primary-foreground/90">
            <span className="font-medium">Age:</span> {child.age || "—"}
          </p>
          <p className="flex items-center gap-1 text-xs text-primary-foreground/90">
            <CalendarDays className="h-3 w-3" />
            Today: {new Date(date).toLocaleDateString("en-AU", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 bg-primary/5 px-4 py-3">
        {[
          { label: "Activities", value: totalActivities },
          { label: "Meals", value: meals },
          { label: "Naps", value: naps },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg font-bold text-primary">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div>
        {ACTIVITY_DEFS.map((def) => (
          <ActivitySection
            key={def.key}
            def={def}
            entry={entries[def.key]}
            onSave={(key, payload) => onSaveEntry?.(child.id, key, payload)}
          />
        ))}
      </div>
    </div>
  );
}

export default ChildDiaryCard;