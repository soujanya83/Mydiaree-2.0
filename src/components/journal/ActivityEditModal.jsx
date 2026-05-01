import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ActivityEditModal({ open, onOpenChange, activityLabel, initial, onSave }) {
  const [time, setTime] = useState("");
  const [item, setItem] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (open) {
      setTime(initial?.time || "");
      setItem(initial?.item || "");
      setComments(initial?.comments || "");
    }
  }, [open, initial]);

  const handleSave = () => {
    onSave?.({ time, item, comments });
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
          <div className="space-y-1.5">
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Item</Label>
            <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="e.g. Toast with butter" />
          </div>
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
          <Button size="sm" onClick={handleSave}>Save</Button>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityEditModal;