import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({ currentPage, totalPages, onPageChange, className }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis-1");
      }

      // Range around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range to always show 3 numbers if possible
      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 3) adjustedEnd = 4;
      if (currentPage >= totalPages - 2) adjustedStart = totalPages - 3;

      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis-2");
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-center gap-1.5", className)}>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/10 hover:text-primary disabled:opacity-30"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPages().map((page, idx) => {
        if (typeof page === "string") {
          return (
            <div
              key={page}
              className="flex h-9 w-9 items-center justify-center text-muted-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        const isActive = page === currentPage;

        return (
          <Button
            key={page}
            variant={isActive ? "default" : "outline"}
            size="sm"
            className={cn(
              "h-9 min-w-[2.25rem] rounded-xl font-bold transition-all",
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "border-border/50 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:text-primary"
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:bg-primary/10 hover:text-primary disabled:opacity-30"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
