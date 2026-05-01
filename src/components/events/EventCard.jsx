import { Eye, Pencil, Trash2, FileText, ImageIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate, daysSince } from "./eventsData";

export function EventCard({ event, onView, onEdit, onDelete }) {
  const isPdf = event.media?.type === "pdf";
  const isImage = event.media?.type === "image";
  const passed = daysSince(event.date);

  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Header strip */}
      <div className="flex items-center justify-between bg-primary/90 px-3 py-2">
        <Badge variant="secondary" className="bg-background/95 text-foreground uppercase text-[10px] tracking-wider">
          {event.type}
        </Badge>
        <Badge
          className={cn(
            "uppercase text-[10px] tracking-wider",
            event.status === "published"
              ? "bg-emerald-500 hover:bg-emerald-500 text-white"
              : "bg-amber-500 hover:bg-amber-500 text-white"
          )}
        >
          {event.status === "published" ? "✓ Published" : "⏳ Draft"}
        </Badge>
      </div>

      {/* Media area */}
      <div className="flex h-40 items-center justify-center bg-background border-b">
        {isImage && event.media?.url ? (
          <img src={event.media.url} alt={event.title} className="h-full w-full object-contain" />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <FileText className="h-12 w-12 text-primary" />
            <span className="text-xs">PDF Document</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <span className="text-xs">No Media</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 bg-muted/20 p-4">
        <h3 className="font-semibold text-foreground">{event.title}</h3>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
            {(event.createdBy || "?").charAt(0)}
          </div>
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Created by</p>
            <p className="text-sm font-medium">{event.createdBy}</p>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-xs text-muted-foreground">Event Date</p>
          <p className="font-medium">{formatDate(event.date)}</p>
          <p className="text-xs text-muted-foreground">
            {passed >= 0 ? `Event passed ${passed} days ago` : `In ${Math.abs(passed)} days`}
          </p>
        </div>

        <div className="space-y-1 text-sm">
          <p className="text-xs text-muted-foreground">Created At</p>
          <p className="font-medium">{formatDate(event.createdAt)}</p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600" onClick={() => onView(event)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" className="h-8 w-8 text-primary" onClick={() => onEdit(event)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}