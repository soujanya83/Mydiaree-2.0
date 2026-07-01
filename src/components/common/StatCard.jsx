import { TrendingDown, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const topAccent = {
  primary: "bg-primary",
  warning: "bg-warning",
  destructive: "bg-destructive",
  info: "bg-info",
  success: "bg-success",
};

const iconBg = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accentTop = "primary",
  href,
  className,
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={href ? () => navigate(href) : undefined}
      role={href ? "link" : undefined}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md",
        href && "cursor-pointer hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98]",
        className
      )}
    >
      <span
        className={cn("absolute inset-x-0 top-0 h-1", topAccent[accentTop])}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconBg[accentTop]
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5 text-success" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
          )}
          <span
            className={cn(
              "font-semibold",
              trend.direction === "up" ? "text-success" : "text-destructive"
            )}
          >
            {trend.value}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}

