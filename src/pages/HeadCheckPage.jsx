import { useCallback, useState } from "react";
import { ClipboardCheck, Clock, PenLine, Plus, Printer, Save, Trash2, Users } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { headChecksService } from "@/services/daily-operations/headChecksService";
import { useEffect } from "react";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const newRow = (time = "") => ({
  id: crypto.randomUUID(),
  time,
  count: "",
  signature: "",
  isNew: true,
});

export default function HeadCheckPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { id, isNew }

  const fetchHeadChecks = useCallback(async () => {
    if (!activeCentreId || !activeRoomId) return;
    setIsLoading(true);
    try {
      const response = await headChecksService.getHeadChecks({
        centerid: activeCentreId,
        roomid: activeRoomId,
        date: date,
      });
      if (response.data.status === "success" && response.data.data.headChecks) {
        const mapped = response.data.data.headChecks.map((hc) => {
          // Normalize "12h:53mm" or "1h:53mm" to "HH:mm"
          let normalizedTime = hc.time || "";
          if (normalizedTime.includes("h:")) {
            const [h, m] = normalizedTime.split("h:");
            normalizedTime = `${h.padStart(2, "0")}:${m.replace(/m+/g, "").padStart(2, "0")}`;
          }
          return {
            id: hc.id,
            time: normalizedTime,
            count: hc.headcount,
            signature: hc.signature,
            isNew: false,
          };
        });
        setRows(mapped.length > 0 ? mapped : [newRow(nowHHMM())]);
      } else {
        setRows([newRow(nowHHMM())]);
      }
    } catch (error) {
      console.error("Failed to fetch head checks", error);
      toast.error("Failed to load head checks");
      setRows([newRow(nowHHMM())]);
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId, activeRoomId, date]);

  useEffect(() => {
    fetchHeadChecks();
  }, [fetchHeadChecks]);

  const addRow = () => setRows((p) => [...p, newRow(nowHHMM())]);
  const update = (id, patch) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleSave = async () => {
    const incomplete = rows.some((r) => !r.time || !r.count || !r.signature);
    if (incomplete) {
      toast.error("Please fill in time, head count, and signature for every entry.");
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      rows.forEach((r) => {
        // Convert "12:53" back to "12h:53m" if needed,
        // but user's example had 1h:54m.
        // Let's format it as per their example: "Hh:mm"
        const [h, m] = r.time.split(":");
        const formattedTime = `${parseInt(h, 10)}h:${m}m`;

        fd.append("timePicker[]", formattedTime);
        fd.append("headCount[]", r.count);
        fd.append("signature[]", r.signature);
      });
      fd.append("roomid", activeRoomId);
      fd.append("centerid", activeCentreId);
      fd.append("diarydate", date);
      // headcheck flag is optional, but common practice to set if replacing
      // fd.append("headcheck", "1");

      const res = await headChecksService.storeHeadChecks(fd);
      if (res.data.status) {
        toast.success(res.data.message || "Head check records saved successfully.");
        fetchHeadChecks(); // Refresh to get real IDs
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save head checks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id, isNew) => {
    if (isNew) {
      // Local removal for unsaved rows
      setRows((p) => {
        const filtered = p.filter((r) => r.id !== id);
        return filtered.length === 0 ? [newRow(nowHHMM())] : filtered;
      });
      return;
    }

    setItemToDelete({ id, isNew });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { id } = itemToDelete;

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("headCheckId", id);
      const res = await headChecksService.deleteHeadCheck(fd);
      if (res.data.Status === "SUCCESS" || res.data.status === true) {
        toast.success(res.data.Message || "Record deleted");
        setDeleteModalOpen(false);
        setItemToDelete(null);
        fetchHeadChecks();
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete record");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!activeCentreId || !activeRoomId) {
      toast.error("Please select a centre and room first.");
      return;
    }

    setIsLoading(true);
    try {
      // Format YYYY-MM-DD to DD-MM-YYYY
      const [y, m, d] = date.split("-");
      const formattedDate = `${d}-${m}-${y}`;

      const blob = await headChecksService.printHeadChecks({
        centerid: activeCentreId,
        roomid: activeRoomId,
        diarydate: formattedDate,
      });

      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      window.open(url, "_blank");
    } catch (error) {
      console.error("Print failed", error);
      toast.error("Failed to generate PDF for printing");
    } finally {
      setIsLoading(false);
    }
  };

  const hasEntries = rows.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Head Check"
        description="Room safety roll-call snapshots with time, count, and staff sign-off."
        breadcrumbs={[{ label: "Head Check" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-card/80 p-2 shadow-sm">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[210px] bg-background">
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
              <SelectTrigger className="h-9 w-[170px] bg-background">
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
              className="h-9 w-[160px] bg-background"
            />
          </div>
        }
      />

      <section className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">Check entries</h3>
            <p className="text-sm text-muted-foreground">Add a row for each room roll-call.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isLoading}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={addRow} variant="outline" size="sm" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-4 sm:p-5">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-lg border border-border p-4">
                <div className="grid gap-4 md:grid-cols-[72px_1fr_1fr_1fr_42px]">
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-12" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasEntries ? (
          <div className="p-6 sm:p-10">
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No head checks yet</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Start a room roll-call with the current time, then save once staff have signed.
              </p>
              <Button onClick={addRow} className="mt-5">
                <Plus className="h-4 w-4" />
                Add first entry
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.map((row, idx) => (
              <div key={row.id} className="p-4 transition-colors hover:bg-muted/25 sm:p-5">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[72px_1fr_1fr_1.1fr_42px] lg:items-end">
                  <div className="flex items-center gap-3 lg:block">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-bold text-foreground shadow-sm">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <FieldGroup icon={Clock} label="Time">
                    <Input
                      type="time"
                      value={row.time}
                      onChange={(e) => update(row.id, { time: e.target.value })}
                      className="h-11 bg-background text-base font-semibold text-sky-700"
                    />
                  </FieldGroup>

                  <FieldGroup icon={Users} label="Head count">
                    <Input
                      type="number"
                      min="0"
                      value={row.count}
                      onChange={(e) => update(row.id, { count: e.target.value })}
                      placeholder="Enter count"
                      className="h-11 bg-background text-base"
                    />
                  </FieldGroup>

                  <FieldGroup icon={PenLine} label="Staff signature">
                    <Input
                      value={row.signature}
                      onChange={(e) => update(row.id, { signature: e.target.value })}
                      placeholder="Name or initials"
                      className="h-11 bg-background text-base"
                    />
                  </FieldGroup>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(row.id, row.isNew !== false)}
                    className="justify-self-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive lg:justify-self-end"
                    aria-label="Remove head check entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-muted/25 px-4 py-3 sm:px-5">
          <div className="flex gap-2">
            <Button onClick={addRow} variant="outline" size="sm" disabled={isLoading}>
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
            <Button onClick={handleSave} size="sm" disabled={isLoading}>
              <Save className="h-4 w-4" />
              Save log
            </Button>
          </div>
        </div>
      </section>

      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isLoading}
        title="Delete Head Check Record?"
        description="This will permanently remove this roll-call snapshot from the system."
      />
    </div>
  );
}

function FieldGroup({ icon: Icon, label, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}
