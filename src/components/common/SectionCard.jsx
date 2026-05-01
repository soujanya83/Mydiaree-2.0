import { cn } from "@/lib/utils";

const topAccent = {
  primary: "bg-primary",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  success: "bg-success",
};

export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  className,
  accentTop,
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      {accentTop && (
        <span
          className={cn("absolute inset-x-0 top-0 h-1", topAccent[accentTop])}
        />
      )}
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {action}
      </header>
      <div>{children}</div>
    </section>
  );
}
