import { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EYLF_OUTCOMES } from "./data";
import { cn } from "@/lib/utils";

export function EylfPickerModal({ open, initial = [], onClose, onSave }) {
  const [selected, setSelected] = useState(new Set(initial));
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return EYLF_OUTCOMES;
    return EYLF_OUTCOMES.filter(
      (o) => o.code.includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [search]);

  if (!open) return null;

  const toggle = (code) => {
    setSelected((p) => {
      const next = new Set(p);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Select EYLF Outcomes</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outcomes…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {filtered.map((o) => (
            <label
              key={o.code}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 hover:border-primary/40 hover:bg-primary/5",
                selected.has(o.code) && "border-primary/60 bg-primary/10"
              )}
            >
              <Checkbox
                checked={selected.has(o.code)}
                onCheckedChange={() => toggle(o.code)}
                className="mt-0.5"
              />
              <div>
                <div className="text-sm font-semibold text-foreground">EYLF {o.code}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{o.label}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(Array.from(selected))}>Save selections</Button>
        </div>
      </div>
    </div>
  );
}