import { Check, Loader2, AlertCircle, RefreshCw } from "lucide-react";

/**
 * Inline auto-save status indicator.
 *
 * @param {{ status: 'idle'|'saving'|'saved'|'error', onRetry?: () => void, className?: string }} props
 */
export function AutoSaveIndicator({ status, onRetry, className = "" }) {
  if (status === "idle" || !status) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium transition-all duration-300 animate-in fade-in ${className}`}
    >
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-muted-foreground">Saving…</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600">Saved</span>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="h-3 w-3 text-destructive" />
          <span className="text-destructive">Failed</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="ml-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Retry
            </button>
          )}
        </>
      )}
    </span>
  );
}
