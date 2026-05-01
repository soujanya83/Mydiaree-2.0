import { useMemo, useState } from "react";
import { Users, Search, X, Send, Info } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { initialParents } from "@/components/parents/parentsData";
import { cn } from "@/lib/utils";

function ParentAvatar({ name }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
      {letter}
    </div>
  );
}

export default function SendReEnrollmentEmailModal({ open, onOpenChange }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set());

  const parents = useMemo(
    () =>
      initialParents
        .filter((p) => p.email)
        .map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          childrenCount: p.children?.length || 0,
        })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parents;
    return parents.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    );
  }, [parents, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = (on) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) filtered.forEach((p) => next.add(p.id));
      else filtered.forEach((p) => next.delete(p.id));
      return next;
    });
  };

  const handleClose = () => {
    setSearch("");
    setSelected(new Set());
    onOpenChange(false);
  };

  const handleSend = () => {
    if (selected.size === 0) {
      toast.error("Select at least one parent");
      return;
    }
    toast.success(`Re-enrollment link sent to ${selected.size} parent(s)`);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-3xl overflow-hidden p-0 gap-0">
        {/* Header */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4 text-white [&_.dialog-close]:text-white">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Send Re-Enrollment Link to Parents</h2>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search parents by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Select all */}
          <label className="flex items-center gap-2 px-1">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(on) => toggleAll(!!on)}
            />
            <span className="text-sm font-semibold">Select All Parents</span>
          </label>

          <div className="border-t" />

          {/* List */}
          <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {filtered.map((p) => {
              const checked = selected.has(p.id);
              return (
                <label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-xl border p-3 transition",
                    checked ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleOne(p.id)}
                  />
                  <ParentAvatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      ✉ {p.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      👤 {p.childrenCount} child(ren)
                    </p>
                  </div>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                No parents match your search.
              </div>
            )}
          </div>

          {/* Selected count */}
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Selected: <span className="font-bold text-primary">{selected.size}</span> parents
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-6 py-4">
          <Button variant="secondary" onClick={handleClose}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selected.size === 0}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90"
          >
            <Send className="h-4 w-4" /> Send Emails ({selected.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}