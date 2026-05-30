import { useEffect, useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
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
import { CentreSelect } from "@/components/common/CentreSelect";

export default function AddQipModal({ open, onOpenChange, onSubmit, initial }) {
  const { centres, activeCentreId } = useCentreStore();
  const [name, setName] = useState("");
  const [centerId, setCenterId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setCenterId(initial?.centerId || activeCentreId || "");
    }
  }, [open, initial, activeCentreId]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a QIP name");
      return;
    }
    if (!centerId) {
      toast.error("Please select a centre");
      return;
    }
    
    setIsSaving(true);
    try {
      await onSubmit?.({ 
        name: name.trim(), 
        center_id: centerId 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 h-32 w-32 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {initial ? "Edit QIP Report" : "Create New QIP"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {initial ? "Modify the details of your quality plan" : "Define a new quality improvement initiative"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          <div className="space-y-2">
            <Label htmlFor="qip-name" className="text-sm font-bold px-1 text-foreground/80">QIP Name *</Label>
            <Input
              id="qip-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quality Improvement Plan 2026"
              className="h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/20 font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-bold px-1 text-foreground/80">Select Centre *</Label>
            <CentreSelect
              value={centerId}
              onValueChange={setCenterId}
              icon={null}
              triggerClassName="h-11 rounded-xl bg-background/50 border-border/60 focus-visible:ring-primary/20 font-medium"
              contentClassName="rounded-xl border-border/60 backdrop-blur"
              placeholder="Select a centre"
            />
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-muted/20 p-4 border border-border/40 group/note transition-colors hover:bg-muted/30">
            <div className="flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5 opacity-60" />
              <p className="text-[11px] font-bold text-muted-foreground leading-relaxed uppercase tracking-wider">
                Note: Additional QIP sections, goals, and specific measures can be meticulously configured once the report is created.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border/50 px-6 py-4 bg-muted/10">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="rounded-xl font-bold h-11 hover:bg-muted transition-all"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-xl h-11 px-8 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              initial ? "Update QIP" : "Create QIP"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}