import { useState, useMemo } from "react";
import { X, Search, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { EYLF_OUTCOMES } from "./data";
import { cn } from "@/lib/utils";

export function EylfPickerModal({ open, initial = [], onClose, onSave }) {
  const [selected, setSelected] = useState(new Set(initial));
  const [search, setSearch] = useState("");
  const [openStates, setOpenStates] = useState({
    root: true,
    outcomes: true,
  });

  const toggleOpen = (key) => {
    setOpenStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return EYLF_OUTCOMES;
    return EYLF_OUTCOMES.filter(
      (o) => o.code.includes(q) || o.label.toLowerCase().includes(q) || o.outcome.toLowerCase().includes(q)
    );
  }, [search]);

  const outcomesGrouped = useMemo(() => {
    const groups = {};
    filtered.forEach((o) => {
      if (!groups[o.outcome]) groups[o.outcome] = [];
      groups[o.outcome].push(o);
    });
    return groups;
  }, [filtered]);

  if (!open) return null;

  const toggle = (code) => {
    setSelected((p) => {
      const next = new Set(p);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Select EYLF</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search outcomes…"
              className="h-10 pl-10 bg-muted/20 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Level 1: Framework */}
            <div className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggleOpen("root")}
                className="flex w-full items-center gap-2 bg-muted/30 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
              >
                {openStates.root ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="font-semibold text-foreground">Early Years Learning Framework (EYLF) - Australia (V2.0 2022)</span>
              </button>

              {openStates.root && (
                <div className="p-4 bg-card/50">
                  {/* Level 2: Learning Outcomes Wrapper */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => toggleOpen("outcomes")}
                      className="flex w-full items-center gap-2 bg-muted/20 px-4 py-2.5 text-left hover:bg-muted/40 transition-colors"
                    >
                      {openStates.outcomes ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold text-foreground">EYLF Learning Outcomes</span>
                    </button>

                    {openStates.outcomes && (
                      <div className="p-3 space-y-3">
                        {Object.entries(outcomesGrouped).map(([outcomeTitle, items]) => {
                          const groupKey = `group-${outcomeTitle}`;
                          const isGroupOpen = openStates[groupKey] !== false;
                          return (
                            <div key={outcomeTitle} className="rounded-md border border-border/60 overflow-hidden">
                              <button
                                onClick={() => toggleOpen(groupKey)}
                                className="flex w-full items-center gap-2 bg-muted/10 px-4 py-2 text-left hover:bg-muted/20 transition-colors"
                              >
                                {isGroupOpen ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium text-foreground">{outcomeTitle}</span>
                              </button>

                              {isGroupOpen && (
                                <div className="divide-y divide-border/40">
                                  {items.map((o) => (
                                    <label
                                      key={o.code}
                                      className={cn(
                                        "flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-primary/5",
                                        selected.has(o.code) && "bg-amber-50/50 dark:bg-amber-900/10"
                                      )}
                                    >
                                      <Checkbox
                                        checked={selected.has(o.code)}
                                        onCheckedChange={() => toggle(o.code)}
                                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                      />
                                      <div className={cn(
                                        "text-sm font-medium transition-colors",
                                        selected.has(o.code) ? "text-amber-500 font-bold" : "text-muted-foreground"
                                      )}>
                                        {o.code} {o.label}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/10 px-6 py-4">
          <Button variant="secondary" onClick={onClose} className="px-6 h-10 font-semibold bg-gray-500 hover:bg-gray-600 text-white">
            Cancel
          </Button>
          <Button onClick={() => onSave(Array.from(selected))} className="px-6 h-10 font-semibold bg-[#00AEEF] hover:bg-[#0096ce] text-white">
            Save selections
          </Button>
        </div>
      </div>
    </div>
  );
}