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
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const empty = { name: "" };

export function IngredientTypeModal({ open, onOpenChange, initial, onSave, onDelete }) {
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...empty, ...initial } : empty);
    setIsSaving(false);
    setErrors({});
  }, [open, initial]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "name") setErrors((prev) => ({ ...prev, name: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let localErrors = {};
    if (!form.name.trim()) {
      localErrors.name = ["The name field is required."];
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error("Validation failed.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.({
        id: initial?.id,
        name: form.name.trim(),
      });
      onOpenChange(false);
    } catch (err) {
      if (err && err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial?.id) return;
    setIsDeleting(true);
    try {
      await onDelete?.(initial.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.message || "Failed to delete type");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <DialogHeader className="px-6 pb-2 pt-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Ingredient Type" : "Add Ingredient Type"}
          </DialogTitle>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            {isEdit ? "Update the ingredient type details" : "Create a new ingredient type category"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Type Name <span className="text-destructive font-bold ml-0.5">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g., Fresh Fruits"
                className={cn(
                  "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                  errors.name && "border-destructive focus-visible:ring-destructive/20"
                )}
              />
              {errors.name && (
                <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                  {errors.name[0]}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl font-semibold"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Type"
                )}
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
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
                disabled={isSaving}
                className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEdit ? "Save Changes" : "Add Type"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
