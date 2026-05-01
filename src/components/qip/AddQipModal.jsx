import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { qipCenters } from "./qipData";

export default function AddQipModal({ open, onOpenChange, onSubmit, initial }) {
  const [name, setName] = useState("");
  const [educators, setEducators] = useState("");
  const [center, setCenter] = useState(qipCenters[0]);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setEducators(initial?.educators || "");
      setCenter(initial?.center || qipCenters[0]);
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a QIP name");
      return;
    }
    onSubmit?.({ name: name.trim(), educators: educators.trim(), center });
    onOpenChange(false);
    toast.success(initial ? "QIP updated" : "QIP created");
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
            <Label htmlFor="qip-educators">Educators</Label>
            <Textarea
              id="qip-educators"
              value={educators}
              onChange={(e) => setEducators(e.target.value)}
              placeholder="Educators / contributors"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Center</Label>
            <Select value={center} onValueChange={setCenter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {qipCenters.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="bg-muted/30 px-6 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{initial ? "Save Changes" : "Create QIP"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}