import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoomStore } from "@/stores/roomStore";
import { useCentreStore } from "@/stores/centreStore";
import { childrenService } from "@/services/centre/childrenService";

function ageString(dob) {
  if (!dob) return "";
  const b = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  return `${years} years ${months} months`;
}

const IMG_BASE = "https://mydiaree.com.au/";

export function SelectChildrenModal({ open, onOpenChange, initial = [], onSubmit }) {
  const { activeCentreId } = useCentreStore();
  const { rooms: allStoreRooms, fetchRooms } = useRoomStore();

  const [search, setSearch] = useState("");
  const [roomId, setRoomId] = useState("all");
  const [picked, setPicked] = useState(new Set());
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setPicked(new Set(initial));
      setSearch("");
      setRoomId("all");
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open || !activeCentreId) return;
    if (allStoreRooms.length === 0) {
      fetchRooms(activeCentreId);
    }
  }, [open, activeCentreId, allStoreRooms.length, fetchRooms]);

  useEffect(() => {
    if (!open || !activeCentreId) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await childrenService.filterChildren({
          center_id: activeCentreId,
          room_id: roomId === "all" ? undefined : roomId,
          search,
        });
        if (res.status) {
          setChildren(res.data?.data || []);
        } else {
          setChildren([]);
        }
      } catch (error) {
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [open, activeCentreId, roomId, search]);

  const filteredChildren = useMemo(() => children, [children]);

  const toggle = (id) => {
    const normalizedId = String(id);
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(normalizedId)) next.delete(normalizedId); else next.add(normalizedId);
      return next;
    });
  };

  const toggleMany = (ids, on) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (on) ids.forEach((i) => next.add(i));
      else ids.forEach((i) => next.delete(i));
      return next;
    });
  };

  const allChildrenIds = filteredChildren.map((c) => String(c.id));
  const allChecked = allChildrenIds.length > 0 && allChildrenIds.every((id) => picked.has(id));

  const submit = () => {
    onSubmit(Array.from(picked));
    onOpenChange(false);
  };

  const toImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${IMG_BASE}${url.replace(/^\/+/, "")}`;
  };

  const fullName = (c) => [c.name, c.lastname].filter(Boolean).join(" ").trim() || "Child";

  const ChildRow = ({ c }) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50">
      <Checkbox checked={picked.has(String(c.id))} onCheckedChange={() => toggle(c.id)} />
      <img
        src={toImageUrl(c.imageUrl) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName(c)}`}
        alt={fullName(c)}
        className="h-7 w-7 rounded-full border object-cover"
      />
      <span className="text-sm font-medium text-primary">
        {fullName(c)} <span className="text-muted-foreground font-normal">- {ageString(c.dob)}</span>
      </span>
    </label>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-lg font-semibold">Select Children</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room</p>
              <Select value={roomId} onValueChange={setRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="All rooms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rooms</SelectItem>
                  {allStoreRooms.map((room) => (
                    <SelectItem key={room.id} value={String(room.id)}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Search</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search child"
                  className="h-10 pl-9"
                />
              </div>
            </div>
          </div>

          <div className="mt-1 max-h-80 overflow-y-auto pr-1">
            <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
              <Checkbox
                checked={allChecked}
                onCheckedChange={(c) => toggleMany(allChildrenIds, !!c)}
              />
              <span className="text-sm font-semibold text-primary">Select All</span>
            </label>
            <div className="space-y-0.5">
              {isLoading ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <p className="mt-2">Loading children...</p>
                </div>
              ) : (
                <>
                  {filteredChildren.map((c) => <ChildRow key={c.id} c={c} />)}
                  {filteredChildren.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">No children found.</p>
                  )}
                </>
              )}
            </div>
          </div>

          {picked.size > 0 && (
            <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
              <span className="font-medium">{picked.size} selected</span>
              <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => setPicked(new Set())}>
                <X className="h-3 w-3" /> Clear
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="border-t bg-muted/30 px-5 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={submit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}