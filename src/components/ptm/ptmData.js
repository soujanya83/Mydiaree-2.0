export const ptmCenters = ["Melbourne Center", "Carramar Center2", "Brisbane Center"];

export const TIME_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

export const initialPtms = [
  {
    id: "ptm1",
    title: "ffggf",
    objective: "gjgj",
    status: "Published",
    date: "2026-04-30",
    createdBy: "Deepti",
    center: "Melbourne Center",
    rooms: ["test"],
    educators: ["adil", "admin"],
    children: [
      { id: "c1", name: "test1", date: "2026-04-30", slot: "09:00 AM - 10:00 AM", status: "On Schedule" },
      { id: "c2", name: "testchild3", date: "2026-04-30", slot: "09:00 AM - 10:00 AM", status: "On Schedule" },
    ],
    attended: false,
  },
  {
    id: "ptm2",
    title: "Term 1 Review",
    objective: "Discuss progress and next term goals",
    status: "Published",
    date: "2026-05-15",
    createdBy: "Sarah",
    center: "Melbourne Center",
    rooms: ["test by apk"],
    educators: ["Sarah Lee"],
    children: [
      { id: "c3", name: "Liam", date: "2026-05-15", slot: "10:00 AM - 11:00 AM", status: "On Schedule" },
    ],
    attended: false,
  },
];