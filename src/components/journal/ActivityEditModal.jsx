import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ActivityEditModal({
  open,
  onOpenChange,
  activityLabel,
  initial,
  onSave,
}) {
  const [time, setTime] = useState("");
  const [item, setItem] = useState("");
  const [comments, setComments] = useState("");
  const [noOfServe, setNoOfServe] = useState("1");
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");

  const key = activityLabel?.toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    if (open) {
      setTime(initial?.time || "");
      setItem(initial?.item || "");
      setComments(initial?.comments || "");
      setNoOfServe(initial?.noOfServe || "1");
      setSleepTime(initial?.sleepTime || "");
      setWakeTime(initial?.wakeTime || "");
    }
  }, [open, initial]);

  const handleSave = () => {
    const payload = { comments };

    if (key === "sleep") {
      payload.sleepTime = sleepTime;
      payload.wakeTime = wakeTime;
    } else {
      payload.time = time;
    }

    if (
      ["breakfast", "lunch", "late_snacks", "bottle"].includes(key)
    ) {
      payload.item = item;
    }

    if (key === "lunch") {
      payload.noOfServe = noOfServe;
    }

    onSave?.(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
          <DialogTitle className="text-primary-foreground">
            Add/Edit {activityLabel}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-6">
          {key === "sleep" ? (
            <>
              <div className="space-y-1.5">
                <Label>Sleep Time</Label>
                <Input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Wake Time</Label>
                <Input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          )}

          {["breakfast", "lunch", "late_snacks", "bottle"].includes(key) && (
            <div className="space-y-1.5">
              <Label>Item</Label>
              <Input
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder="e.g. Toast with butter"
              />
            </div>
          )}

          {key === "lunch" && (
            <div className="space-y-1.5">
              <Label>No of Serve</Label>
              <Select value={noOfServe} onValueChange={setNoOfServe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select serving size" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <SelectItem key={val} value={String(val)}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Comments</Label>
            <Textarea
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Anything to share with families…"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-border bg-muted/30 px-6 py-3">
          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityEditModal;