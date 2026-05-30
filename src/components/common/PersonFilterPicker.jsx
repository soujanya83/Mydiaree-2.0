import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2, Check, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { personAvatarUrl, personDisplayName, personInitials } from "@/utils/personDisplay";
import { cn } from "@/lib/utils";

const ROW_HEIGHT_PX = 44;

function FilterAvatar({ person, sizeClass = "h-9 w-9", textClass = "text-[10px]" }) {
  const name = personDisplayName(person);
  const url = personAvatarUrl(person?.imageUrl);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 font-bold text-primary",
        sizeClass,
        textClass,
      )}
    >
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        personInitials(name)
      )}
    </div>
  );
}

function AllOptionAvatar({ sizeClass = "h-9 w-9" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground",
        sizeClass,
      )}
    >
      All
    </div>
  );
}

export function PersonFilterPicker({
  label,
  value = "all",
  onChange,
  items = [],
  search = "",
  onSearchChange,
  isLoading = false,
  allLabel = "All",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found",
  maxVisibleRows = 5,
  onLoadMore,
  hasMore = false,
}) {
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);
  const listMaxHeight = maxVisibleRows * ROW_HEIGHT_PX;

  const selectedPerson = useMemo(() => {
    if (value === "all") return null;
    return items.find((item) => String(item.id) === String(value)) ?? null;
  }, [value, items]);

  const selectedLabel = selectedPerson ? personDisplayName(selectedPerson) : allLabel;

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSelect = (nextValue) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-2.5 text-left text-sm shadow-xs transition-colors",
              "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              open && "border-primary/40 ring-2 ring-primary/20",
            )}
          >
            {selectedPerson ? (
              <FilterAvatar person={selectedPerson} sizeClass="h-6 w-6" textClass="text-[9px]" />
            ) : (
              <AllOptionAvatar sizeClass="h-6 w-6" />
            )}
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">
              {selectedLabel}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] min-w-[240px] max-w-[320px] overflow-hidden rounded-xl border border-border bg-card p-0 shadow-lg"
        >
          <div className="border-b border-border/60 bg-muted/20 px-3 py-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => onSearchChange?.(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 border-border/60 bg-background pl-8 text-sm"
              />
            </div>
          </div>

          <div
            className="overflow-y-auto p-1.5"
            style={{ maxHeight: listMaxHeight }}
            onScroll={(e) => {
              const { scrollTop, scrollHeight, clientHeight } = e.target;
              if (scrollHeight - scrollTop - clientHeight < 20 && hasMore && !isLoading) {
                onLoadMore?.();
              }
            }}
          >
            <button
              type="button"
              onClick={() => handleSelect("all")}
              className={cn(
                "mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                value === "all"
                  ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                  : "hover:bg-muted/60",
              )}
            >
              <AllOptionAvatar />
              <span className="truncate text-sm font-medium">{allLabel}</span>
              {value === "all" && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
            </button>

            {isLoading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : items.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">{emptyMessage}</p>
            ) : (
              items.map((person) => {
                const isSelected = String(value) === String(person.id);
                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => handleSelect(String(person.id))}
                    className={cn(
                      "mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <FilterAvatar person={person} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {personDisplayName(person)}
                    </span>
                    {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })
            )}

            {hasMore && items.length > 0 && (
              <div className="flex items-center justify-center py-2 text-xs text-muted-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scroll for more..."}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
