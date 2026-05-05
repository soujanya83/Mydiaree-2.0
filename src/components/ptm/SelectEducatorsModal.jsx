import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EDUCATOR_POOL } from "@/components/rooms/roomsData";
import { useRoomStore } from "@/stores/roomStore";

export default function SelectEducatorsModal({ open, onOpenChange, initial = [], roomIds = [], onSubmit }) {
  const { rooms: allStoreRooms } = useRoomStore();
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set());

  useEffect(() => {
    if (open) {
      setPicked(new Set(initial));
      setSearch("");
    }
  }, [open, initial]);

  // Suggested = educators tied to selected rooms; fallback to all
  const suggested = useMemo(() => {
    if (!roomIds.length) return EDUCATOR_POOL;
    const map = new Map();
    allStoreRooms
      .filter((r) => roomIds.includes(String(r.id)))
      .forEach((r) => (r.educators || []).forEach((e) => map.set(e.id, e)));
    return map.size ? Array.from(map.values()) : EDUCATOR_POOL;
  }, [roomIds, allStoreRooms]);

  const list = suggested.filter(
    (e) => !search.trim() || e.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) => {
    setPicked((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-lg overflow-hidden">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Tag Educators
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-5 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search educators..." className="pl-9" />
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {list.map((e) => (
              <label key={e.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                <Checkbox checked={picked.has(e.id)} onCheckedChange={() => toggle(e.id)} />
                <img src={e.avatar} alt={e.name} className="h-7 w-7 rounded-full border object-cover" />
                <span className="text-sm font-medium text-primary">{e.name}</span>
              </label>
            ))}
            {list.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No educators found.</p>}
          </div>
          {picked.size > 0 && (
            <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-medium">
              {picked.size} selected
            </div>
          )}
        </div>
        <DialogFooter className="border-t bg-muted/30 px-5 py-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { onSubmit(Array.from(picked)); onOpenChange(false); }}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}