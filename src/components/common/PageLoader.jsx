import { cn } from "@/lib/utils";

/**
 * Global reusable page loader matching the sidebar primary colour.
 *
 * Usage:
 *   <PageLoader />                          — full-section spinner
 *   <PageLoader label="Loading diary…" />   — with contextual text
 *   <PageLoader size="sm" />                — compact variant (inline use)
 *   <PageLoader overlay />                  — fullscreen overlay with backdrop blur
 */
export function PageLoader({
  className,
  label,
  size = "md",
  overlay = false,
}) {
  const sizes = {
    sm: { ring: "h-6 w-6 border-[2.5px]", gap: "gap-2", text: "text-xs", py: "py-4" },
    md: { ring: "h-10 w-10 border-[3px]", gap: "gap-3", text: "text-sm", py: "py-20" },
    lg: { ring: "h-14 w-14 border-[3.5px]", gap: "gap-4", text: "text-base", py: "py-28" },
  };

  const s = sizes[size] || sizes.md;

  const spinner = (
    <div className={cn("flex flex-col items-center justify-center", s.gap, !overlay && s.py, className)}>
      {/* Outer glow ring */}
      <div className="relative">
        <div
          className={cn(
            "animate-spin rounded-full border-sidebar-primary/20",
            s.ring,
          )}
          style={{
            borderTopColor: "var(--sidebar-primary)",
            borderRightColor: "var(--sidebar-primary)",
            borderBottomColor: "transparent",
            borderLeftColor: "transparent",
          }}
        />
        {/* Inner soft pulse */}
        <div
          className="absolute inset-0 animate-pulse rounded-full"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--sidebar-primary) 15%, transparent) 0%, transparent 70%)",
          }}
        />
      </div>
      {label && (
        <span
          className={cn(
            "font-medium tracking-wide animate-pulse",
            s.text,
          )}
          style={{ color: "var(--sidebar-primary)" }}
        >
          {label}
        </span>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/60 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
}
