import { useState, useMemo, useEffect } from "react";
import { X, Search, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { reflectionService } from "@/services/learning/reflectionService";

export function EylfPickerModal({ open, initial = [], selected: selectedProp, onClose, onSave }) {
  const selected = selectedProp ?? initial ?? [];
  const [outcomes, setOutcomes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chosen, setChosen] = useState(new Set(selected));
  const [search, setSearch] = useState("");
  const [openStates, setOpenStates] = useState({
    root: true,
    outcomes: true,
  });

  useEffect(() => {
    if (open) {
      fetchOutcomes();
      setChosen(new Set(selected));
      setSearch("");
    }
  }, [open, selected]);

  const fetchOutcomes = async () => {
    setIsLoading(true);
    try {
      const res = await reflectionService.getEylfOutcomes();
      if (res.status) {
        setOutcomes(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch EYLF outcomes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = (key) => {
    setOpenStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggle = (title) => {
    setChosen((p) => {
      const next = new Set(p);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return outcomes;
    const q = search.toLowerCase();
    return outcomes
      .map((o) => ({
        ...o,
        activities: o.activities.filter((a) => a.title.toLowerCase().includes(q)),
      }))
      .filter(
        (o) =>
          o.activities.length > 0 ||
          o.name.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q),
      );
  }, [outcomes, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">Select EYLF</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          >
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
              className="h-10 border-none bg-muted/20 pl-10 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-border">
                <button
                  onClick={() => toggleOpen("root")}
                  className="flex w-full items-center gap-2 bg-muted/30 px-4 py-3 text-left transition-colors hover:bg-muted/50"
                >
                  {openStates.root ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-semibold text-foreground">
                    Early Years Learning Framework (EYLF) - Australia
                  </span>
                </button>

                {openStates.root && (
                  <div className="bg-card/50 p-4">
                    <div className="overflow-hidden rounded-lg border border-border">
                      <button
                        onClick={() => toggleOpen("outcomes")}
                        className="flex w-full items-center gap-2 bg-muted/20 px-4 py-2.5 text-left transition-colors hover:bg-muted/40"
                      >
                        {openStates.outcomes ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-semibold text-foreground">EYLF Learning Outcomes</span>
                      </button>

                      {openStates.outcomes && (
                        <div className="space-y-3 p-3">
                          {filtered.map((o) => {
                            const groupKey = `group-${o.id}`;
                            const isGroupOpen = openStates[groupKey] !== false;
                            return (
                              <div
                                key={o.id}
                                className="overflow-hidden rounded-md border border-border/60"
                              >
                                <button
                                  onClick={() => toggleOpen(groupKey)}
                                  className="flex w-full items-center gap-2 bg-muted/10 px-4 py-2 text-left transition-colors hover:bg-muted/20"
                                >
                                  {isGroupOpen ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className="text-sm font-medium text-foreground">
                                    {o.title} - {o.name}
                                  </span>
                                </button>

                                {isGroupOpen && (
                                  <div className="divide-y divide-border/40">
                                    {o.activities.map((a) => {
                                      const fullLabel = `${o.title} - ${o.name}: ${a.title}`;
                                      return (
                                        <label
                                          key={a.id}
                                          className={cn(
                                            "flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-primary/5",
                                            chosen.has(fullLabel) &&
                                              "bg-amber-50/50 dark:bg-amber-900/10",
                                          )}
                                        >
                                          <Checkbox
                                            checked={chosen.has(fullLabel)}
                                            onCheckedChange={() => toggle(fullLabel)}
                                            className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                          />
                                          <div
                                            className={cn(
                                              "text-sm font-medium transition-colors",
                                              chosen.has(fullLabel)
                                                ? "font-bold text-amber-600"
                                                : "text-muted-foreground",
                                            )}
                                          >
                                            {a.title}
                                          </div>
                                        </label>
                                      );
                                    })}
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
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/10 px-6 py-4">
          <Button
            variant="secondary"
            onClick={onClose}
            className="h-10 bg-gray-500 px-6 font-semibold text-white hover:bg-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(Array.from(chosen))}
            className="h-10 bg-[#00AEEF] px-6 font-semibold text-white hover:bg-[#0096ce]"
          >
            Save selections
          </Button>
        </div>
      </div>
    </div>
  );
}
