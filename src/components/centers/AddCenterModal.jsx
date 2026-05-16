import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building, Loader2 } from "lucide-react";

const empty = { name: "", addressStreet: "", addressCity: "", addressState: "", addressZip: "" };

export function AddCenterModal({ open, onOpenChange, initial, onSave }) {
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...empty, ...initial } : empty);
    setIsSaving(false);
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave?.({
        id: initial?.id,
        name: form.name.trim(),
        addressStreet: form.addressStreet.trim(),
        addressCity: form.addressCity.trim(),
        addressState: form.addressState.trim(),
        addressZip: form.addressZip.trim(),
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {isEdit ? "Edit Center" : "Add New Center"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {isEdit ? "Update the details of your center" : "Create a new center for your organization"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Center Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">Center Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., Melbourne Early Learning"
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">Street Address</Label>
                  <Input
                    value={form.addressStreet}
                    onChange={(e) => set("addressStreet", e.target.value)}
                    placeholder="123 Education Lane"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">City</Label>
                  <Input
                    value={form.addressCity}
                    onChange={(e) => set("addressCity", e.target.value)}
                    placeholder="Melbourne"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">State</Label>
                  <Input
                    value={form.addressState}
                    onChange={(e) => set("addressState", e.target.value)}
                    placeholder="VIC"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Postal Code</Label>
                  <Input
                    value={form.addressZip}
                    onChange={(e) => set("addressZip", e.target.value)}
                    placeholder="3000"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-semibold"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSaving || !form.name.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Save Changes" : "Add Center"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
