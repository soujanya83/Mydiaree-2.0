/** API field name for body diagram marker data (FormData key). */
export const BODY_INJURY_API_FIELD = "body_injury_markers";

/** Alternate response keys from API (details endpoint). */
export const BODY_INJURY_PARSE_KEYS = [
  "body_injury_markers",
  "injury_body_diagram",
  "body_diagram",
];

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

/**
 * Parse API value into UI marker array (with ids for React keys).
 */
export function parseBodyInjuryMarkers(raw) {
  if (!raw) return [];

  let data = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "null") return [];
    try {
      data = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object" && Array.isArray(data.markers)) {
    list = data.markers;
  }

  return list
    .map((item, i) => normalizeBodyMarker(item, i))
    .filter(Boolean);
}

/**
 * Strip client-only fields and build API payload array.
 * @param {Array} markers
 * @returns {Array<{ view: string, x: number, y: number }>}
 */
export function bodyMarkersForApi(markers = []) {
  return parseBodyInjuryMarkers(markers).map(({ view, x, y }) => ({ view, x, y }));
}

/**
 * JSON string for FormData `body_injury_markers` field.
 */
export function serializeBodyInjuryMarkers(markers = []) {
  const apiMarkers = bodyMarkersForApi(markers);
  return JSON.stringify(apiMarkers);
}

/**
 * Read first matching field from accident details record.
 */
export function bodyInjuryMarkersFromRecord(record = {}) {
  for (const key of BODY_INJURY_PARSE_KEYS) {
    if (record[key] != null && record[key] !== "") {
      return parseBodyInjuryMarkers(record[key]);
    }
  }
  return [];
}
