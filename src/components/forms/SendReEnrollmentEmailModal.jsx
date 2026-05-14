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
      <DialogContent className="max-w-3xl overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl gap-0">
        {/* Header */}
        <div className="relative flex items-center gap-3 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-8 py-6 text-white [&_.dialog-close]:text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
            <Users className="h-5 w-5" />
          </div>
          <h2 className="relative text-xl font-bold tracking-tight">Send Re-Enrollment Link</h2>
        </div>

        {/* Body */}
        <div className="space-y-5 bg-muted/10 p-8">
          {/* Search */}
          <div className="group relative flex items-center gap-3 rounded-full border border-border/50 bg-card p-1.5 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-focus-within:bg-primary group-focus-within:text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder="Search parents by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-0 bg-transparent px-2 text-base shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Select all */}
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition-colors hover:bg-muted/50">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(on) => toggleAll(!!on)}
              className="h-5 w-5 rounded-md data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <span className="text-sm font-semibold text-foreground">Select All Parents</span>
          </label>

          <div className="border-t" />

          {/* List */}
          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((p) => {
              const checked = selected.has(p.id);
              return (
                <label
                  key={p.id}
                  className={cn(
                    "group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:shadow-md",
                    checked 
                      ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                      : "border-border/50 bg-card hover:border-primary/30"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleOne(p.id)}
                    className="h-5 w-5 rounded-md transition-all data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <div className={cn(
                    "transition-transform duration-300",
                    checked ? "scale-105" : "group-hover:scale-105"
                  )}>
                    <ParentAvatar name={p.name} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "font-semibold transition-colors duration-300",
                      checked ? "text-primary" : "text-foreground group-hover:text-primary/80"
                    )}>{p.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className="text-[10px]">✉</span> <span className="truncate">{p.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-[10px]">👤</span> <span>{p.childrenCount} child(ren)</span>
                      </span>
                    </div>
                  </div>
                </label>
              );
            })}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-muted/10 py-12 text-center">
                <Search className="mb-3 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No parents match your search.</p>
              </div>
            )}
          </div>

          {/* Selected count */}
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm shadow-inner transition-all">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Info className="h-3 w-3" />
            </div>
            <span className="text-foreground">
              Selected: <span className="font-bold text-primary">{selected.size}</span> parents
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 bg-card px-8 py-5 border-t border-border/50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button variant="outline" className="rounded-full px-6" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={selected.size === 0}
            className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-6 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="mr-2 h-4 w-4" /> Send Emails ({selected.size})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}