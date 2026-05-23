import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
}) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-bold">Confirm Delete</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-6">
          <h3 className="text-base font-semibold text-foreground">
            {title || "Are you sure you want to delete this item?"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {description ||
              "This action cannot be undone. All associated data will be permanently removed."}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
