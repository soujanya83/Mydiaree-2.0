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

export function AddIngredientModal({ open, onOpenChange, initial, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (open) setName(initial?.name || "");
  }, [open, initial]);

  const isEdit = !!initial?.id;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ id: initial?.id, name: trimmed });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="bg-primary px-5 py-4">
          <DialogTitle className="text-primary-foreground text-base font-semibold">
            {isEdit ? "Edit Ingredient" : "Add New Ingredient"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2 px-5 py-5">
            <Label htmlFor="ingredient-name" className="text-sm font-semibold">
              Ingredient Name
            </Label>
            <Input
              id="ingredient-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter ingredient name"
              autoFocus
            />
          </div>
          <DialogFooter className="border-t bg-muted/30 px-5 py-3">
            <Button type="submit">{isEdit ? "Update" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}