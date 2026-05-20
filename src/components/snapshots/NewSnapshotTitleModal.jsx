import { useEffect, useState } from "react";
import { ArrowRight, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MAX_TITLE_LENGTH = 80;

export function NewSnapshotTitleModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) setTitle("");
  }, [open]);

  if (!open) return null;

  const canSubmit = title.trim().length > 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (canSubmit) onSubmit(title.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Camera className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Snapshot</p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Create New Snapshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with a short title for this captured moment.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground" htmlFor="snapshot-title">
              Title
            </label>
            <div className="relative">
              <Input
                id="snapshot-title"
                autoFocus
                value={title}
                maxLength={MAX_TITLE_LENGTH}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., The giant block tower"
                className="h-12 rounded-xl border-border bg-muted/20 pr-20 text-base focus-visible:ring-primary/50"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                {title.length}/{MAX_TITLE_LENGTH}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              You can add rooms, children, educators, details and media on the next screen.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
