import { useEffect, useState } from "react";
import { Search, DoorOpen } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { mockRoomsList } from "@/components/rooms/roomsData";

export default function SelectRoomsModal({ open, onOpenChange, initial = [], onSubmit }) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set());

  useEffect(() => {
    if (open) {
      setPicked(new Set(initial));
      setSearch("");
    }
  }, [open, initial]);

  const rooms = mockRoomsList.filter(
    (r) => !search.trim() || r.name.toLowerCase().includes(search.toLowerCase())
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
            <DoorOpen className="h-5 w-5 text-primary" /> Select Rooms
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 px-5 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search rooms..." className="pl-9" />
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {rooms.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                <Checkbox checked={picked.has(r.id)} onCheckedChange={() => toggle(r.id)} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.fromAge}-{r.toAge} yrs · {r.children} children · {r.educators.length} educators
                  </p>
                </div>
              </label>
            ))}
            {rooms.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No rooms found.</p>}
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