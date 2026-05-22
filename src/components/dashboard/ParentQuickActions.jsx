import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MAX_PARENT_QUICK_ACTIONS,
  PARENT_QUICK_ACTION_POOL,
  loadParentQuickActionIds,
  resolveParentQuickActions,
  saveParentQuickActionIds,
} from "@/constants/parentQuickActions";

const quickColor = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
};

export function ParentQuickActions() {
  const [selectedIds, setSelectedIds] = useState(loadParentQuickActionIds);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [draftIds, setDraftIds] = useState(selectedIds);

  const actions = resolveParentQuickActions(selectedIds);

  const openCustomize = () => {
    setDraftIds([...selectedIds]);
    setCustomizeOpen(true);
  };

  const toggleDraft = (id) => {
    setDraftIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= MAX_PARENT_QUICK_ACTIONS) return prev;
      return [...prev, id];
    });
  };

  const saveCustomize = () => {
    if (draftIds.length !== MAX_PARENT_QUICK_ACTIONS) return;
    saveParentQuickActionIds(draftIds);
    setSelectedIds(draftIds);
    setCustomizeOpen(false);
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground">Quick actions</h2>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={openCustomize}>
          <Settings2 className="h-3.5 w-3.5" />
          Customize
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              to={action.to}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  quickColor[action.color],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-[11px] text-muted-foreground">{action.subtitle}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          );
        })}
      </div>

      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize quick actions</DialogTitle>
            <DialogDescription>
              Choose exactly {MAX_PARENT_QUICK_ACTIONS} shortcuts to show on your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            {PARENT_QUICK_ACTION_POOL.map((action) => {
              const Icon = action.icon;
              const checked = draftIds.includes(action.id);
              const atMax = draftIds.length >= MAX_PARENT_QUICK_ACTIONS && !checked;
              return (
                <button
                  key={action.id}
                  type="button"
                  disabled={atMax}
                  onClick={() => toggleDraft(action.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    checked
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border hover:bg-muted/50",
                    atMax && "cursor-not-allowed opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      quickColor[action.color],
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border text-[10px] font-bold",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/40",
                    )}
                  >
                    {checked ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Selected {draftIds.length} of {MAX_PARENT_QUICK_ACTIONS}
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCustomizeOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveCustomize}
              disabled={draftIds.length !== MAX_PARENT_QUICK_ACTIONS}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
