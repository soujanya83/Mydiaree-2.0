import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCentreStore } from "@/stores/centreStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Centre picker — dropdown only when the user has more than one centre.
 * With a single centre, shows a read-only label (not openable).
 */
export function CentreSelect({
  value,
  onValueChange,
  centres: centresProp,
  className,
  triggerClassName,
  contentClassName,
  placeholder = "Centre",
  icon: Icon = null,
  disabled = false,
}) {
  const storeCentres = useCentreStore((s) => s.centres);
  const storeActiveId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const centres = centresProp ?? storeCentres;
  const activeCentreId = value ?? storeActiveId;
  const handleChange = onValueChange ?? setActiveCentre;

  const activeCentre =
    centres.find((c) => String(c.id) === String(activeCentreId)) ?? centres[0];
  const hasMultiple = centres.length > 1;

  if (!hasMultiple) {
    return (
      <div
        className={cn(
          "flex h-9 w-full items-center gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          triggerClassName,
          className,
        )}
        aria-label={activeCentre?.name ?? placeholder}
      >
        {Icon ? <Icon className="h-4 w-4 shrink-0 opacity-70" /> : null}
        <span className="line-clamp-1 font-medium">{activeCentre?.name ?? placeholder}</span>
      </div>
    );
  }

  return (
    <Select
      value={activeCentreId != null ? String(activeCentreId) : undefined}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("h-9", triggerClassName, className)}>
        {Icon ? <Icon className="mr-1.5 h-4 w-4 shrink-0 opacity-70" /> : null}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {centres.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
