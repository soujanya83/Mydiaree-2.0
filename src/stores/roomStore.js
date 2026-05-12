import { create } from "zustand";
import { persist } from "zustand/middleware";
import { roomService } from "@/services/centre/roomService";
import { staffService } from "@/services/admin/staffService";

export const useRoomStore = create(
  persist(
    (set, get) => ({
      rooms: [],
      roomStaffs: [],
      activeRoomId: null,
      isLoading: false,
      isSubmitting: false,
      error: null,

      setActiveRoom: (id) => set({ activeRoomId: id }),

      fetchRooms: async (centerId) => {
        if (!centerId) return;
        set({ isLoading: true, error: null });
        try {
          const response = await roomService.fetchRooms(centerId);
          if (response.status && response.rooms) {
            const newRooms = response.rooms.map((r) => ({
              ...r,
              id: r.id || r.roomid,
              centerid: r.centerid,
              ageFrom: r.ageFrom,
              ageTo: r.ageTo,
              educators: (r.educators || []).filter((e) => e.userid != null),
              children: r.children || [],
            }));

            // Fetch active staff from staffService for the educator selection list
            let staffList = [];
            try {
              const staffResponse = await staffService.getStaffSettings(centerId);
              if (staffResponse.status) {
                staffList = (staffResponse.data?.staff || [])
                  .filter(s => s.status === "ACTIVE")
                  .map((s) => ({
                    staffid: String(s.id),
                    name: s.name,
                  }));
              }
            } catch (err) {
              console.error("Failed to fetch staff in roomStore:", err);
            }

            const currentActiveId = get().activeRoomId;

            set({
              rooms: newRooms,
              roomStaffs: staffList,
              isLoading: false,
            });

            // If current active room exists in the new list, keep it.
            // Otherwise, default to the first room if available.
            const roomStillExists = newRooms.some(
              (r) => String(r.id) === String(currentActiveId)
            );

            if (roomStillExists && currentActiveId) {
              // Keep current active room
            } else if (newRooms.length > 0) {
              set({ activeRoomId: newRooms[0].id });
            } else {
              set({ activeRoomId: null });
            }
          } else {
            set({ rooms: [], roomStaffs: [], isLoading: false, error: "Failed to fetch rooms" });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error?.response?.data?.message || "Something went wrong",
          });
        }
      },

      createRoom: async (payload) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await roomService.createRoom(payload);
          if (response.status) {
            // Re-fetch rooms list to get updated data
            await get().fetchRooms(payload.centerId);
          }
          set({ isSubmitting: false });
          return response;
        } catch (error) {
          set({
            isSubmitting: false,
            error: error?.response?.data?.message || "Failed to create room",
          });
          throw error;
        }
      },

      bulkDeleteRooms: async (roomIds, centerId) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await roomService.bulkDeleteRooms(roomIds);
          if (response.status) {
            // Re-fetch rooms list to get updated data
            await get().fetchRooms(centerId);
          }
          set({ isSubmitting: false });
          return response;
        } catch (error) {
          set({
            isSubmitting: false,
            error: error?.response?.data?.message || "Failed to delete rooms",
          });
          throw error;
        }
      },
    }),
    {
      name: "room-storage",
      partialize: (state) => ({ activeRoomId: state.activeRoomId }),
    }
  )
);
