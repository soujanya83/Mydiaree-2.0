import { useMemo, useState } from "react";
import {
  Coffee,
  CupSoda,
  Utensils,
  BedDouble,
  Cookie,
  Apple,
  Sun,
  Baby,
  Milk,
  Search,
  Check,
  X,
  CalendarDays,
  Users,
  ClipboardEdit,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChildrenStore } from "@/stores/childrenStore";

const ACTIVITIES = [
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

export function NewEntryModal({ open, onOpenChange, onSubmit }) {
  const children = useChildrenStore((s) => s.children);
  const [activity, setActivity] = useState("breakfast");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [notes, setNotes] = useState("");
  const [time, setTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [server, setServer] = useState("1");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("wet");

  const current = ACTIVITIES.find((a) => a.key === activity);
  const Icon = current.icon;

  const filteredChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return children;
    return children.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [search, children]);

  const allSelected =
    filteredChildren.length > 0 &&
    filteredChildren.every((c) => selected.includes(c.id));

  const toggleChild = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) =>
        prev.filter((id) => !filteredChildren.some((c) => c.id === id))
      );
    } else {
      setSelected((prev) =>
        Array.from(new Set([...prev, ...filteredChildren.map((c) => c.id)]))
      );
    }
  };

  const reset = () => {
    setActivity("breakfast");
    setSearch("");
    setSelected([]);
    setNotes("");
    setTime("");
    setWakeTime("");
    setItem("");
    setAmount("");
    setServer("1");
    setSignature("");
    setStatus("wet");
  };

  const handleSave = () => {
    onSubmit?.({
      activity,
      date,
      children: selected,
      time,
      wakeTime,
      item,
      amount,
      server,
      signature,
      status,
      notes,
    });
    reset();
    onOpenChange(false);
  };

  const valueLabel =
    activity === "toileting"
      ? "Type"
      : activity === "sunscreen"
      ? "Brand / SPF"
      : activity === "bottle"
      ? "Volume (ml)"
      : `${current.label} Item`;

  const timeLabel =
    activity === "sleep"
      ? "Sleep Time"
      : activity === "sunscreen"
      ? "Applied At"
      : `${current.label} Time`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-primary to-primary/80 px-6 py-4 pr-12 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white/15 p-2">
              <ClipboardEdit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Add New Activity Entry</h2>
              <p className="text-xs text-primary-foreground/80">
                Log a moment from today's routine
              </p>
            </div>
          </div>
        </div>

        <div className="grid max-h-[75vh] grid-cols-1 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="border-b border-border bg-muted/30 p-4 md:border-b-0 md:border-r">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Select Activity
            </p>
            <ScrollArea className="md:h-[60vh]">
              <div className="flex flex-row gap-1 md:flex-col">
                {ACTIVITIES.map((a) => {
                  const ItemIcon = a.icon;
                  const active = a.key === activity;
                  return (
                    <button
                      key={a.key}
                      onClick={() => setActivity(a.key)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-foreground/70 hover:bg-card hover:text-foreground"
                      )}
                    >
                      <ItemIcon className="h-4 w-4" />
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* Main content */}
          <ScrollArea className="md:h-[75vh]">
            <div className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">
                    Add {current.label} Entry
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in details below — fields adapt to activity type.
                  </p>
                </div>
              </div>

              {/* General Info */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h4>General Information</h4>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Select Children</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search children…"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    Select All
                  </label>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {selected.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {filteredChildren.map((c) => {
                    const isSel = selected.includes(c.id);
                    const initials = (c.name || "CH")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleChild(c.id)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all",
                          isSel
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {c.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.room || "Room"}
                          </p>
                        </div>
                        {isSel && (
                          <div className="rounded-full bg-primary p-1 text-primary-foreground">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {filteredChildren.length === 0 && (
                    <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No children match "{search}".
                    </div>
                  )}
                </div>
              </section>

              {/* Activity Details */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardEdit className="h-4 w-4 text-primary" />
                  <h4>Activity Details</h4>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{timeLabel}</Label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                  {activity === "sleep" ? (
                    <div className="space-y-1.5">
                      <Label>Wake Time</Label>
                      <Input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                      />
                    </div>
                  ) : (
                    ["breakfast", "lunch", "late_snacks", "bottle", "sunscreen", "toileting"].includes(activity) && (
                      <div className="space-y-1.5">
                        <Label>{valueLabel}</Label>
                        <Input
                          value={item}
                          onChange={(e) => setItem(e.target.value)}
                          placeholder={`e.g. ${
                            activity === "bottle"
                              ? "120ml formula"
                              : activity === "sunscreen"
                              ? "Cancer Council SPF 50+"
                              : "Toast with butter"
                          }`}
                        />
                      </div>
                    )
                  )}
                </div>

                {activity === "lunch" && (
                  <div className="space-y-1.5">
                    <Label>No of Serve (Server)</Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setServer(String(val))}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                            server === String(val)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activity === "toileting" && (
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <div className="flex flex-wrap gap-2">
                      {["wet", "dirty", "dry", "potty", "toilet"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition",
                            status === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {["sunscreen", "toileting"].includes(activity) && (
                  <div className="space-y-1.5">
                    <Label>Signature (Optional)</Label>
                    <Input
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                )}

                {(activity === "breakfast" ||
                  activity === "morning_tea" ||
                  activity === "lunch" ||
                  activity === "afternoon_tea" ||
                  activity === "late_snacks") && (
                  <div className="space-y-2">
                    <Label>Amount Eaten</Label>
                    <div className="flex flex-wrap gap-2">
                      {["all", "most", "some", "none"].map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => setAmount(a)}
                          className={cn(
                            "rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition",
                            amount === a
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                          )}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything to share with families…"
                  />
                </div>
              </section>
              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs">
                  <span className="font-medium text-muted-foreground">
                    Logging for:
                  </span>
                  {selected.slice(0, 6).map((id) => {
                    const c = children.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <Badge key={id} variant="secondary">
                        {c.name}
                      </Badge>
                    );
                  })}
                  {selected.length > 6 && (
                    <Badge variant="secondary">+{selected.length - 6} more</Badge>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {selected.length === 0
              ? "Select at least one child to continue."
              : `Ready to save for ${selected.length} ${
                  selected.length === 1 ? "child" : "children"
                }.`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={selected.length === 0}>
              <Check className="mr-1.5 h-4 w-4" />
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewEntryModal;