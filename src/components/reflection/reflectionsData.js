// Mock daily-reflection list + shared filter helpers (re-uses date logic)

export { STATUS_FILTERS, DATE_FILTERS, AUTHORS, inDateRange, formatObsDate, statusBadgeClasses }
  from "@/components/observation/observationsData";

const TITLES = [
  "fraxxra", "test", "Morning circle reflection", "Outdoor play insights",
  "Lunchtime conversations", "Quiet corner observations", "Group story time",
  "Sandpit collaboration", "Music and movement", "Art exploration",
  "Nature walk reflection", "Block area discoveries",
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const AUTHORS_LIST = ["Deepti", "Staff", "Sarah Lee", "Mia Chen", "Daniel Park"];

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543248939-4296e1fea89b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597524678053-5dde4f1cb1c5?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555009433-fd0fb1730e54?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=800&auto=format&fit=crop",
];

const CHILD_POOL = [
  { id: "1", name: "Emma Johnson" },
  { id: "2", name: "Liam Smith" },
  { id: "3", name: "Olivia Brown" },
  { id: "4", name: "Noah Davis" },
  { id: "5", name: "Ava Wilson" },
  { id: "6", name: "Mason Taylor" },
  { id: "7", name: "Sophia Anderson" },
  { id: "8", name: "James Thomas" },
];

export const mockReflections = TITLES.flatMap((title, i) => {
  const items = [];
  const count = 1 + (i % 2);
  for (let j = 0; j < count; j++) {
    const id = `refl-${i + 1}-${j}`;
    const offset = (i * 3 + j) % 60;
    const imgCount = 1 + ((i + j) % 3);
    const media = Array.from({ length: imgCount }, (_, k) => ({
      id: `${id}-img-${k}`,
      url: SAMPLE_IMAGES[(i * 2 + j + k) % SAMPLE_IMAGES.length],
    }));
    const childCount = 1 + ((i + j) % 3);
    const childTags = Array.from({ length: childCount }, (_, k) => CHILD_POOL[(i + j + k) % CHILD_POOL.length]);
    items.push({
      id,
      title,
      author: AUTHORS_LIST[(i + j) % AUTHORS_LIST.length],
      childId: String(((i + j) % 8) + 1),
      childName: ["Emma Johnson", "Liam Smith", "Olivia Brown", "Noah Davis", "Ava Wilson", "Mason Taylor", "Sophia Anderson", "James Thomas"][(i + j) % 8],
      roomIds: [["r1", "r2", "r3", "r4"][(i + j) % 4]],
      childIds: childTags.map((c) => c.id),
      childTags,
      educators: [AUTHORS_LIST[(i + j) % AUTHORS_LIST.length]],
      centreId: ["c1", "c1", "c2", "c3"][(i + j) % 4],
      status: i % 3 === 0 ? "published" : "draft",
      createdAt: daysAgo(offset),
      reflection: "Educators reflected on engagement, transitions, and child voice across the day.",
      eylf: i % 2 === 0 ? ["Outcome 1 - 1.1 Children feel safe, secure, and supported"] : [],
      media,
    });
  }
  return items;
});