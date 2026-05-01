import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SUBJECT_TREE } from "./data";
import { cn } from "@/lib/utils";

export function ActivityPickerModal({ open, subjectKey, initial = [], onClose, onSave }) {
  const subject = SUBJECT_TREE[subjectKey];
  const [selected, setSelected] = useState(new Set(initial));
  const [openGroups, setOpenGroups] = useState({});
  const [search, setSearch] = useState("");

  const toggleGroup = (key) =>
    setOpenGroups((p) => ({ ...p, [key]: !p[key] }));

  const toggleItem = (item) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!subject) return [];
    if (!q) return subject.groups;
    return subject.groups
      .map((g) => ({
        ...g,
        children: g.children
          .map((c) => ({
            ...c,
            items: c.items.filter((i) => i.toLowerCase().includes(q)),
          }))
          .filter((c) => c.items.length || c.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.children.length);
  }, [subject, search]);

  if (!open || !subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            Select {subject.label} Activities
          </h2>
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
              placeholder="Search activities…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredGroups.map((group) => (
            <div key={group.label} className="mb-3 rounded-lg border border-border">
              <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{group.label}</span>
              </div>
              <div className="divide-y divide-border">
                {group.children.map((child) => {
                  const key = `${group.label}::${child.label}`;
                  const isOpen = !!openGroups[key] || !!search;
                  return (
                    <div key={key}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(key)}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/30"
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-foreground">{child.label}</span>
                      </button>
                      {isOpen && (
                        <div className="bg-muted/10 px-12 py-2">
                          {child.items.map((item) => (
                            <label
                              key={item}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-primary/5",
                                selected.has(item) && "bg-primary/10"
                              )}
                            >
                              <Checkbox
                                checked={selected.has(item)}
                                onCheckedChange={() => toggleItem(item)}
                              />
                              <span className="text-sm text-foreground">{item}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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