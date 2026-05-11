import { useMemo, useState } from "react";
import { Baby, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import dailyDiaryService from "@/services/daily-operations/dailyDiaryService";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChildDiaryCard } from "@/components/journal/ChildDiaryCard";
import { NewEntryModal } from "@/components/journal/NewEntryModal";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { useEffect } from "react";

export default function DailyDiaryPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const childrenFromStore = useChildrenStore((s) => s.children);
  const isLoadingStore = useChildrenStore((s) => s.isLoading);
  const fetchChildren = useChildrenStore((s) => s.fetchChildren);

  const [diaryChildren, setDiaryChildren] = useState([]);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Per-child, per-activity entries: { [childId]: { [activityKey]: {time,item,comments} } }
  const [entriesByChild, setEntriesByChild] = useState({});

  const visibleChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    return diaryChildren.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [diaryChildren, search]);

  const [isFetching, setIsFetching] = useState(false);

  const fetchDiary = async () => {
    if (!activeCentreId || !activeRoomId) return;
    setIsFetching(true);
    try {
      const response = await dailyDiaryService.listDiary({
        center_id: activeCentreId,
        room_id: activeRoomId,
        selected_date: date,
      });

      console.log("Daily dairy response ", response.data.data.children);

      if (response.data.status && response.data.data.children) {
        const rawChildren = response.data.data.children;
        const normalized = {};
        const extracted = [];

        rawChildren.forEach((item) => {
          const c = item.child;
          extracted.push({
            ...c,
            name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.name || "Child"
          });
          const cid = c.id;
          const entries = {};

          // Helper to normalize a single activity object
          const norm = (act, key) => {
            if (!act) return;
            // Handle arrays (bottle, sleep, sunscreen, toileting)
            const a = Array.isArray(act) ? act[0] : act;
            if (!a) return;

            const res = {
              id: a.id,
              comments: a.comments,
              item: a.item,
              time: a.startTime,
            };

            if (key === "sleep") {
              res.sleepTime = a.startTime;
              res.wakeTime = a.endTime;
              delete res.time;
            }

            if (key === "lunch") {
              res.server = a.serve || "1";
            }

            if (a.signature) res.signature = a.signature;
            if (a.status) res.status = a.status;

            entries[key] = res;
          };

          norm(item.breakfast, "breakfast");
          norm(item.morning_tea, "morning_tea");
          norm(item.lunch, "lunch");
          norm(item.sleep, "sleep");
          norm(item.afternoon_tea, "afternoon_tea");
          norm(item.snacks, "late_snacks");
          norm(item.sunscreen, "sunscreen");
          norm(item.toileting, "toileting");
          norm(item.bottle, "bottle");

          normalized[cid] = entries;
        });

        setEntriesByChild(normalized);
        setDiaryChildren(extracted);
      }
    } catch (error) {
      console.error("Failed to fetch diary", error);
      toast.error("Failed to load diary entries");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchDiary();
  }, [activeRoomId, date]);

  useEffect(() => {
    if (activeCentreId && activeRoomId) {
      fetchChildren({ center_id: activeCentreId, room_id: activeRoomId });
    }
  }, [activeCentreId, activeRoomId, fetchChildren]);

  const toFormData = (payload) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "child_ids[]" && Array.isArray(value)) {
        value.forEach((id) => fd.append("child_ids[]", id));
      } else if (value !== undefined && value !== null) {
        fd.append(key, value);
      }
    });
    return fd;
  };

  const handleSaveEntry = async (childId, activityKey, payload) => {
    try {
      const apiPayload = {
        date,
        "child_ids[]": [childId],
        ...payload,
      };

      // Rename specific fields for API if needed
      if (activityKey === "sleep") {
        apiPayload.sleep_time = payload.sleepTime;
        apiPayload.wake_time = payload.wakeTime;
        delete apiPayload.sleepTime;
        delete apiPayload.wakeTime;
      }

      if (activityKey === "toileting" && payload.item) {
        apiPayload.item = payload.item; // "item" is "Type" in UI for toileting
      }

      // Omit optional fields if empty
      if (!apiPayload.comments) delete apiPayload.comments;
      if (!apiPayload.signature) delete apiPayload.signature;

      const methodMap = {
        breakfast: dailyDiaryService.storeBreakfast,
        morning_tea: dailyDiaryService.storeMorningTea,
        lunch: dailyDiaryService.storeLunch,
        sleep: dailyDiaryService.storeSleep,
        afternoon_tea: dailyDiaryService.storeAfternoonTea,
        late_snacks: dailyDiaryService.storeLateSnacks,
        sunscreen: dailyDiaryService.storeSunscreen,
        toileting: dailyDiaryService.storeToileting,
        bottle: dailyDiaryService.storeBottle,
      };

      const apiMethod = methodMap[activityKey];
      if (!apiMethod) throw new Error(`No API method for ${activityKey}`);

      await apiMethod(toFormData(apiPayload));

      setEntriesByChild((prev) => ({
        ...prev,
        [childId]: { ...(prev[childId] || {}), [activityKey]: payload },
      }));
      toast.success(`${activityKey.replace("_", " ")} saved successfully`);
    } catch (error) {
      console.error("Failed to save entry", error);
      toast.error(`Failed to save ${activityKey.replace("_", " ")}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Daily Diary"
        description="Daily routines & activities shared with families"
        breadcrumbs={[{ label: "Daily Diary" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeRoomId} onValueChange={setActiveRoom}>
              <SelectTrigger className="h-9 w-[160px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-[160px]"
            />
          </div>
        }
      />

      {/* Hero / quick add */}
      <div className="mb-5 flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Daily Childcare Tracking</h2>
            <p className="text-sm text-muted-foreground">
              Monitor and track daily activities for all children
            </p>
          </div>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Entry
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search children…"
          className="h-10 pl-9"
        />
      </div>

      {isFetching ? (
        <div className="py-20 text-center text-muted-foreground">Loading data...</div>
      ) : visibleChildren.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No children found in this room.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {visibleChildren.map((c) => (
            <ChildDiaryCard
              key={c.id}
              child={c}
              date={date}
              entries={entriesByChild[c.id] || {}}
              onSaveEntry={handleSaveEntry}
            />
          ))}
        </div>
      )}

      <NewEntryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        children={diaryChildren}
        onSubmit={async (payload) => {
          try {
            const { children: selectedIds, notes, activity, ...rest } = payload;
            const data = {
              ...rest,
              comments: notes,
              date: payload.date || date,
              "child_ids[]": selectedIds,
            };

            // Mapping for sleep
            if (activity === "sleep") {
              data.sleep_time = payload.time;
              data.wake_time = payload.wakeTime;
              delete data.time;
              delete data.wakeTime;
            }

            // Omit optional fields if empty
            if (!data.comments) delete data.comments;
            if (!data.signature) delete data.signature;

            const methodMap = {
              breakfast: dailyDiaryService.storeBreakfast,
              morning_tea: dailyDiaryService.storeMorningTea,
              lunch: dailyDiaryService.storeLunch,
              sleep: dailyDiaryService.storeSleep,
              afternoon_tea: dailyDiaryService.storeAfternoonTea,
              late_snacks: dailyDiaryService.storeLateSnacks,
              sunscreen: dailyDiaryService.storeSunscreen,
              toileting: dailyDiaryService.storeToileting,
              bottle: dailyDiaryService.storeBottle,
            };

            const apiMethod = methodMap[activity];
            if (!apiMethod) throw new Error(`No API method for ${activity}`);

            await apiMethod(toFormData(data));

            setEntriesByChild((prev) => {
              const next = { ...prev };
              (selectedIds || []).forEach((cid) => {
                next[cid] = { ...(next[cid] || {}), [activity]: data };
              });
              return next;
            });
            setModalOpen(false);
            toast.success(
              `Bulk ${activity.replace("_", " ")} saved for ${selectedIds.length} children`,
            );
          } catch (error) {
            console.error("Bulk save failed", error);
            toast.error("Failed to save bulk entry");
          }
        }}
      />
    </div>
  );
}
