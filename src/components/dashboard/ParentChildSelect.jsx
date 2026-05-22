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

const IMG_BASE = "https://mydiaree.com.au/";

function childImageUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
}

export function ParentChildSelect({ children = [], value, onChange, className }) {
  if (children.length === 0) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "h-10 w-full min-w-[200px] sm:w-[240px]"}>
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 shrink-0 text-primary" />
          <SelectValue placeholder="Select child" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          {children.length === 1 ? "Your child" : `All children (${children.length})`}
        </SelectItem>
        {children.map((child) => {
          const name = childDisplayName(child);
          const img = childImageUrl(child.imageUrl);
          return (
            <SelectItem key={child.id} value={String(child.id)}>
              <span className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  {img && <AvatarImage src={img} alt={name} />}
                  <AvatarFallback className="text-[9px]">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                {name}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export function ParentChildSelectLabel({ children = [], value }) {
  if (value === "all") {
    return children.length === 1
      ? childDisplayName(children[0])
      : `All ${children.length} children`;
  }
  const child = children.find((c) => String(c.id) === String(value));
  return child ? childDisplayName(child) : "Select child";
}
