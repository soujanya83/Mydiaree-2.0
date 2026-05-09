import { mockDiaryEntries } from "./mocks/data";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

let entries = [...mockDiaryEntries];

export const journalService = {
  async list() {
    await delay(400);
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  },
  async create(entry) {
    await delay(200);
    const next = { id: `e${Date.now()}`, ...entry };
    entries = [next, ...entries];
    return next;
  },
};