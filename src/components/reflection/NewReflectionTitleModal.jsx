import { useEffect, useState } from "react";
import { X, FileText, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NewReflectionTitleModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle("");
  }, [open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-sidebar-border bg-card shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Decorative top bar with gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-emerald-500 to-teal-500" />

        <div className="relative px-8 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Create New Reflection</h2>
              <p className="text-sm text-muted-foreground">Start by giving your reflection a meaningful title.</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground uppercase tracking-wider">
              Reflection Title
            </label>
            <div className="relative">
              <Textarea
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Exploring colors with water paint or Morning circle time..."
                rows={4}
                className="resize-none border-sidebar-border bg-muted/20 p-4 text-base focus-visible:ring-primary/50 rounded-xl text-foreground placeholder:text-muted-foreground/50"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {title.length} characters
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-sidebar-border bg-muted/10 px-8 py-5">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="rounded-xl font-semibold hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            disabled={!canSubmit}
            onClick={() => onSubmit(title.trim())}
            className="rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:translate-y-0"
          >
            <PenLine className="mr-2 h-4 w-4" />
            Submit & Continue
          </Button>
        </div>
      </div>
    </div>
  );}