import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-center border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">New Reflection</h2>
          <button
            onClick={onClose}
            className="absolute right-6 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-emerald-600">
              Title
            </label>
            <Textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this reflection a title"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <Button variant="outline" className="border-sky-500/40 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/20">
                <Sparkles className="mr-1.5 h-4 w-4" /> Refine with AI
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button
            disabled={!canSubmit}
            onClick={() => onSubmit(title.trim())}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Submit
          </Button>
          <Button variant="secondary" onClick={onClose}>
            <X className="mr-1.5 h-4 w-4" /> Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}