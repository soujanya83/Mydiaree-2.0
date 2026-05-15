import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";

export default function AddQipModal({ open, onOpenChange, onSubmit, initial }) {
  const { centres, activeCentreId } = useCentreStore();
  const [name, setName] = useState("");
  const [centerId, setCenterId] = useState("");

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setCenterId(initial?.centerId || activeCentreId || "");
    }
  }, [open, initial, activeCentreId]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a QIP name");
      return;
    }
    if (!centerId) {
      toast.error("Please select a centre");
      return;
    }
    onSubmit?.({ 
      name: name.trim(), 
      center_id: centerId 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <div className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white">
          <Sparkles className="h-5 w-5" />
          <DialogHeader className="space-y-0">
            <DialogTitle className="text-white">
              {initial ? "Edit QIP" : "Add New QIP"}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="space-y-4 p-6">
          <div className="space-y-1.5">
            <Label htmlFor="qip-name">QIP Name<span className="text-destructive"> *</span></Label>
            <Input
              id="qip-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Create By April 2026"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label>Centre</Label>
            <Select value={String(centerId)} onValueChange={setCenterId}>
              <SelectTrigger><SelectValue placeholder="Select a centre" /></SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl bg-muted/30 p-4 border border-dashed">
            <p className="text-xs text-muted-foreground text-center">
              Additional QIP sections and details can be configured after creation.
            </p>
          </div>
        </div>
        <DialogFooter className="bg-muted/30 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {initial ? "Save Changes" : "Create QIP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}