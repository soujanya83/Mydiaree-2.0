import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, Calendar, Clock, MessageSquare, Check, X } from "lucide-react";
import { TIME_SLOTS } from "./ptmData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function fmtParts(iso) {
  const d = new Date(iso);
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    year: d.getFullYear(),
    long: d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }),
  };
}

export default function ReschedulePtmModal({ open, onOpenChange, child, onConfirm }) {
  const [date, setDate] = useState(child?.date || "");
  const [slot, setSlot] = useState(child?.slot || TIME_SLOTS[0]);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (child) {
      setDate(child.date);
      setSlot(child.slot);
      setReason("");
    }
  }, [child]);

  if (!child) return null;
  const parts = fmtParts(date);

  const handleConfirm = () => {
    onConfirm({ date, slot, reason });
    toast.success("PTM rescheduled successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="bg-primary px-6 py-5 text-center text-primary-foreground">
          <div className="flex items-center justify-center gap-2 text-lg font-semibold">
            <CalendarCheck className="h-5 w-5" />
            Reschedule PTM
          </div>
          <p className="mt-1 text-sm opacity-90">
            Update schedule for <span className="font-semibold">{child.name}</span>
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              Select Date & Time Slot
            </div>
            <div className="space-y-2">
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-3 py-2 text-sm">
                <span className="font-semibold">Date:</span> {parts.long}
              </div>
              <div className="rounded-md border-l-4 border-primary bg-muted/40 px-3 py-2 text-sm">
                <span className="font-semibold">Slot:</span> {slot}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              <div className="mt-3 rounded-lg border-2 border-primary bg-background p-4 text-center">
                <div className="text-xs text-muted-foreground">{parts.weekday}</div>
                <div className="text-3xl font-bold text-foreground">{parts.day}</div>
                <div className="text-xs text-muted-foreground">{parts.month} {parts.year}</div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-primary" /> Time Slots
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.slice(0, 6).map((s) => {
                  const active = s === slot;
                  return (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-lg border p-3 text-center text-xs font-medium transition",
                        active ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"
                      )}
                    >
                      <Clock className={cn("mx-auto mb-1 h-4 w-4 rounded-full p-0.5", active ? "bg-primary text-primary-foreground" : "bg-muted")} />
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4 text-primary" /> Reason (Optional)
            </div>
            <Textarea
              rows={3}
              placeholder="Enter reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 border-t bg-muted/30 px-6 py-4">
          <Button onClick={handleConfirm}>
            <Check className="h-4 w-4" /> Confirm Reschedule
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" /> Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}