import { useEffect, useState } from "react";
import { staffService } from "@/services/admin/staffService";
import { childrenService } from "@/services/centre/childrenService";
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
  const name = personDisplayName(staff, staff.name || `Staff ${id}`);
  if (!id || !name) return null;
  return {
    id,
    name,
    lastname: staff.lastname,
    imageUrl: staff.imageUrl || staff.image || staff.photo,
  };
}

function mapChildItem(child) {
  const id = String(child.id ?? "");
  if (!id) return null;
  return {
    id,
    name: child.name || `Child ${id}`,
    lastname: child.lastname,
    imageUrl: child.imageUrl,
  };
}

export function useListFilterPeople({ activeCentreId, activeRoomId }) {
  const [centerStaffs, setCenterStaffs] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  const [childrenList, setChildrenList] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);

  useEffect(() => {
    setStaffSearch("");
    setStaffPage(1);
    setChildrenSearch("");
    setChildrenPage(1);
  }, [activeRoomId, activeCentreId]);

  useEffect(() => {
    setChildrenPage(1);
  }, [childrenSearch]);

  useEffect(() => {
    if (!activeCentreId) {
      setCenterStaffs([]);
      setStaffTotalPages(1);
      return;
    }

    let cancelled = false;
    setIsStaffLoading(true);

    staffService
      .getStaffSettings({
        center_id: activeCentreId,
        search: staffSearch,
        page: staffPage,
        per_page: 50,
      })
      .then((response) => {
        if (cancelled) return;
        const rows = response.data?.staff?.data || response.data?.staff || [];
        const activeStaff = rows.filter((item) => item.status === "ACTIVE");
        const mapped = dedupeById(activeStaff.map(mapStaffItem).filter(Boolean));
        const lastPage = response.data?.staff?.last_page || response.pagination?.last_page || 1;

        setCenterStaffs((prev) => (staffPage === 1 ? mapped : dedupeById([...prev, ...mapped])));
        setStaffTotalPages(lastPage);
      })
      .catch((error) => {
        console.error("Failed to load center staff:", error);
        if (!cancelled && staffPage === 1) setCenterStaffs([]);
      })
      .finally(() => {
        if (!cancelled) setIsStaffLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCentreId, staffSearch, staffPage]);

  useEffect(() => {
    if (!activeCentreId) {
      setChildrenList([]);
      setChildrenTotalPages(1);
      return;
    }

    let cancelled = false;
    setIsChildrenLoading(true);

    const params = {
      center_id: activeCentreId,
      search: childrenSearch,
      page: childrenPage,
      per_page: 20,
    };

    if (activeRoomId && activeRoomId !== "all") {
      params.room_id = activeRoomId;
    }

    childrenService
      .filterChildren(params)
      .then((response) => {
        if (cancelled) return;
        const rows = response.data?.data || response.data || [];
        const lastPage = response.pagination?.last_page || response.data?.last_page || 1;
        const mapped = dedupeById(rows.map(mapChildItem).filter(Boolean));

        setChildrenList((prev) => (childrenPage === 1 ? mapped : dedupeById([...prev, ...mapped])));
        setChildrenTotalPages(lastPage);
      })
      .catch((error) => {
        console.error("Failed to load children:", error);
        if (!cancelled && childrenPage === 1) setChildrenList([]);
      })
      .finally(() => {
        if (!cancelled) setIsChildrenLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCentreId, activeRoomId, childrenSearch, childrenPage]);

  // The API already filters by search, so we can just return childrenList directly.
  // However, we maintain the name `filteredChildren` to not break existing components.
  const filteredChildren = childrenList;

  const loadMoreChildren = () => {
    if (!isChildrenLoading && childrenPage < childrenTotalPages) {
      setChildrenPage((prev) => prev + 1);
    }
  };

  const loadMoreStaff = () => {
    if (!isStaffLoading && staffPage < staffTotalPages) {
      setStaffPage((prev) => prev + 1);
    }
  };

  const hasMoreChildren = childrenPage < childrenTotalPages;
  const hasMoreStaff = staffPage < staffTotalPages;
  const updateStaffSearch = (value) => {
    setStaffPage(1);
    setStaffSearch(value);
  };

  return {
    filteredStaff: centerStaffs,
    filteredChildren,
    staffSearch,
    setStaffSearch: updateStaffSearch,
    childrenSearch,
    setChildrenSearch,
    isStaffLoading,
    isChildrenLoading,
    loadMoreStaff,
    loadMoreChildren,
    hasMoreStaff,
    hasMoreChildren,
    clearPersonSearch: () => {
      setStaffSearch("");
      setStaffPage(1);
      setChildrenSearch("");
      setChildrenPage(1);
    },
  };
}
