export const eventTypes = ["Announcement", "Events", "Public Holiday"];
export const accessOptions = ["All", "Parents", "Staff"];

export const initialEvents = [
  {
    id: "ev1",
    type: "Annoucement",
    title: "Test",
    description: "",
    date: "2026-04-18",
    createdAt: "2026-04-18",
    createdBy: "Deepti",
    status: "published",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev2",
    type: "Events",
    title: "23 event",
    description: "",
    date: "2026-04-23",
    createdAt: "2026-04-18",
    createdBy: "Deepti",
    status: "published",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev3",
    type: "Annoucement",
    title: "22 april annoucement",
    description: "",
    date: "2026-04-22",
    createdAt: "2026-04-18",
    createdBy: "Deepti",
    status: "published",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev4",
    type: "Annoucement",
    title: "Test holiday",
    description: "",
    date: "2025-09-29",
    createdAt: "2025-09-19",
    createdBy: "Deepti",
    status: "published",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev5",
    type: "Annoucement",
    title: "Testing",
    description: "",
    date: "2025-09-11",
    createdAt: "2025-09-11",
    createdBy: "Deepti",
    status: "draft",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev6",
    type: "Annoucement",
    title: "Testing",
    description: "",
    date: "2025-09-11",
    createdAt: "2025-09-11",
    createdBy: "Deepti",
    status: "draft",
    access: "All",
    media: null,
    children: [],
  },
  {
    id: "ev7",
    type: "Events",
    title: "Test events test",
    description: "",
    date: "2025-09-11",
    createdAt: "2025-09-11",
    createdBy: "Deepti",
    status: "draft",
    access: "All",
    media: null,
    children: [],
  },
];

export const initialHolidays = [
  { id: "h1", date: "2026-04-02", occasion: "World Autism Day", state: "" },
  { id: "h2", date: "2026-04-02", occasion: "Nature Play Week", state: "" },
  { id: "h3", date: "2026-04-03", occasion: "Nature Play Week", state: "" },
  { id: "h4", date: "2026-04-04", occasion: "Nature Play Week", state: "" },
  { id: "h5", date: "2026-04-05", occasion: "Nature Play Week", state: "" },
  { id: "h6", date: "2026-04-06", occasion: "Nature Play Week", state: "" },
  { id: "h7", date: "2026-04-07", occasion: "Nature Play Week", state: "" },
  { id: "h8", date: "2026-04-08", occasion: "Nature Play Week", state: "" },
  { id: "h9", date: "2026-04-09", occasion: "Nature Play Week", state: "" },
  { id: "h10", date: "2026-04-10", occasion: "Nature Play Week", state: "" },
  { id: "h11", date: "2026-04-11", occasion: "Nature Play Week", state: "" },
  { id: "h12", date: "2026-04-12", occasion: "Nature Play Week", state: "" },
  { id: "h13", date: "2026-04-13", occasion: "Nature Play Week", state: "" },
  { id: "h14", date: "2026-04-18", occasion: "Good Friday - Centre Closed", state: "" },
  { id: "h15", date: "2026-04-21", occasion: "Easter Monday - Centre Closed", state: "" },
];

export const months = [
  "All Months",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function daysSince(iso) {
  if (!iso) return 0;
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}
