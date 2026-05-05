import { useMemo, useState } from "react";
import { Baby, Plus, Search } from "lucide-react";
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

export default function DailyDiaryPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const children = useChildrenStore((s) => s.children);
  const isLoading = useChildrenStore((s) => s.isLoading);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  // Per-child, per-activity entries: { [childId]: { [activityKey]: {time,item,comments} } }
  const [entriesByChild, setEntriesByChild] = useState({});

  const visibleChildren = useMemo(() => {
    const q = search.trim().toLowerCase();
    return children.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [children, search]);

  const handleSaveEntry = (childId, activityKey, payload) => {
    setEntriesByChild((prev) => ({
      ...prev,
      [childId]: { ...(prev[childId] || {}), [activityKey]: payload },
    }));
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

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading children...</div>
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
        onSubmit={(payload) => {
          // Apply bulk entry from the multi-child modal to each selected child
          const data = {
            time: payload.time,
            item: payload.item,
            comments: payload.notes,
          };
          setEntriesByChild((prev) => {
            const next = { ...prev };
            (payload.children || []).forEach((cid) => {
              next[cid] = { ...(next[cid] || {}), [payload.activity]: data };
            });
            return next;
          });
        }}
      />
    </div>
  );
}