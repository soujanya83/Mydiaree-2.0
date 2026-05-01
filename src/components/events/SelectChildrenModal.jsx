import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockChildrenList } from "@/components/children/childrenData";
import { mockRoomsList } from "@/components/rooms/roomsData";

function ageString(dob) {
  if (!dob) return "";
  const b = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - b.getFullYear();
  let months = now.getMonth() - b.getMonth();
  if (months < 0) { years -= 1; months += 12; }
  return `${years} years ${months} months`;
}

const GROUPS = [
  { id: "g1", name: "Toddler (0-2.6Yrs)", filter: (c) => yearsOf(c.dob) <= 2 },
  { id: "g2", name: "Primary Montessori (2.6Yrs-6Yrs)", filter: (c) => yearsOf(c.dob) > 2 && yearsOf(c.dob) <= 6 },
  { id: "g3", name: "Elementary (6Yrs-12Yrs)", filter: (c) => yearsOf(c.dob) > 6 && yearsOf(c.dob) <= 12 },
];
function yearsOf(dob) {
  if (!dob) return 0;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export function SelectChildrenModal({ open, onOpenChange, initial = [], onSubmit }) {
  const [tab, setTab] = useState("children");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set());

  useEffect(() => {
    if (open) {
      setPicked(new Set(initial));
      setSearch("");
      setTab("children");
    }
  }, [open, initial]);

  const matchSearch = (c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${c.firstName} ${c.lastName}`.toLowerCase();
    return name.includes(q) || ageString(c.dob).toLowerCase().includes(q);
  };

  const filteredChildren = useMemo(
    () => mockChildrenList.filter(matchSearch),
    [search]
  );

  const toggle = (id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
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

  const allChildrenIds = filteredChildren.map((c) => c.id);
  const allChecked = allChildrenIds.length > 0 && allChildrenIds.every((id) => picked.has(id));

  const submit = () => {
    onSubmit(Array.from(picked));
    onOpenChange(false);
  };

  const ChildRow = ({ c, indent = false }) => (
    <label className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/50 ${indent ? "ml-7" : ""}`}>
      <Checkbox checked={picked.has(c.id)} onCheckedChange={() => toggle(c.id)} />
      <img
        src={c.image}
        alt={c.firstName}
        className="h-7 w-7 rounded-full border object-cover"
      />
      <span className="text-sm font-medium text-primary">
        {c.firstName} {c.lastName} <span className="text-muted-foreground font-normal">- {ageString(c.dob)}</span>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Enter child name or age to search"
              className="h-10 pl-9"
            />
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full justify-start gap-1 rounded-none border-b bg-transparent p-0">
              {[
                { v: "children", l: "Children" },
                { v: "groups", l: "Groups" },
                { v: "rooms", l: "Rooms" },
              ].map((t) => (
                <TabsTrigger
                  key={t.v}
                  value={t.v}
                  className="rounded-md border border-transparent px-4 py-1.5 text-sm font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {t.l}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Children */}
            <TabsContent value="children" className="mt-3 max-h-80 overflow-y-auto pr-1">
              <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(c) => toggleMany(allChildrenIds, !!c)}
                />
                <span className="text-sm font-semibold text-primary">Select All</span>
              </label>
              <div className="space-y-0.5">
                {filteredChildren.map((c) => <ChildRow key={c.id} c={c} />)}
                {filteredChildren.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No children found.</p>
                )}
              </div>
            </TabsContent>

            {/* Groups */}
            <TabsContent value="groups" className="mt-3 max-h-80 overflow-y-auto pr-1">
              <div className="space-y-3">
                {GROUPS.map((g) => {
                  const members = mockChildrenList.filter(g.filter).filter(matchSearch);
                  const ids = members.map((c) => c.id);
                  const groupChecked = ids.length > 0 && ids.every((id) => picked.has(id));
                  return (
                    <div key={g.id} className="space-y-0.5">
                      <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                        <Checkbox
                          checked={groupChecked}
                          onCheckedChange={(c) => toggleMany(ids, !!c)}
                        />
                        <span className="text-sm font-semibold text-primary">{g.name}</span>
                      </label>
                      {members.map((c) => <ChildRow key={c.id} c={c} indent />)}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Rooms */}
            <TabsContent value="rooms" className="mt-3 max-h-80 overflow-y-auto pr-1">
              <div className="space-y-3">
                {mockRoomsList.map((r) => {
                  const members = mockChildrenList
                    .filter((c) => c.roomName === r.name)
                    .filter(matchSearch);
                  const ids = members.map((c) => c.id);
                  const roomChecked = ids.length > 0 && ids.every((id) => picked.has(id));
                  return (
                    <div key={r.id} className="space-y-0.5">
                      <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
                        <Checkbox
                          checked={roomChecked}
                          disabled={ids.length === 0}
                          onCheckedChange={(c) => toggleMany(ids, !!c)}
                        />
                        <span className="text-sm font-semibold text-primary">{r.name}</span>
                      </label>
                      {members.map((c) => <ChildRow key={c.id} c={c} indent />)}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

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