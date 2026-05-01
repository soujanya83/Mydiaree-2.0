import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MENU_ITEM_LIBRARY } from "./menuData";

export function AddMenuItemsModal({ open, onOpenChange, mealId, mealLabel, dayLabel, selectedIds = [], onSave }) {
  const [picked, setPicked] = useState(selectedIds);

  useEffect(() => {
    if (open) setPicked(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mealId]);

  const items = MENU_ITEM_LIBRARY[mealId] || [];

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="bg-primary text-primary-foreground px-5 py-4 space-y-0">
          <DialogTitle className="text-primary-foreground text-base">
            Add Items for {mealLabel}
            {dayLabel ? <span className="font-normal opacity-80"> · {dayLabel}</span> : null}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items available for this meal.</p>
          ) : (
            items.map((it) => (
              <label
                key={it.id}
                className="flex items-start gap-3 cursor-pointer rounded-md p-2 hover:bg-accent/50"
              >
                <Checkbox
                  checked={picked.includes(it.id)}
                  onCheckedChange={() => toggle(it.id)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-semibold text-foreground">{it.name}</div>
                  {it.note && <div className="text-xs text-muted-foreground">{it.note}</div>}
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3 bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onSave?.(picked);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}