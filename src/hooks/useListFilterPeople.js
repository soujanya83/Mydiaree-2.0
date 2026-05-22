import { useEffect, useMemo, useState } from "react";
import { childrenService } from "@/services/centre/childrenService";
import { roomService } from "@/services/centre/roomService";
import { personDisplayName } from "@/utils/personDisplay";

function dedupeById(list) {
  const map = new Map();
  list.forEach((item) => {
    if (item?.id) map.set(String(item.id), item);
  });
  return Array.from(map.values());
}

function mapStaffItem(staff) {
  const id = String(staff.staffid ?? staff.userid ?? staff.id ?? "");
  if (!id || !staff.name) return null;
  return {
    id,
    name: staff.name,
    imageUrl: staff.imageUrl,
  };
}

function mapChildItem(child) {
  const id = String(child.id ?? "");
  if (!id) return null;
  return {
    id,
    name: personDisplayName(child, `Child ${id}`),
    lastname: child.lastname,
    imageUrl: child.imageUrl,
  };
}

export function useListFilterPeople({ activeCentreId, activeRoomId, rooms = [] }) {
  const [centerStaffs, setCenterStaffs] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);

  useEffect(() => {
    setStaffSearch("");
    setChildrenSearch("");
  }, [activeRoomId, activeCentreId]);

  useEffect(() => {
    if (!activeCentreId) {
      setCenterStaffs([]);
      return;
    }

    let cancelled = false;
    roomService
      .fetchRooms(activeCentreId)
      .then((data) => {
        if (cancelled || !data?.status) return;
        const mapped = dedupeById(
          (data.roomStaffs || []).map(mapStaffItem).filter(Boolean),
        );
        setCenterStaffs(mapped);
      })
      .catch((error) => {
        console.error("Failed to load center staff:", error);
        if (!cancelled) setCenterStaffs([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCentreId]);

  const roomEducators = useMemo(() => {
    if (!activeRoomId) return [];
    const room = rooms.find((r) => String(r.id) === String(activeRoomId));
    return dedupeById(
      (room?.educators || []).map(mapStaffItem).filter(Boolean),
    );
  }, [rooms, activeRoomId]);

  const roomChildren = useMemo(() => {
    if (!activeRoomId) return [];
    const room = rooms.find((r) => String(r.id) === String(activeRoomId));
    return dedupeById(
      (room?.children || []).map(mapChildItem).filter(Boolean),
    );
  }, [rooms, activeRoomId]);

  const staffSource = activeRoomId ? roomEducators : centerStaffs;

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return staffSource;
    return staffSource.filter((staff) => staff.name?.toLowerCase().includes(query));
  }, [staffSource, staffSearch]);

  useEffect(() => {
    if (!activeCentreId || !activeRoomId) {
      setChildrenList([]);
      return;
    }

    let cancelled = false;
    setIsChildrenLoading(true);

    childrenService
      .filterChildren({
        room_id: activeRoomId,
        center_id: activeCentreId,
        search: childrenSearch,
        page: 1,
        per_page: 100,
      })
      .then((response) => {
        if (cancelled) return;
        const rows = response.data?.data || response.data || [];
        const mapped = dedupeById(rows.map(mapChildItem).filter(Boolean));
        setChildrenList(mapped.length > 0 ? mapped : roomChildren);
      })
      .catch((error) => {
        console.error("Failed to load children:", error);
        if (!cancelled) setChildrenList(roomChildren);
      })
      .finally(() => {
        if (!cancelled) setIsChildrenLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCentreId, activeRoomId, childrenSearch, roomChildren]);

  const filteredChildren = useMemo(() => {
    const query = childrenSearch.trim().toLowerCase();
    if (!query) return childrenList;
    return childrenList.filter(
      (child) =>
        child.name?.toLowerCase().includes(query) ||
        child.lastname?.toLowerCase().includes(query),
    );
  }, [childrenList, childrenSearch]);

  return {
    filteredStaff,
    filteredChildren,
    staffSearch,
    setStaffSearch,
    childrenSearch,
    setChildrenSearch,
    isChildrenLoading,
    clearPersonSearch: () => {
      setStaffSearch("");
      setChildrenSearch("");
    },
  };
}
