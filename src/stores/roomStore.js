import { create } from "zustand";
import { persist } from "zustand/middleware";
import { roomService } from "@/services/roomService";

export const useRoomStore = create(
  persist(
    (set, get) => ({
      rooms: [],
      activeRoomId: null,
      isLoading: false,
      error: null,

      setActiveRoom: (id) => set({ activeRoomId: id }),

      fetchRooms: async (centerId) => {
        if (!centerId) return;
        set({ isLoading: true, error: null });
        try {
          const response = await roomService.getRoomsByCenterId(centerId);
          if (response.status && response.rooms) {
            const newRooms = response.rooms;
            const currentActiveId = get().activeRoomId;
            
            set({ 
              rooms: newRooms, 
              isLoading: false 
            });

            // If current active room exists in the new list, keep it.
            // Otherwise, default to the first room if available.
            const roomStillExists = newRooms.some(r => String(r.id) === String(currentActiveId));
            
            if (roomStillExists && currentActiveId) {
              // Keep current active room
            } else if (newRooms.length > 0) {
              set({ activeRoomId: newRooms[0].id });
            } else {
              set({ activeRoomId: null });
            }
          } else {
            set({ rooms: [], isLoading: false, error: "Failed to fetch rooms" });
          }
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error?.response?.data?.message || "Something went wrong" 
          });
        }
      },
    }),
    {
      name: "room-storage",
      partialize: (state) => ({ activeRoomId: state.activeRoomId }),
    }
  )
);
