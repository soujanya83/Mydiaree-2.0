import { cn } from "@/lib/utils";

const COLOR = {
  not_started: "text-slate-300",
  introduced: "text-amber-500",
  practicing: "text-sky-500",
  completed: "text-emerald-500",
};

const FILL = {
  not_started: "none",
  introduced: "none",
  practicing: "none",
  completed: "none",
};

/**
 * Triangle indicator shown beside each progress item.
 * Click cycles through the statuses.
 */
export function StatusTriangle({ status, onClick, size = 56 }) {
  const color = COLOR[status] || COLOR.not_started;
  const showBaseLine = status === "introduced";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center rounded-md transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      style={{ width: size, height: size }}
      aria-label={`Change status (current: ${status})`}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className={color}>
        <polygon
          points="32,8 58,56 6,56"
          fill={FILL[status]}
          stroke="currentColor"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {showBaseLine && (
          <line
            x1="6"
            y1="56"
            x2="58"
            y2="56"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            className="text-amber-500"
          />
        )}
      </svg>
    </button>
  );
}