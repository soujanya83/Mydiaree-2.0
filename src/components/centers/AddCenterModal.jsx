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

const empty = { name: "", addressStreet: "", addressCity: "", addressState: "", addressZip: "" };

export function AddCenterModal({ open, onOpenChange, initial, onSave }) {
  const [form, setForm] = useState(empty);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...empty, ...initial } : empty);
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      id: initial?.id,
      name: form.name.trim(),
      addressStreet: form.addressStreet.trim(),
      addressCity: form.addressCity.trim(),
      addressState: form.addressState.trim(),
      addressZip: form.addressZip.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-primary px-5 py-4">
          <DialogTitle className="text-primary-foreground text-base font-semibold">
            {isEdit ? "Edit Center" : "Add New Center"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Center Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Center Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter center name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Street Address</Label>
                  <Input
                    value={form.addressStreet}
                    onChange={(e) => set("addressStreet", e.target.value)}
                    placeholder="Enter street address"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">City</Label>
                  <Input
                    value={form.addressCity}
                    onChange={(e) => set("addressCity", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">State</Label>
                  <Input
                    value={form.addressState}
                    onChange={(e) => set("addressState", e.target.value)}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Postal Code</Label>
                  <Input
                    value={form.addressZip}
                    onChange={(e) => set("addressZip", e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/30 px-5 py-3 gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
