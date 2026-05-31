import { Baby } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { childDisplayName } from "@/utils/parentDashboardText";
import { IMG_BASE_API } from "../../api/imageapi";

const IMG_BASE = IMG_BASE_API;

function childImageUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
}

export function ParentChildSelect({ children = [], value, onChange, className }) {
  const hasChildren = children.length > 0;
  const selectedValue = hasChildren ? value || String(children[0].id) : undefined;

  return (
    <Select value={selectedValue} onValueChange={onChange}>
      <SelectTrigger className={className ?? "h-10 w-full min-w-[200px] sm:w-[240px]"}>
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 shrink-0 text-primary" />
          <SelectValue placeholder={hasChildren ? "Select child" : "No child found"} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {hasChildren ? (
          children.map((child) => {
            const name = childDisplayName(child);
            const img = childImageUrl(child.imageUrl);
            return (
              <SelectItem key={child.id} value={String(child.id)}>
                <span className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    {img && <AvatarImage src={img} alt={name} />}
                    <AvatarFallback className="text-[9px]">
                      {name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {name}
                </span>
              </SelectItem>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">No child found</div>
        )}
      </SelectContent>
    </Select>
  );
}

export function ParentChildSelectLabel({ children = [], value }) {
  const child = children.find((c) => String(c.id) === String(value));
  return child ? childDisplayName(child) : "Select child";
}
