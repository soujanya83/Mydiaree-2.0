// Mock snapshots list + shared filter helpers (re-uses observation date logic)

export { STATUS_FILTERS, DATE_FILTERS, AUTHORS, inDateRange, formatObsDate, statusBadgeClasses }
  from "@/components/observation/observationsData";

const TITLES = [
  "fgfgfg", "tf", "cgh", "bh", "Morning circle", "Sandpit fun",
  "Story time", "Outdoor adventure", "Music & movement", "Art day",
  "Block builders", "Lunch reflections",
];

const DETAILS = ["yfkuj", "fy", "dh", "vbjh", "Daily Childcare Tracking moment", "Captured during free play", "Group activity snapshot"];

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
  { id: "1", name: "testchild1 test" },
  { id: "2", name: "Liam Smith" },
  { id: "3", name: "Olivia Brown" },
  { id: "4", name: "Noah Davis" },
  { id: "5", name: "Ava Wilson" },
];

const ROOM_POOL = [
  { id: "r1", name: "test by apk" },
  { id: "r2", name: "Sunshine Room" },
  { id: "r3", name: "Rainbow Room" },
];

export const mockSnapshots = TITLES.map((title, i) => {
  const id = `snap-${i + 1}`;
  const offset = (i * 4) % 60;
  const imgCount = 1 + (i % 3);
  const media = Array.from({ length: imgCount }, (_, k) => ({
    id: `${id}-img-${k}`,
    url: SAMPLE_IMAGES[(i + k) % SAMPLE_IMAGES.length],
  }));
  const childCount = 1 + (i % 2);
  const childTags = Array.from({ length: childCount }, (_, k) => CHILD_POOL[(i + k) % CHILD_POOL.length]);
  const roomTags = [ROOM_POOL[i % ROOM_POOL.length]];
  return {
    id,
    title,
    details: DETAILS[i % DETAILS.length],
    author: AUTHORS_LIST[i % AUTHORS_LIST.length],
    childIds: childTags.map((c) => c.id),
    childTags,
    roomIds: roomTags.map((r) => r.id),
    roomTags,
    educators: [AUTHORS_LIST[i % AUTHORS_LIST.length]],
    centreId: ["c1", "c1", "c2", "c3"][i % 4],
    status: i % 4 === 3 ? "draft" : "published",
    createdAt: daysAgo(offset),
    media,
  };
});

export const SNAPSHOT_ROOMS = ROOM_POOL;
export const SNAPSHOT_CHILDREN = CHILD_POOL;
export const SNAPSHOT_STAFF = ["testtt 2", "Sarah Lee", "Mia Chen", "Daniel Park", "Priya Nair"];
