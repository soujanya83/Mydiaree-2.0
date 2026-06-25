import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  X,
  Search,
  DoorOpen,
  User,
  Users,
  Loader2,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { programPlanService } from "@/services/learning/programPlanService";
import { childrenService } from "@/services/centre/childrenService";
import { staffService } from "@/services/admin/staffService";
import { toast } from "sonner";
import { IMG_BASE_API } from "../../api/imageapi";
import { MONTHS, YEARS } from "./data";

const avatarUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE_API}${url.replace(/^\/+/, "")}`;
};

const fullName = (person, fallback = "Unknown") =>
  [person?.name, person?.lastname].filter(Boolean).join(" ").trim() || person?.name || fallback;

const mergeById = (current, next) => {
  const map = new Map(current.map((item) => [String(item.id), item]));
  next.forEach((item) => {
    if (item?.id !== undefined && item?.id !== null) map.set(String(item.id), item);
  });
  return Array.from(map.values());
};

export function NewProgramPlanTitleModal({ open, onClose, onSubmit, activeCentreId }) {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(MONTHS[currentMonthIdx]);
  const [year, setYear] = useState(currentYear);
  const [isCreating, setIsCreating] = useState(false);

  // Rooms
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");

  // Staff
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);

  // Children
  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMonth(MONTHS[currentMonthIdx]);
      setYear(currentYear);
      setSelectedRooms([]);
      setSelectedStaff([]);
      setSelectedChildren([]);
      setStaffSearch("");
      setChildrenSearch("");
      setRoomSearch("");
      setStaffList([]);
      setChildrenList([]);
      setIsCreating(false);
    }
  }, [open, currentMonthIdx, currentYear]);

  // Fetch rooms when modal opens
  useEffect(() => {
    if (!open || !activeCentreId) return;
    const loadRooms = async () => {
      setIsRoomsLoading(true);
      try {
        const roomsData = await programPlanService.getRoomsAndStaff(activeCentreId);
        if (roomsData.status) {
          setAvailableRooms(roomsData.rooms || roomsData.data?.rooms || []);
        }
      } catch (error) {
        console.error("Failed to load rooms:", error);
      } finally {
        setIsRoomsLoading(false);
      }
    };
    loadRooms();
  }, [open, activeCentreId]);

  // Fetch staff when rooms change
  const fetchStaff = useCallback(
    async (pageNumber, searchQuery, roomIds) => {
      if (!activeCentreId || roomIds.length === 0) {
        setStaffList([]);
        setStaffTotalPages(1);
        return;
      }
      setIsStaffLoading(true);
      try {
        const responses = await Promise.all(
          roomIds.map((roomId) =>
            staffService.getStaffSettings({
              center_id: activeCentreId,
              search: searchQuery,
              roomid: roomId,
              page: pageNumber,
              per_page: 50,
            }),
          ),
        );
        const pageData = responses.flatMap(
          (response) => response.data?.staff?.data || response.data?.staff || [],
        );
        const activeStaff = mergeById(
          [],
          pageData.filter((item) => item.status === "ACTIVE"),
        );
        const lastPage = Math.max(
          1,
          ...responses.map(
            (response) => response.data?.staff?.last_page || response.pagination?.last_page || 1,
          ),
        );
        setStaffList((prev) => (pageNumber === 1 ? activeStaff : mergeById(prev, activeStaff)));
        setStaffTotalPages(lastPage);
      } catch (error) {
        console.error("Failed to load staff:", error);
      } finally {
        setIsStaffLoading(false);
      }
    },
    [activeCentreId],
  );

  // Fetch children when rooms change
  const fetchChildren = useCallback(
    async (pageNumber, searchQuery, roomIds) => {
      if (!activeCentreId || roomIds.length === 0) {
        setChildrenList([]);
        setChildrenTotalPages(1);
        return;
      }
      setIsChildrenLoading(true);
      try {
        const responses = await Promise.all(
          roomIds.map((roomId) =>
            childrenService.filterChildren({
              status: "Active",
              room_id: roomId,
              center_id: activeCentreId,
              search: searchQuery,
              page: pageNumber,
              per_page: 50,
            }),
          ),
        );
        const pageData = responses.flatMap(
          (response) => response.data?.data || response.data || [],
        );
        const lastPage = Math.max(
          1,
          ...responses.map(
            (response) => response.pagination?.last_page || response.data?.last_page || 1,
          ),
        );
        const unique = mergeById([], pageData);
        setChildrenList((prev) => (pageNumber === 1 ? unique : mergeById(prev, unique)));
        setChildrenTotalPages(lastPage);
      } catch (error) {
        console.error("Failed to load children:", error);
      } finally {
        setIsChildrenLoading(false);
      }
    },
    [activeCentreId],
  );

  useEffect(() => {
    setStaffPage(1);
    fetchStaff(1, staffSearch, selectedRooms);
  }, [fetchStaff, staffSearch, selectedRooms]);

  useEffect(() => {
    setChildrenPage(1);
    fetchChildren(1, childrenSearch, selectedRooms);
  }, [fetchChildren, childrenSearch, selectedRooms]);

  // Clear staff/children when rooms change
  useEffect(() => {
    setSelectedStaff([]);
    setSelectedChildren([]);
  }, [selectedRooms.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRooms = useMemo(() => {
    if (!roomSearch.trim()) return availableRooms;
    return availableRooms.filter((r) =>
      r.name.toLowerCase().includes(roomSearch.toLowerCase()),
    );
  }, [availableRooms, roomSearch]);

  const canSubmit =
    selectedRooms.length > 0 &&
    selectedStaff.length > 0 &&
    selectedChildren.length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || isCreating) return;

    setIsCreating(true);
    try {
      // Build the program plan creation payload
      const payload = {
        centreId: activeCentreId,
        roomId: selectedRooms[0], // primary room
        month,
        year,
        educators: selectedStaff,
        children: selectedChildren,
        status: "draft",
      };

      const res = await programPlanService.saveProgramPlan(payload);
      if (res.status === "success" || res.status === true) {
        const newId = res.plan_id;
        if (!newId) {
          toast.error("Failed to get program plan ID from server");
          return;
        }
        toast.success(res.message || "Program plan created");
        onSubmit(newId);
      } else {
        toast.error(res.message || "Failed to create program plan");
      }
    } catch (err) {
      console.error("Create program plan error:", err);
      toast.error("An error occurred while creating the program plan");
    } finally {
      setIsCreating(false);
    }
  };

  const toggleRoom = (id) => {
    setSelectedRooms((prev) => (prev.includes(id) ? [] : [id]));
  };

  const toggleStaff = (id) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleChild = (id) => {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Program Plan
              </p>
              <h2 className="mt-1 text-xl font-bold text-foreground">Create New Program Plan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your program plan with a month, year, room, educators, and children.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Month & Year Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Month <span className="text-destructive">*</span>
              </label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Year <span className="text-destructive">*</span>
              </label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rooms and Educators Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rooms Selection */}
            <PickerSection
              label="Rooms"
              icon={DoorOpen}
              required
              count={selectedRooms.length}
              search={roomSearch}
              onSearchChange={setRoomSearch}
              searchPlaceholder="Search rooms..."
              isLoading={isRoomsLoading}
              emptyMessage="No rooms available"
            >
              {filteredRooms.map((room) => {
                const roomId = String(room.id);
                const selected = selectedRooms.includes(roomId);
                return (
                  <SelectableItem
                    key={roomId}
                    label={room.name}
                    selected={selected}
                    onClick={() => toggleRoom(roomId)}
                  />
                );
              })}
            </PickerSection>

            {/* Educators Selection */}
            <PickerSection
              label="Educators"
              icon={Users}
              required
              count={selectedStaff.length}
              search={staffSearch}
              onSearchChange={setStaffSearch}
              searchPlaceholder="Search educators..."
              isLoading={isStaffLoading}
              disabled={selectedRooms.length === 0}
              disabledMessage="Select a room first to see educators"
              emptyMessage="No educators found in selected rooms"
              hasMore={staffPage < staffTotalPages}
              onLoadMore={() => {
                const next = staffPage + 1;
                setStaffPage(next);
                fetchStaff(next, staffSearch, selectedRooms);
              }}
            >
              {staffList.map((s) => {
                const sId = String(s.id);
                const selected = selectedStaff.includes(sId);
                return (
                  <SelectableItem
                    key={sId}
                    label={s.name || `Staff ${s.id}`}
                    imageUrl={s.imageUrl}
                    meta={s.title || s.userType || "Staff"}
                    selected={selected}
                    onClick={() => toggleStaff(sId)}
                  />
                );
              })}
            </PickerSection>
          </div>

          {/* Children Selection */}
          <PickerSection
            label="Children"
            icon={User}
            required
            count={selectedChildren.length}
            search={childrenSearch}
            onSearchChange={setChildrenSearch}
            searchPlaceholder="Search children..."
            isLoading={isChildrenLoading}
            disabled={selectedRooms.length === 0}
            disabledMessage="Select a room first to see children"
            emptyMessage="No children found in selected rooms"
            hasMore={childrenPage < childrenTotalPages}
            onLoadMore={() => {
              const next = childrenPage + 1;
              setChildrenPage(next);
              fetchChildren(next, childrenSearch, selectedRooms);
            }}
          >
            {childrenList.map((c) => {
              const cId = String(c.id);
              const selected = selectedChildren.includes(cId);
              return (
                <SelectableItem
                  key={cId}
                  label={fullName(c, `Child ${c.id}`)}
                  imageUrl={c.imageUrl}
                  meta={c.room ? `Room: ${c.room}` : "Child"}
                  selected={selected}
                  onClick={() => toggleChild(cId)}
                />
              );
            })}
          </PickerSection>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            You can add experiences, subject details, and EYLF outcomes on the next screen.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isCreating}
              className="rounded-xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function PickerSection({
  label,
  icon: Icon,
  required,
  count,
  search,
  onSearchChange,
  searchPlaceholder,
  isLoading,
  disabled,
  disabledMessage,
  emptyMessage,
  hasMore,
  onLoadMore,
  children,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        {count > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            {count} selected
          </span>
        )}
      </div>

      {disabled ? (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-6 text-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            {disabledMessage}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/10 overflow-hidden">
          {/* Search */}
          <div className="border-b border-border px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 pl-8 border-none bg-transparent text-sm focus-visible:ring-primary/50"
              />
            </div>
          </div>

          {/* Items */}
          <div className="max-h-48 overflow-y-auto p-2">
            {isLoading && !children?.length ? (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="mt-1.5 text-xs font-medium">Loading...</p>
              </div>
            ) : !children?.length ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                <Info className="h-6 w-6 opacity-30 mb-1" />
                <p className="text-xs font-medium">{emptyMessage || "No items"}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {children}
                </div>
                {isLoading && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
                {!isLoading && hasMore && (
                  <button
                    type="button"
                    onClick={onLoadMore}
                    className="mt-1.5 w-full rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SelectableItem({ label, imageUrl, meta, selected, onClick }) {
  const url = avatarUrl(imageUrl);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent hover:bg-muted/50"
      }`}
    >
      {url ? (
        <img
          src={url}
          alt={label}
          className="h-8 w-8 shrink-0 rounded-full border border-border object-contain"
          loading="lazy"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-primary/10 text-[10px] font-bold text-primary">
          {label
            .split(/\s+/)
            .map((part) => part[0])
            .filter(Boolean)
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{label}</div>
        {meta && <div className="truncate text-[10px] text-muted-foreground">{meta}</div>}
      </div>
      <span
         className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        }`}
      >
        {selected && <Check className="h-3 w-3" />}
      </span>
    </button>
  );
}
