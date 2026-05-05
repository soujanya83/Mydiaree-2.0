import { create } from "zustand";
import { childrenService } from "@/services/childrenService";

export const useChildrenStore = create((set) => ({
  children: [],
  isLoading: false,
  error: null,

  fetchChildren: async (roomId) => {
    if (!roomId) {
      set({ children: [] });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await childrenService.getChildrenByRoomId(roomId);
      if (response.status && response.children) {
        set({ 
          children: response.children, 
          isLoading: false 
        });
      } else {
        set({ children: [], isLoading: false, error: "Failed to fetch children" });
      }
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error?.response?.data?.message || "Something went wrong" 
      });
    }
  },
}));
