import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useIngredientStore } from "@/stores/ingredientStore";
import { toast } from "sonner";

export function MoveIngredientModal({ open, onOpenChange, ingredient }) {
  const [targetTypeId, setTargetTypeId] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const { ingredientTypes, moveIngredientType } = useIngredientStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetTypeId || !ingredient?.id) return;

    setIsMoving(true);
    try {
      await moveIngredientType(ingredient.id, targetTypeId);
      toast.success("Ingredient moved successfully");
      onOpenChange(false);
      setTargetTypeId("");
    } catch (error) {
      toast.error(error?.message || "Failed to move ingredient");
    } finally {
      setIsMoving(false);
    }
  };

  const currentType = ingredientTypes.find((t) => t.id === ingredient?.ingredient_type_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <DialogHeader className="px-6 pb-2 pt-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Move Ingredient
          </DialogTitle>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Move "{ingredient?.name}" to a different type
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/20">
              <div className="flex-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  From
                </Label>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {currentType?.name || "Unknown"}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  To
                </Label>
                <select
                  value={targetTypeId}
                  onChange={(e) => setTargetTypeId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg bg-background px-3 focus-visible:ring-primary/20 font-medium text-sm border border-border"
                >
                  <option value="">Select type</option>
                  {ingredientTypes
                    .filter((t) => t.id !== ingredient?.ingredient_type_id)
                    .map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                setTargetTypeId("");
              }}
              className="rounded-xl font-semibold"
              disabled={isMoving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!targetTypeId || isMoving}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isMoving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                "Move Ingredient"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
