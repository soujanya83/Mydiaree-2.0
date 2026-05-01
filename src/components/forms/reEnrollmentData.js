export const sessionOptions = [
  { value: "9 Hours", label: "9 Hours", time: "8:30am - 5:30pm" },
  { value: "10 Hours (8-6)", label: "10 Hours (8-6)", time: "8:00am - 6:00pm" },
  { value: "10 Hours (8:30-6:30)", label: "10 Hours (8:30-6:30)", time: "8:30am - 6:30pm" },
  { value: "Full Day", label: "Full Day", time: "7:00am - 6:30pm" },
];

export const kinderOptions = [
  { value: "3 Year Old", label: "3-year-old Kinder" },
  { value: "4 Year Old", label: "4-year-old Kinder" },
  { value: "Unfunded", label: "Unfunded Kinder (3-5 years)" },
  { value: "Not Attending", label: "Not attending Kinder at Nextgen" },
];

export const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const initialSubmissions = [
  {
    id: 1,
    childName: "Zavian shukal",
    dob: "2022-04-29",
    parentEmail: "Rajniten@gmail.com",
    currentDays: ["Tuesday"],
    requestedDays: ["Monday", "Friday"],
    session: "9 Hours",
    kinder: "Not Attending",
    submittedAt: "2025-12-09T03:48:00",
    status: "pending",
    holidayPlans: "",
    finishingChildName: "",
    finishingLastDay: "",
  },
  {
    id: 2,
    childName: "Dheemahi Acharya",
    dob: "2022-04-21",
    parentEmail: "saub.acharya@gmail.com",
    currentDays: ["Tuesday", "Friday"],
    requestedDays: ["Monday", "Wednesday", "Friday"],
    session: "Full Day",
    kinder: "Not Attending",
    submittedAt: "2025-11-28T21:24:00",
    status: "pending",
  },
  {
    id: 3,
    childName: "Rishank Kesarla",
    dob: "2023-06-09",
    parentEmail: "lpulipat@gmail.com",
    currentDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    requestedDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    session: "10 Hours (8:30-6:30)",
    kinder: "Not Attending",
    submittedAt: "2025-11-22T00:49:00",
    status: "pending",
  },
  {
    id: 4,
    childName: "RABAAB KAUR BHINDER",
    dob: "2021-03-04",
    parentEmail: "Bhinder_894@yahoo.com",
    currentDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    requestedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    session: "9 Hours",
    kinder: "4 Year Old",
    submittedAt: "2025-11-01T01:51:00",
    status: "pending",
  },
  {
    id: 5,
    childName: "Vansh Alla",
    dob: "2021-05-12",
    parentEmail: "allaharish222@gmail.com",
    currentDays: ["Tuesday", "Wednesday", "Thursday"],
    requestedDays: ["Tuesday", "Wednesday", "Thursday"],
    session: "10 Hours (8-6)",
    kinder: "4 Year Old",
    submittedAt: "2025-10-31T07:23:00",
    status: "pending",
    holidayPlans: "We would like to cancel our enrolment as we are going on leave for extended period of time in December and january",
  },
  {
    id: 6,
    childName: "SHLOKA REDDY NAYAKANTI",
    dob: "2023-11-08",
    parentEmail: "nayakanti_praveen@hotmail.com",
    currentDays: ["Monday", "Friday"],
    requestedDays: ["Monday", "Wednesday", "Friday"],
    session: "9 Hours",
    kinder: "Not Attending",
    submittedAt: "2025-10-28T09:05:00",
    status: "pending",
  },
  {
    id: 7,
    childName: "Andaman Singh",
    dob: "2021-03-12",
    parentEmail: "beingnav@gmail.com",
    currentDays: ["Monday", "Thursday"],
    requestedDays: ["Monday", "Friday"],
    session: "9 Hours",
    kinder: "Not Attending",
    submittedAt: "2025-10-27T12:35:00",
    status: "pending",
  },
  {
    id: 8,
    childName: "Sahaswi MAddiro",
    dob: "2022-12-01",
    parentEmail: "hemasravanthi@gmail.com",
    currentDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    requestedDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    session: "9 Hours",
    kinder: "Not Attending",
    submittedAt: "2025-10-24T02:14:00",
    status: "pending",
  },
  {
    id: 9,
    childName: "Afrin Rahman Inaya",
    dob: "2022-01-04",
    parentEmail: "ayesha.akter0@gmail.com",
    currentDays: ["Friday"],
    requestedDays: ["Tuesday", "Friday"],
    session: "10 Hours (8:30-6:30)",
    kinder: "Not Attending",
    submittedAt: "2025-10-23T01:36:00",
    status: "pending",
  },
  {
    id: 10,
    childName: "Huda Shahid",
    dob: "2025-07-02",
    parentEmail: "asmaiqbal1986@gmail.com",
    currentDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    requestedDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    session: "Full Day",
    kinder: "Unfunded",
    submittedAt: "2025-10-23T01:12:00",
    status: "pending",
  },
  {
    id: 11,
    childName: "Huda Shahid",
    dob: "2024-07-02",
    parentEmail: "asmaiqbal1986@gmail.com",
    currentDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    requestedDays: ["Monday", "Tuesday", "Thursday", "Friday"],
    session: "Full Day",
    kinder: "Not Attending",
    submittedAt: "2025-10-23T01:10:00",
    status: "pending",
  },
  {
    id: 12,
    childName: "Nailah Mohammed",
    dob: "2023-04-11",
    parentEmail: "Lindali90@yahoo.com",
    currentDays: ["Monday", "Tuesday", "Friday"],
    requestedDays: ["Monday", "Wednesday", "Friday"],
    session: "10 Hours (8-6)",
    kinder: "3 Year Old",
    submittedAt: "2025-10-23T00:18:00",
    status: "pending",
  },
];

export function formatSubmittedAt(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

export function formatDob(iso) {
  if (!iso) return "--";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const dayShort = {
  Monday: "MON",
  Tuesday: "TUE",
  Wednesday: "WED",
  Thursday: "THU",
  Friday: "FRI",
};

export const kinderBadgeTone = {
  "3 Year Old": "success",
  "4 Year Old": "success",
  "Unfunded": "warning",
  "Not Attending": "muted",
};