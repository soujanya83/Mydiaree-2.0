import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  Search,
  Moon,
  Clock,
  Activity as ActivityIcon,
  Thermometer,
  StickyNote,
  PenLine,
  Printer,
  ChevronDown,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ... constants ...

export default function SleepCheckPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const children = useChildrenStore((s) => s.children);
  const isLoading = useChildrenStore((s) => s.isLoading);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [cards, setCards] = useState({}); // { [childId]: { selected, openEntryId, entries: [] } }

  const visibleChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeRoom = rooms.find((r) => String(r.id) === String(activeRoomId));
    
    return children.filter((c) => {
      if (activeRoom && String(c.room) !== String(activeRoom.name)) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [children, search, activeRoomId, rooms]);

  const getCard = (id) =>
    cards[id] ?? { selected: false, openEntryId: null, entries: [] };

  const handleSaveAll = () => {
    const totalEntries = Object.values(cards).reduce(
      (n, c) => n + (c.entries?.length || 0),
      0
    );
    if (totalEntries === 0) {
      toast.error("Add at least one sleep check entry before saving.");
      return;
    }
    console.log("Saving sleep checks", { date, centreId: activeCentreId, activeRoomId, cards });
    toast.success(`Saved ${totalEntries} sleep check ${totalEntries === 1 ? "entry" : "entries"}.`);
  };

  return (
    <div>
      <PageHeader
        title="Sleep Check"
        description="10-minute sleep monitoring records per child"
        breadcrumbs={[{ label: "Sleep Check" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeRoomId} onValueChange={setActiveRoom}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-[160px]"
            />
          </div>
        }
      />

      {/* Search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by child name…"
            className="h-10 pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Printer className="mr-1.5 h-4 w-4" />
          View / Print
        </Button>
      </div>

      {/* Children list */}
      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading children...</div>
      ) : visibleChildren.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No children found in this room.
        </div>
      ) : (
        <div className="space-y-5">
          {visibleChildren.map((child) => {
            const card = getCard(child.id);
            const initials = (child.name || "??").split(" ").map(n => n[0]).join("");
            return (
              <article
                key={child.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Card header */}
                <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {child.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {rooms.find(r => r.id === activeRoomId)?.name || "—"}
                      </p>
                    </div>
                  </div>
                  <Checkbox
                    checked={card.selected}
                    onCheckedChange={(v) => toggleSelect(child.id, v)}
                    aria-label={`Select ${child.name}`}
                  />
                </header>
                {/* ... rest of the card content stays same ... */}

                {/* Column headers */}
                <div className="hidden grid-cols-6 gap-2 bg-muted/40 px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
                  <div>Time</div>
                  <div>Breathing</div>
                  <div>Body Temp</div>
                  <div>Notes</div>
                  <div>Signature</div>
                  <div>Action</div>
                </div>

                {/* Entries */}
                <div className="divide-y divide-border">
                  {card.entries.length === 0 && (
                    <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                      No entries yet. Tap “Add 10-min Entry” to begin.
                    </div>
                  )}

                  {card.entries.map((entry) => {
                    const open = card.openEntryId === entry.id;
                    return (
                      <div key={entry.id}>
                        {/* Summary row */}
                        <button
                          type="button"
                          onClick={() => toggleOpen(child.id, entry.id)}
                          className="grid w-full grid-cols-2 items-center gap-2 px-5 py-3 text-left text-sm hover:bg-muted/30 md:grid-cols-6 md:text-center"
                        >
                          <div className="font-semibold text-primary md:font-medium md:text-foreground">
                            {entry.time || "—"}
                          </div>
                          <div className="truncate text-muted-foreground md:text-foreground">
                            {entry.breathing || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.temperature || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.notes || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.signature || "—"}
                          </div>
                          <div className="hidden items-center justify-center md:flex">
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                open && "rotate-180"
                              )}
                            />
                          </div>
                        </button>

                        {/* Expanded editor */}
                        {open && (
                          <div className="border-t border-dashed border-border bg-muted/20 px-5 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              <Field icon={Clock} label="Time">
                                <Input
                                  type="time"
                                  value={entry.time}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { time: e.target.value })
                                  }
                                />
                              </Field>
                              <Field icon={ActivityIcon} label="Breathing">
                                <Select
                                  value={entry.breathing}
                                  onValueChange={(v) =>
                                    updateEntry(child.id, entry.id, { breathing: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BREATHING_OPTIONS.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                              <Field icon={Thermometer} label="Body Temperature">
                                <Select
                                  value={entry.temperature}
                                  onValueChange={(v) =>
                                    updateEntry(child.id, entry.id, { temperature: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TEMPERATURE_OPTIONS.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                              <Field icon={StickyNote} label="Notes" className="md:col-span-2">
                                <Textarea
                                  rows={2}
                                  value={entry.notes}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { notes: e.target.value })
                                  }
                                  placeholder="Sleep check list notes…"
                                />
                              </Field>
                              <Field icon={PenLine} label="Signature">
                                <Input
                                  value={entry.signature}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { signature: e.target.value })
                                  }
                                  placeholder="signature"
                                />
                              </Field>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeEntry(child.id, entry.id)}
                              >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Remove
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => toggleOpen(child.id, entry.id)}
                              >
                                <Save className="mr-1.5 h-4 w-4" />
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-start border-t border-border bg-muted/20 px-5 py-3">
                  <Button size="sm" onClick={() => addEntry(child.id)} className="rounded-full">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add 10-min Entry
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {visibleChildren.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6">
          <Button onClick={handleSaveAll} className="min-w-[200px]">
            <Save className="mr-1.5 h-4 w-4" />
            Save All Sleep Checks
          </Button>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </p>
      {children}
    </div>
  );
}