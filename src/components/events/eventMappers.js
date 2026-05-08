function parseMedia(media) {
  if (!media) return null;
  try {
    const files = Array.isArray(media) ? media : JSON.parse(media);
    const url = files?.[0];
    if (!url) return null;
    const lower = url.toLowerCase();
    return {
      type: lower.includes(".pdf") ? "pdf" : "image",
      url,
      name: decodeURIComponent(url.split("/").pop() || "Attachment"),
    };
  } catch {
    return null;
  }
}

export function mapAnnouncementRecord(record) {
  const apiType = String(record.type || "").toLowerCase();
  return {
    id: String(record.id),
    rawId: record.id,
    type: apiType === "events" ? "Events" : "Announcement",
    apiType: apiType || "announcement",
    title: record.title || "Untitled",
    description: record.text || "",
    date: record.eventDate || "",
    createdAt: record.createdAt || record.created_at || "",
    createdBy: record.createdBy || record.creator?.name || "Unknown",
    status: String(record.status || "").toLowerCase() === "sent" ? "published" : "draft",
    statusLabel: record.status || "Pending",
    access: record.audience
      ? record.audience.charAt(0).toUpperCase() + record.audience.slice(1)
      : "All",
    audience: record.audience || "all",
    media: parseMedia(record.announcementMedia),
    eventColor: record.eventColor || "#0d6efd",
    centerid: record.centerid,
    children: [],
    raw: record,
  };
}

export function toApiType(type) {
  return type === "Events" ? "events" : "announcement";
}

export function toApiAudience(access) {
  return String(access || "All").toLowerCase();
}
