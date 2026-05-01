import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultCentres = [
  { id: "c1", name: "Nextgen Montessori — Truganina", code: "TRG", address: "Truganina, VIC" },
  { id: "c2", name: "Nextgen Montessori — Tarneit", code: "TRN", address: "Tarneit, VIC" },
  { id: "c3", name: "Nextgen Montessori — Werribee", code: "WBE", address: "Werribee, VIC" },
];

export const useCentreStore = create(
  persist(
    (set) => ({
      centres: defaultCentres,
      activeCentreId: defaultCentres[0].id,
      setCentres: (centres) => set({ centres }),
      setActiveCentre: (id) => set({ activeCentreId: id }),
    }),
    { name: "mydiaree.centre" }
  )
);
