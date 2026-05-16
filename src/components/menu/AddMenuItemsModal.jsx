import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UtensilsCrossed, Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";


export function AddMenuItemsModal({ open, onOpenChange, mealId, mealLabel, dayLabel, recipes = [], selectedIds = [], onSave }) {
  const [picked, setPicked] = useState(selectedIds);


  useEffect(() => {
    if (open) setPicked(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mealId]);

  const items = recipes;


  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Add to {mealLabel}
              </DialogTitle>
              {dayLabel && (
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  {dayLabel} Schedule
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-2 space-y-1.5 max-h-[40vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                <p>No recipes found for this meal type.</p>
              </div>
            ) : (
              items.map((it) => {
                const isSelected = picked.includes(it.id);
                return (
                  <label
                    key={it.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all",
                      isSelected
                        ? "border-primary/40 bg-primary/5 shadow-sm"
                        : "border-transparent hover:bg-background hover:shadow-sm"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(it.id)}
                      className={cn(
                        "mt-0.5",
                        isSelected && "border-primary bg-primary text-primary-foreground"
                      )}
                    />
                    <div className="flex flex-col gap-0.5">
                      <span className={cn(
                        "text-sm font-bold leading-none",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {it.itemName || it.name}
                      </span>
                      {(it.notes || it.note) && (
                        <span className="text-xs font-medium text-muted-foreground line-clamp-2">
                          {it.notes || it.note}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
          <Button variant="ghost" className="rounded-xl font-semibold" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            onClick={() => {
              onSave?.(picked);
              onOpenChange(false);
            }}
          >
            {picked.length > 0 ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Save {picked.length > 0 ? `(${picked.length})` : "Items"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}