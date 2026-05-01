import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DoorOpen, Users, Calendar, Baby, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mockRoomsList, EDUCATOR_POOL } from "@/components/rooms/roomsData";
import { mockChildrenList } from "@/components/children/childrenData";
import SelectRoomsModal from "@/components/ptm/SelectRoomsModal";
import SelectEducatorsModal from "@/components/ptm/SelectEducatorsModal";
import SelectSlotsModal from "@/components/ptm/SelectSlotsModal";
import { SelectChildrenModal } from "@/components/events/SelectChildrenModal";

function StepCard({ step, title, icon: Icon, locked, done, children }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-5 shadow-sm transition",
        locked && "opacity-60",
        done && "border-primary/40 bg-primary/5"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
            done ? "bg-primary text-primary-foreground" : locked ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"
          )}
        >
          {done ? <CheckCircle2 className="h-5 w-5" /> : step}
        </div>
        <div className="flex flex-1 items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
        </div>
        {locked && <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className={cn(locked && "pointer-events-none")}>{children}</div>
    </div>
  );
}

export default function PtmCreatePage() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]); // room ids
  const [educators, setEducators] = useState([]); // educator ids
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]); // strings
  const [children, setChildren] = useState([]); // child ids
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");

  const [roomsOpen, setRoomsOpen] = useState(false);
  const [edOpen, setEdOpen] = useState(false);
  const [slotsOpen, setSlotsOpen] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(false);

  const roomsDone = rooms.length > 0;
  const eduDone = educators.length > 0;
  const dateDone = !!date && slots.length > 0;

  const pickedRooms = mockRoomsList.filter((r) => rooms.includes(r.id));
  const pickedEducators = EDUCATOR_POOL.filter((e) => educators.includes(e.id));
  const pickedChildren = mockChildrenList.filter((c) => children.includes(c.id));

  const submit = (status) => {
    if (!roomsDone) return toast.error("Please select rooms first");
    if (!eduDone) return toast.error("Please tag educators");
    if (!dateDone) return toast.error("Please select a date and time slots");
    if (!title.trim()) return toast.error("Title is required");
    toast.success(status === "draft" ? "Saved as draft" : "PTM published successfully");
    navigate("/ptm");
  };

  const handleDateChange = (v) => {
    setDate(v);
    setSlots([]);
    if (v) setSlotsOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Store PTM"
        breadcrumbs={[{ label: "PTM", to: "/ptm" }, { label: "Store PTM" }]}
        actions={
          <Button variant="outline" onClick={() => navigate("/ptm")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="space-y-4">
        {/* Step 1: Rooms */}
        <StepCard step={1} title="Select Rooms" icon={DoorOpen} done={roomsDone}>
          <Button variant="outline" onClick={() => setRoomsOpen(true)} className="border-primary text-primary hover:bg-primary/10">
            <DoorOpen className="h-4 w-4" /> Select Rooms
          </Button>
          {pickedRooms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pickedRooms.map((r) => (
                <Badge key={r.id} variant="secondary" className="bg-primary/15 text-primary">{r.name}</Badge>
              ))}
            </div>
          )}
        </StepCard>

        {/* Step 2: Educators */}
        <StepCard step={2} title="Tag Educators" icon={Users} locked={!roomsDone} done={eduDone}>
          <Button
            variant="outline"
            onClick={() => setEdOpen(true)}
            className="border-destructive text-destructive hover:bg-destructive/10"
            disabled={!roomsDone}
          >
            <Users className="h-4 w-4" /> Select Educators
          </Button>
          {pickedEducators.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {pickedEducators.map((e) => (
                <span key={e.id} className="flex items-center gap-2 rounded-full border bg-card px-2 py-1 text-xs font-semibold">
                  <img src={e.avatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                  {e.name}
                </span>
              ))}
            </div>
          )}
        </StepCard>

        {/* Step 3: Date + Slots */}
        <StepCard step={3} title="Select Date & Time Slots" icon={Calendar} locked={!eduDone} done={dateDone}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border-amber-500 focus-visible:ring-amber-500"
                disabled={!eduDone}
              />
            </div>
            {date && (
              <Button variant="outline" onClick={() => setSlotsOpen(true)}>
                Manage Slots ({slots.length})
              </Button>
            )}
          </div>
          {slots.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {slots.map((s) => (
                <Badge key={s} variant="outline" className="border-sky-300 bg-sky-50 text-sky-700">{s}</Badge>
              ))}
            </div>
          )}
        </StepCard>

        {/* Step 4: Children + meta */}
        <StepCard step={4} title="Children & Meeting Info" icon={Baby} locked={!dateDone}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-primary font-semibold">Children</Label>
              <Button
                variant="outline"
                onClick={() => setChildrenOpen(true)}
                className="border-primary text-primary hover:bg-primary/10"
                disabled={!dateDone}
              >
                <Baby className="h-4 w-4" /> Select Children
              </Button>
              {pickedChildren.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pickedChildren.map((c) => (
                    <Badge key={c.id} variant="secondary">{c.firstName} {c.lastName}</Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-semibold">Title</Label>
              <Textarea rows={2} placeholder="Enter PTM Title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-primary font-semibold">Objective</Label>
              <Textarea rows={3} placeholder="Enter PTM Objective..." value={objective} onChange={(e) => setObjective(e.target.value)} />
            </div>
          </div>
        </StepCard>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => navigate("/ptm")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={() => submit("draft")} className="bg-blue-600 text-white hover:bg-blue-700">Save as Draft</Button>
          <Button onClick={() => submit("publish")} className="bg-emerald-600 text-white hover:bg-emerald-700">Publish</Button>
        </div>
      </div>

      <SelectRoomsModal open={roomsOpen} onOpenChange={setRoomsOpen} initial={rooms} onSubmit={setRooms} />
      <SelectEducatorsModal open={edOpen} onOpenChange={setEdOpen} initial={educators} roomIds={rooms} onSubmit={setEducators} />
      <SelectSlotsModal open={slotsOpen} onOpenChange={setSlotsOpen} date={date} initial={slots} onSubmit={setSlots} />
      <SelectChildrenModal open={childrenOpen} onOpenChange={setChildrenOpen} initial={children} onSubmit={setChildren} />
    </div>
  );
}