const VALID_VIEWS = new Set(["front", "back"]);

/**
 * Normalize a single marker for UI state.
 * @returns {{ id: string, view: 'front'|'back', x: number, y: number } | null}
 */
export function normalizeBodyMarker(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const view = String(raw.view || "").toLowerCase();
  if (!VALID_VIEWS.has(view)) return null;

  const x = Number(raw.x);
  const y = Number(raw.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const id =
    raw.id && String(raw.id).trim()
      ? String(raw.id)
      : `${view}-${index}-${Math.round(x)}-${Math.round(y)}`;

  return {
    id,
    view,
    x: Math.round(Math.min(100, Math.max(0, x)) * 10) / 10,
    y: Math.round(Math.min(100, Math.max(0, y)) * 10) / 10,
  };
}
