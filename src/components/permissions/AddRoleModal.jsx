import { useEffect, useState } from "react";
import { Shield, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddRoleModal({
  open,
  onOpenChange,
  onSave,
  initialName = "",
  mode = "add",
  isSaving = false,
}) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const handleSave = async () => {
    if (!name.trim()) return;
    const saved = await onSave(name.trim());
    if (saved !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl gap-0">
        <DialogHeader className="relative flex-row items-center gap-4 bg-gradient-to-br from-primary to-primary/80 px-8 py-6 text-white space-y-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <Shield className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === "edit" ? "Edit Role Template" : "New Role Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-8 py-8 bg-muted/10">
          <div className="space-y-2.5">
            <Label htmlFor="role-name" className="text-sm font-bold text-muted-foreground uppercase tracking-widest ml-1">Role Name</Label>
            <Input
              id="role-name"
              placeholder="e.g., Senior Educator, Room Leader..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="h-12 rounded-2xl border-muted-foreground/20 bg-card px-4 text-base shadow-sm focus:ring-primary/20"
            />
            <p className="text-[11px] text-muted-foreground ml-1 italic">
              Give this role a clear, descriptive name to use for quick permission assignments.
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 bg-card px-8 py-5 border-t border-border/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full px-6 font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
            className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-8 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? "Saving..." : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {mode === "edit" ? "Update Template" : "Create Template"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
