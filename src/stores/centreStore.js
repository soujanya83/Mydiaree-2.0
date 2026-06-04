import { create } from "zustand";
import { centerService } from "@/services/admin/centerService";

export const useCentreStore = create((set, get) => ({
  centres: [],
  activeCentreId: localStorage.getItem("activeCentreId") || null,
  activeCenterDetails: null,
  isLoading: false,
  error: null,

  setCentres: (centres) => set({ centres }),
  setActiveCentre: (id) => {
    localStorage.setItem("activeCentreId", id);
    set({ activeCentreId: id });
  },

  fetchCentres: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await centerService.getAllCenters();
      if (response.status && response.data) {
        const mappedCentres = response.data.map((c) => ({
          id: c.id,
          name: c.centerName,
          addressStreet: c.adressStreet, // Mapping the typo
          addressCity: c.addressCity,
          addressState: c.addressState,
          addressZip: c.addressZip,
          // For backward compatibility with some pages using 'address'
          address: `${c.adressStreet}, ${c.addressCity}, ${c.addressState} ${c.addressZip}`,
        }));
        
        set({ 
          centres: mappedCentres, 
          isLoading: false 
        });

        // Validate stored ID against fetched centres, fallback to first centre
        const savedId = get().activeCentreId;
        const isValid = savedId && mappedCentres.some((c) => c.id === savedId);
        if (!isValid && mappedCentres.length > 0) {
          const firstId = mappedCentres[0].id;
          localStorage.setItem("activeCentreId", firstId);
          set({ activeCentreId: firstId });
        }
      } else {
        set({ isLoading: false, error: "Failed to fetch centers" });
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.message || "Something went wrong"
      });
    }
  },

  fetchActiveCenterDetails: async (centerId) => {
    if (!centerId) {
      set({ activeCenterDetails: null });
      return;
    }
    try {
      const response = await centerService.getCenterDetails(centerId);
      if (response.status && response.data?.center) {
        set({ activeCenterDetails: response.data.center });
      } else {
        set({ activeCenterDetails: null });
      }
    } catch (error) {
      console.error("Failed to fetch center details:", error);
      set({ activeCenterDetails: null });
    }
  },
}));
