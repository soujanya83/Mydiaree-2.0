import { IMG_BASE_API } from "../api/imageapi";

const IMG_BASE = IMG_BASE_API;

export function personAvatarUrl(imageUrl) {
  const raw = String(imageUrl || "").trim().replace(/\\/g, "");
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${IMG_BASE}${raw.replace(/^\/+/, "")}`;
}

export function personDisplayName(person, fallback = "Unknown") {
  return (
    [person?.name, person?.lastname].filter(Boolean).join(" ").trim() ||
    person?.name ||
    fallback
  );
}

export function personInitials(name = "") {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
