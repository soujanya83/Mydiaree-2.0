import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Loader({ className, label }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8 text-muted-foreground", className)}>
      <Loader2 className="h-4 w-4 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
