// Mock observation list + helpers (date filters, status colours, etc.)

export const OBSERVATION_STATUSES = ["draft", "published"];

export const STATUS_FILTERS = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const DATE_FILTERS = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
];

export const AUTHORS = ["Deepti", "Staff", "Sarah Lee", "Mia Chen", "Daniel Park"];

const TITLES = [
  "hjhgjggjh",
  "hgjhgjhvhj",
  "hgjhhj",
  "test",
  "testhh",
  "observation",
  "fraxxra",
  "gu",
  "Painting at the easel",
  "Block tower play",
  "Pouring practice",
  "Counting beads",
  "Story time reflection",
  "Outdoor obstacle course",
  "Leaf sorting",
  "Sandpaper letters intro",
  "Group greeting circle",
  "Fruit cutting station",
  "Water transfer work",
  "Colour box matching",
  "Shoe polishing",
  "Bell sound work",
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockObservations = TITLES.flatMap((title, i) => {
  const items = [];
  const count = 1 + (i % 2);
  for (let j = 0; j < count; j++) {
    const id = `obs-${i + 1}-${j}`;
    const offset = (i * 2 + j) % 60;
    items.push({
      id,
      number: 1500 + i * 2 + j,
      title,
      author: AUTHORS[(i + j) % AUTHORS.length],
      childId: String(((i + j) % 8) + 1),
      childName: [
        "Emma Johnson",
        "Liam Smith",
        "Olivia Brown",
        "Noah Davis",
        "Ava Wilson",
        "Mason Taylor",
        "Sophia Anderson",
        "James Thomas",
      ][(i + j) % 8],
      roomId: ["r1", "r2", "r3", "r4"][(i + j) % 4],
      centreId: ["c1", "c1", "c2", "c3"][(i + j) % 4],
      status: i % 3 === 0 ? "published" : "draft",
      createdAt: daysAgo(offset),
      observation:
        "Child engaged deeply with the activity, showing focused concentration and repeating the work several times.",
      reflection: "Demonstrated emerging fine motor control and independent problem-solving.",
      futurePlan: "Introduce the next level of complexity within the same material family.",
      childVoice: "“I did it all by myself!”",
      learningAnalysis:
        "Builds on practical-life sequencing and order; supports concentration cycle.",
      implementation:
        "Set out the work on the shelf at child height with accompanying control of error.",
      criticalReflection:
        "Consider pairing with a peer next session to encourage grace & courtesy.",
      tagEducators: ["Sarah Lee"],
      media: [],
      // Linked items
      linkedObservations: [],
      linkedReflections: [],
      linkedProgramPlans: [],
      // Assessments (mock)
      montessori: i % 4 === 0 ? { subject: "math", items: ["Counting 1 to 10"] } : null,
      eylf: i % 5 === 0 ? { outcome: "Outcome 1", items: ["1.1"] } : null,
      development: null,
    });
  }
  return items;
});

// ===== Date filter logic =====

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function inDateRange(iso, range) {
  if (range === "all") return true;
  const date = new Date(iso);
  const today = startOfDay(new Date());
  const day = 24 * 60 * 60 * 1000;

  switch (range) {
    case "today":
      return startOfDay(date).getTime() === today.getTime();
    case "yesterday":
      return startOfDay(date).getTime() === today.getTime() - day;
    case "this-week": {
      const dow = today.getDay() || 7; // Mon=1..Sun=7
      const start = new Date(today.getTime() - (dow - 1) * day);
      return date >= start;
    }
    case "last-week": {
      const dow = today.getDay() || 7;
      const startThis = new Date(today.getTime() - (dow - 1) * day);
      const startLast = new Date(startThis.getTime() - 7 * day);
      return date >= startLast && date < startThis;
    }
    case "this-month":
      return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    case "last-month": {
      const m = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
      const y = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
      return date.getMonth() === m && date.getFullYear() === y;
    }
    default:
      return true;
  }
}

export function formatObsDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function statusBadgeClasses(status) {
  if (status === "published") return "bg-emerald-500 text-white";
  return "bg-amber-400 text-amber-950";
}
