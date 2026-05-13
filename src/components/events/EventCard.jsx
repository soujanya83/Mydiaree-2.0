import { Eye, Pencil, Trash2, FileText, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, daysSince } from "./eventsData";

export function EventCard({ event, onView, onEdit, onDelete }) {
  const isPdf = event.media?.type === "pdf";
  const isImage = event.media?.type === "image";
  const passed = daysSince(event.date);

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md h-full">
      {/* 1. Media Area (Top) */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted/40">
        <button type="button" onClick={() => onView(event)} className="block h-full w-full">
          {isImage && event.media?.url ? (
            <img src={event.media.url} alt={event.title} className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in" />
          ) : isPdf ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-primary/60">
              <FileText className="h-10 w-10" />
              <span className="text-[10px] font-bold uppercase tracking-wider">PDF Document</span>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
        </button>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-sm">
          <div className={`h-1.5 w-1.5 rounded-full ${event.type?.toLowerCase() === 'announcement' ? 'bg-indigo-500' : 'bg-rose-500'}`} />
          {event.type}
        </div>
      </div>

      {/* 2. Body */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <button onClick={() => onView(event)} className="text-left hover:underline">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
              {event.title}
            </h3>
          </button>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              event.status?.toLowerCase() === "published"
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="mb-4 space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-400">
               {(event.createdBy || "?").charAt(0)}
            </div>
            <p className="font-medium text-foreground line-clamp-1">
              <span className="text-muted-foreground font-normal">Created by: </span>
              {event.createdBy}
            </p>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-2 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Event Date</span>
              <span className="font-semibold text-foreground">{formatDate(event.date)}</span>
            </div>
            <p className="text-[10px] text-slate-500 text-right italic">
              {passed >= 0 ? `Passed ${passed} days ago` : `In ${Math.abs(passed)} days`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            onClick={() => onView(event)}
            title="View"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(event)}
            title="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(event)}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}