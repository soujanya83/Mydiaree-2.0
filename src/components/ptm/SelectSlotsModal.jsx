import { useEffect, useMemo, useState } from "react";
import { Search, Info, X, Check } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TIME_SLOTS } from "./ptmData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

function buildSlot(h, m, p, eh, em, ep) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)} ${p} - ${pad(eh)}:${pad(em)} ${ep}`;
}

export default function SelectSlotsModal({ open, onOpenChange, date, initial = [], onSubmit }) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set(initial));
  const [extraSlots, setExtraSlots] = useState([]);
  const [start, setStart] = useState({ h: 7, m: "00", p: "AM" });
  const [end, setEnd] = useState({ h: 10, m: "00", p: "AM" });

  useEffect(() => {
    if (open) {
      setPicked(new Set(initial));
      setExtraSlots([]);
      setSearch("");
    }
  }, [open, initial]);

  const allSlots = useMemo(() => [...TIME_SLOTS, ...extraSlots], [extraSlots]);
  const filtered = allSlots.filter((s) => !search.trim() || s.toLowerCase().includes(search.toLowerCase()));

  const toggle = (s) => {
    setPicked((p) => {
      const n = new Set(p);
      n.has(s) ? n.delete(s) : n.add(s);
      return n;
    });
  };

  const allChecked = filtered.length > 0 && filtered.every((s) => picked.has(s));
  const toggleAll = (on) => {
    setPicked((p) => {
      const n = new Set(p);
      filtered.forEach((s) => (on ? n.add(s) : n.delete(s)));
      return n;
    });
  };

  const addCustom = () => {
    const slot = buildSlot(start.h, start.m, start.p, end.h, end.m, end.p);
    if (allSlots.includes(slot)) return toast.error("Slot already exists");
    setExtraSlots((arr) => [...arr, slot]);
    setPicked((p) => new Set(p).add(slot));
    toast.success("Slot added");
  };

  const HourInput = (val, set) => (
    <Input type="number" min={1} max={12} value={val.h} onChange={(e) => set({ ...val, h: e.target.value })} className="h-9 w-16" />
  );
  const MinSelect = (val, set) => (
    <select value={val.m} onChange={(e) => set({ ...val, m: e.target.value })} className="h-9 rounded-md border bg-background px-2 text-sm">
      {["00", "15", "30", "45"].map((m) => <option key={m} value={m}>{m}</option>)}
    </select>
  );
  const PeriodToggle = (val, set) => (
    <div className="inline-flex overflow-hidden rounded-md border">
      {["AM", "PM"].map((p) => (
        <button
          key={p}
          onClick={() => set({ ...val, p })}
          className={cn("px-3 py-1.5 text-xs font-bold", val.p === p ? "bg-primary text-primary-foreground" : "bg-background text-foreground")}
        >
          {p}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="flex items-center justify-between bg-sky-400 px-6 py-4 text-white">
          <h2 className="text-xl font-bold">Select Slots for {fmtDate(date)}</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Slot..."
                className="h-9 w-56 rounded-full bg-white pl-9 text-foreground"
              />
            </div>
            <button onClick={() => onOpenChange(false)} className="rounded-md p-1 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] space-y-5 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const active = picked.has(s);
              return (
                <label
                  key={s}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-full border bg-violet-50 px-4 py-3 text-sm font-semibold transition",
                    active && "ring-2 ring-primary"
                  )}
                >
                  <Checkbox checked={active} onCheckedChange={() => toggle(s)} />
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  <span>{s}</span>
                </label>
              );
            })}
          </div>

          <div className="rounded-xl border bg-violet-50/50 p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-violet-700">
              <Info className="h-4 w-4" /> Slots can be created between <b>7:00 AM - 7:00 PM</b>
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Hour</Label>
                {HourInput(start, setStart)}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Min</Label>
                {MinSelect(start, setStart)}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Period</Label>
                <div>{PeriodToggle(start, setStart)}</div>
              </div>
              <span className="px-2 pb-2 text-lg">-</span>
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Hour</Label>
                {HourInput(end, setEnd)}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Min</Label>
                {MinSelect(end, setEnd)}
              </div>
              <div>
                <Label className="text-xs font-bold uppercase text-violet-700">Period</Label>
                <div>{PeriodToggle(end, setEnd)}</div>
              </div>
              <Button onClick={addCustom} className="ml-auto rounded-full bg-sky-500 hover:bg-sky-600">
                Add slots
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t bg-muted/30 px-6 py-4">
          <span className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
            {picked.size} selected
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={allChecked} onCheckedChange={toggleAll} />
              <span className="text-sm font-semibold text-sky-600">Select All</span>
            </div>
            <Button onClick={() => { onSubmit(Array.from(picked)); onOpenChange(false); }} className="bg-sky-500 hover:bg-sky-600">
              <Check className="h-4 w-4" /> Confirm
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}