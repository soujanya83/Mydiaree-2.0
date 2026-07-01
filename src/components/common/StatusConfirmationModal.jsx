import { createPortal } from "react-dom";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * StatusConfirmationModal — Asks for confirmation before toggling
 * a user/child's status between Active ↔ Inactive.
 *
 * Shows a loader inside the modal until the API responds,
 * then the parent closes the modal on success.
 *
 * @param {boolean}  open        - Whether the modal is visible
 * @param {function} onClose     - Called to close the modal (disabled while loading)
 * @param {function} onConfirm   - Called when user clicks "Confirm"
 * @param {boolean}  isLoading   - Show spinner and disable buttons while API is in-flight
 * @param {string}   name        - Name of the person being toggled (e.g. "John Doe")
 * @param {boolean}  isCurrentlyActive - Current status (true = Active, false = Inactive)
 */
export function StatusConfirmationModal({
  open,
  onClose,
  onConfirm,
  isLoading,
  name,
  isCurrentlyActive,
}) {
  if (!open) return null;

  const newStatus = isCurrentlyActive ? "Inactive" : "Active";
  const actionColor = isCurrentlyActive
    ? "bg-orange-600 hover:bg-orange-700"
    : "bg-emerald-600 hover:bg-emerald-700";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-lg font-bold">Confirm Status Change</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <h3 className="text-base font-semibold text-foreground">
            {isCurrentlyActive ? "Deactivate" : "Activate"}{" "}
            <span className="text-primary">{name || "this user"}</span>?
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {isCurrentlyActive
              ? `This will set ${name || "this user"}'s status to Inactive. They will no longer have active access until reactivated.`
              : `This will set ${name || "this user"}'s status to Active. They will regain access to the system.`}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className={`${actionColor} text-white min-w-[140px]`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              `Set ${newStatus}`
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
