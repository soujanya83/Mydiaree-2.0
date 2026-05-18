import { CalendarRange, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CustomDateFilter({
  dateRange,
  setDateRange,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  options = []
}) {
  const [open, setOpen] = useState(false);

  const handleChange = (val) => {
    setDateRange(val);
    if (val === "custom") {
      setOpen(true);
    } else {
      setCustomFrom("");
      setCustomTo("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <Select value={dateRange} onValueChange={handleChange}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {options.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
              <SelectItem value="custom">
                <span className="flex items-center gap-1.5">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Custom Date
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-80 rounded-2xl border border-border/60 bg-card/95 p-0 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CalendarRange className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Custom Date Range</h4>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              From Date
            </label>
            <Input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              max={customTo || undefined}
              className="h-10 rounded-xl border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              To Date
            </label>
            <Input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              min={customFrom || undefined}
              className="h-10 rounded-xl border-border/60 bg-background/50 text-sm font-medium transition-all focus-visible:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-xl font-semibold"
              onClick={() => {
                setCustomFrom("");
                setCustomTo("");
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80 font-semibold shadow-sm shadow-primary/20"
              onClick={() => setOpen(false)}
            >
              Apply
            </Button>
          </div>
          {customFrom && customTo && (
            <p className="text-center text-[11px] font-medium text-muted-foreground">
              Showing results from{" "}
              <span className="font-bold text-foreground">
                {new Date(customFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>{" "}
              to{" "}
              <span className="font-bold text-foreground">
                {new Date(customTo).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
