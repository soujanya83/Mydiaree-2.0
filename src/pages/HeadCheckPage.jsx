import { useMemo, useState } from "react";
import {
  Plus,
  Printer,
  Clock,
  Users,
  PenLine,
  Trash2,
  Save,
  ClipboardCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { toast } from "sonner";
import { HeadCheckPrintView } from "@/components/headcheck/HeadCheckPrintView";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const newRow = (time = "") => ({
  id: crypto.randomUUID(),
  time,
  count: "",
  signature: "",
});

export default function HeadCheckPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([newRow(nowHHMM())]);
  const [printOpen, setPrintOpen] = useState(false);

  const addRow = () => setRows((p) => [...p, newRow(nowHHMM())]);
  const removeRow = (id) =>
    setRows((p) => (p.length === 1 ? p : p.filter((r) => r.id !== id)));
  const update = (id, patch) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSave = () => {
    const incomplete = rows.some((r) => !r.time || !r.count || !r.signature);
    if (incomplete) {
      toast.error("Please fill in time, head count, and signature for every entry.");
      return;
    }
    console.log("Saving head checks", { date, centreId: activeCentreId, activeRoomId, rows });
    toast.success(`Saved ${rows.length} head check ${rows.length === 1 ? "entry" : "entries"}.`);
  };

  const hasEntries = rows.length > 0;

  return (
    <div>
      <PageHeader
        title="Head Check"
        description="Roll-call snapshots per room"
        breadcrumbs={[{ label: "Head Check" }]}
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

      {/* Top action bar */}
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setPrintOpen(true)}>
          <Printer className="mr-1.5 h-4 w-4" />
          View / Print
        </Button>
      </div>

      {/* Entries list */}
      {!hasEntries ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardCheck className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Head Checks Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click the "Add New" button below to create your first head check entry.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Index badge */}
              <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {idx + 1}
              </div>

              <div className="grid grid-cols-1 gap-4 pr-10 md:grid-cols-3">
                <FieldGroup icon={Clock} label="Time">
                  <Input
                    type="time"
                    value={row.time}
                    onChange={(e) => update(row.id, { time: e.target.value })}
                    className="h-11 text-base font-semibold text-primary"
                  />
                </FieldGroup>

                <FieldGroup icon={Users} label="Head Count">
                  <Input
                    type="number"
                    min="0"
                    value={row.count}
                    onChange={(e) => update(row.id, { count: e.target.value })}
                    placeholder="Enter count"
                    className="h-11 text-base"
                  />
                </FieldGroup>

                <FieldGroup icon={PenLine} label="Signature">
                  <Input
                    value={row.signature}
                    onChange={(e) => update(row.id, { signature: e.target.value })}
                    placeholder="Signature"
                    className="h-11 text-base"
                  />
                </FieldGroup>
              </div>

              {/* Delete */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actions */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6">
        <Button onClick={addRow} className="min-w-[140px]">
          <Plus className="mr-1.5 h-4 w-4" />
          Add New
        </Button>
        <Button onClick={handleSave} variant="secondary" className="min-w-[140px]">
          <Save className="mr-1.5 h-4 w-4" />
          Save
        </Button>
      </div>

      <HeadCheckPrintView
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        date={date}
        roomName={rooms.find(r => r.id === activeRoomId)?.name || "Room"}
        rows={rows}
      />
    </div>
  );
}

function FieldGroup({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}
