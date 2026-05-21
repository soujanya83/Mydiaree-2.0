import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { normalizeBodyMarker } from "./bodyInjuryMarkers";

function MarkerDot({ x, y, onRemove, readOnly }) {
  return (
    <button
      type="button"
      title={readOnly ? "Affected area" : "Click to remove"}
      onClick={(e) => {
        e.stopPropagation();
        onRemove?.();
      }}
      disabled={readOnly}
      className={cn(
        "absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-500/20 shadow-md transition",
        !readOnly && "hover:scale-110 hover:border-destructive hover:bg-destructive/20",
        readOnly && "cursor-default",
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span className="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
    </button>
  );
}

function BodyHalf({ view, markers, onAdd, onRemove, readOnly, side }) {
  const ref = useRef(null);
  const viewMarkers = markers.filter((m) => m.view === view);

  const handleClick = (e) => {
    if (readOnly || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const hit = viewMarkers.find((m) => Math.hypot(m.x - x, m.y - y) < 5);
    if (hit) {
      onRemove(hit.id);
      return;
    }
    const normalized = normalizeBodyMarker({ view, x, y });
    if (!normalized) return;
    onAdd(normalized);
  };

  return (
    <div
      ref={ref}
      role={readOnly ? "presentation" : "button"}
      tabIndex={readOnly ? -1 : 0}
      onClick={handleClick}
      className={cn(
        "absolute top-0 h-full w-1/2",
        side === "left" ? "left-0" : "left-1/2",
        !readOnly && "cursor-crosshair",
      )}
    >
      {viewMarkers.map((m) => (
        <MarkerDot
          key={m.id}
          x={m.x}
          y={m.y}
          readOnly={readOnly}
          onRemove={() => onRemove(m.id)}
        />
      ))}
    </div>
  );
}

const DEFAULT_IMAGE = "/accident/body-diagram.png";

export function BodyInjuryDiagram({
  markers = [],
  onChange,
  readOnly = false,
  imageSrc = DEFAULT_IMAGE,
  className,
}) {
  const addMarker = (marker) => {
    onChange?.([...markers, marker]);
  };

  const removeMarker = (id) => {
    onChange?.(markers.filter((m) => m.id !== id));
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border shadow-sm", className)}>
      <div className="bg-amber-400 px-4 py-2.5">
        <h4 className="text-sm font-bold text-white">Nature of Injury / Trauma / Illness:</h4>
      </div>

      <div className="bg-muted/20 p-4">
        <p className="mb-4 text-center text-sm font-medium text-primary">
          Indicate the part of the body affected on this diagram
        </p>

        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border-2 border-border bg-white">
          <img
            src={imageSrc}
            alt="Child body front and back diagram"
            className="pointer-events-none block w-full select-none"
            draggable={false}
          />
          <BodyHalf
            view="front"
            side="left"
            markers={markers}
            onAdd={addMarker}
            onRemove={removeMarker}
            readOnly={readOnly}
          />
          <BodyHalf
            view="back"
            side="right"
            markers={markers}
            onAdd={addMarker}
            onRemove={removeMarker}
            readOnly={readOnly}
          />
          <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-between px-[18%] text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
            <span>Front</span>
            <span>Back</span>
          </div>
        </div>

        {!readOnly && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4">
            <p className="text-xs text-muted-foreground">
              Click on the left (front) or right (back) body to place a marker. Click a marker to
              remove it.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange?.([])}
              disabled={markers.length === 0}
              className="rounded-lg"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Clear all ({markers.length})
            </Button>
          </div>
        )}

        {readOnly && markers.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            No body areas marked on this record.
          </p>
        )}
      </div>
    </div>
  );
}
