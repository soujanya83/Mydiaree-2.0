// Mock data for the Learning & Progress module.
// Statuses cycle: not_started -> introduced -> practicing -> completed

export const PROGRESS_STATUSES = [
  { key: "introduced", label: "Introduced", color: "amber" },
  { key: "practicing", label: "Practicing", color: "sky" },
  { key: "completed", label: "Completed", color: "emerald" },
];

export const STATUS_MAP = PROGRESS_STATUSES.reduce((acc, s) => {
  acc[s.key] = s;
  return acc;
}, {});

export function nextStatus(current) {
  const order = PROGRESS_STATUSES.map((s) => s.key);
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
}

// Each child gets a default plan generated from this template.
export const PROGRESS_TEMPLATE = [
  {
    category: "Practical Life",
    items: [
      { group: "Room etiquette", title: "How to talk in the classroom" },
      { group: "Room etiquette", title: "How to walk in the classroom" },
      { group: "Room etiquette", title: "Use and carry a chair" },
      { group: "Room etiquette", title: "Carrying apparatus" },
      { group: "Room etiquette", title: "Opening and closing Locks" },
      { group: "Room etiquette", title: "Opening and closing nuts and bolts" },
      { group: "Room etiquette", title: "Opening and closing doors" },
      { group: "Room etiquette", title: "How to roll and unroll a floor mat" },
      { group: "Room etiquette", title: "Use of books" },
      { group: "Preliminary and elementary movement", title: "Pouring through a funnel" },
      { group: "Preliminary and elementary movement", title: "Pouring jug into two equals" },
      { group: "Preliminary and elementary movement", title: "Transferring objects with tweezers" },
      { group: "Preliminary and elementary movement", title: "Transferring water with a sponge" },
      { group: "Preliminary and elementary movement", title: "Threading" },
      { group: "Care of self", title: "Hand washing" },
      { group: "Care of self", title: "Buttoning frame" },
      { group: "Care of self", title: "Zipping frame" },
      { group: "Care of environment", title: "Polishing a mirror" },
      { group: "Care of environment", title: "Sweeping the floor" },
      { group: "Care of environment", title: "Watering the plants" },
    ],
  },
  {
    category: "Sensorial",
    items: [
      { group: "Visual", title: "Pink tower" },
      { group: "Visual", title: "Brown stairs" },
      { group: "Visual", title: "Red rods" },
      { group: "Visual", title: "Knobbed cylinders" },
      { group: "Tactile", title: "Rough and smooth boards" },
      { group: "Tactile", title: "Fabric box" },
      { group: "Auditory", title: "Sound cylinders" },
      { group: "Auditory", title: "Bells" },
    ],
  },
  {
    category: "Language",
    items: [
      { group: "Spoken language", title: "I Spy game" },
      { group: "Spoken language", title: "Sound games" },
      { group: "Writing", title: "Sandpaper letters" },
      { group: "Writing", title: "Movable alphabet" },
      { group: "Reading", title: "Phonetic objects" },
      { group: "Reading", title: "Phonogram booklets" },
    ],
  },
  {
    category: "Mathematics",
    items: [
      { group: "Numeration", title: "Number rods" },
      { group: "Numeration", title: "Sandpaper numerals" },
      { group: "Numeration", title: "Spindle box" },
      { group: "Decimal system", title: "Golden bead introduction" },
      { group: "Decimal system", title: "45 layout" },
    ],
  },
  {
    category: "Cultural",
    items: [
      { group: "Geography", title: "Sandpaper globe" },
      { group: "Geography", title: "Continent puzzle map" },
      { group: "Botany", title: "Parts of a plant" },
      { group: "Zoology", title: "Parts of a fish" },
    ],
  },
];

// Stable per-child statuses (deterministic so reloads stay consistent).
function seededStatus(childId, idx) {
  const idStr = String(childId || "");
  const order = PROGRESS_STATUSES.map((s) => s.key);
  const seed = (idStr.charCodeAt(0) || 1) + idx * 7;
  return order[seed % order.length];
}

export function buildPlanForChild(childId) {
  let counter = 0;
  return PROGRESS_TEMPLATE.map((cat) => ({
    category: cat.category,
    items: cat.items.map((it, i) => {
      counter += 1;
      return {
        id: `${childId}-${cat.category}-${i}`.replace(/\s+/g, "_"),
        group: it.group,
        title: it.title,
        status: seededStatus(childId, counter),
      };
    }),
  }));
}

// Extra fields for the children directory cards
export const CHILD_PHOTOS = [
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543248939-4296e1fea89b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597524678053-5dde4f1cb1c5?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555009433-fd0fb1730e54?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560859251-d563a49c5e4a?w=600&auto=format&fit=crop",
];

export function childPhoto(childId) {
  const idStr = String(childId || "");
  const n = idStr.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return CHILD_PHOTOS[n % CHILD_PHOTOS.length];
}

export const CHILD_GENDER = {
  "1": "Female",
  "2": "Male",
  "3": "Female",
  "4": "Male",
  "5": "Female",
  "6": "Male",
  "7": "Female",
  "8": "Male",
};

export const CHILD_DOB = {
  "1": "2022-08-14",
  "2": "2022-11-02",
  "3": "2021-05-23",
  "4": "2023-02-17",
  "5": "2020-09-09",
  "6": "2021-12-30",
  "7": "2022-04-05",
  "8": "2023-06-21",
};

export function formatDob(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

export function ageFromDob(iso) {
  if (!iso) return "—";
  const dob = new Date(iso);
  const now = new Date();

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

  return parts.join(" ");
}