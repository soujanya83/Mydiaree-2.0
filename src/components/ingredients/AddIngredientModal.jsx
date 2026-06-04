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
import { Carrot, Loader2 } from "lucide-react";
import { useIngredientStore } from "@/stores/ingredientStore";

export function AddIngredientModal({ open, onOpenChange, initial, onSave, preSelectedTypeId }) {
  const [name, setName] = useState("");
  const [ingredientTypeId, setIngredientTypeId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { ingredientTypes } = useIngredientStore();

  useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setIngredientTypeId(initial?.ingredient_type_id?.toString() || preSelectedTypeId?.toString() || "");
      setIsSaving(false);
    }
  }, [open, initial, preSelectedTypeId]);

  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSaving) return;
    if (!isEdit && !ingredientTypeId) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.({
        id: initial?.id,
        name: trimmed,
        ingredientTypeId: isEdit ? undefined : ingredientTypeId,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Carrot className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {isEdit ? "Edit Ingredient" : "Add Ingredient"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {isEdit ? "Update the details of your ingredient" : "Add a new item to your pantry"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient-name" className="text-sm font-bold text-foreground">
                Ingredient Name
              </Label>
              <Input
                id="ingredient-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Organic Honey"
                autoFocus
                className="h-11 rounded-xl bg-muted/40 px-4 focus-visible:ring-primary/20 font-medium"
              />
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label htmlFor="ingredient-type" className="text-sm font-bold text-foreground">
                  Type <span className="text-destructive font-bold ml-0.5">*</span>
                </Label>
                <select
                  id="ingredient-type"
                  value={ingredientTypeId}
                  onChange={(e) => setIngredientTypeId(e.target.value)}
                  className="h-11 w-full rounded-xl bg-muted/40 px-4 focus-visible:ring-primary/20 font-medium border border-border"
                >
                  <option value="">Select a type</option>
                  {ingredientTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              disabled={isSaving || !name.trim() || (!isEdit && !ingredientTypeId)}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Save Changes" : "Add Ingredient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}