import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Building2,
  Check,
  DoorOpen,
  GraduationCap,
  Mars,
  MoveRight,
  Plus,
  Search,
  Trash2,
  Users,
  Venus,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { AddChildModal } from "@/components/children/AddChildModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { childrenService } from "@/services/centre/childrenService";
import { roomService } from "@/services/centre/roomService";
import { toast } from "sonner";

const imageBase = "https://mydiaree.com.au/";

const toId = (value) => String(value ?? "");

const resolveImage = (value, name) => {
  if (!value)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=EEF2FF&color=4338CA`;
  return value.startsWith("http") ? value : `${imageBase}${value}`;
};

const displayName = (person) =>
  person?.name ||
  [person?.firstName, person?.lastName].filter(Boolean).join(" ") ||
  [person?.firstname, person?.lastname].filter(Boolean).join(" ") ||
  person?.child_name ||
  "Unnamed";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAge = (dob, fallback) => {
  if (fallback) return fallback;
  if (!dob) return "—";
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  let years = now.getFullYear() - date.getFullYear();
  const month = now.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) years -= 1;
  return `${Math.max(years, 0)} year${years === 1 ? "" : "s"}`;
};

const childRoomMatches = (child, room) => {
  const matches = [room?.id, room?.roomid, room?.name].map(toId).filter(Boolean);
  return [child?.room, child?.roomId, child?.room_id, child?.roomid, child?.roomName]
    .map(toId)
    .some((value) => matches.includes(value));
};

export default function RoomDetailsPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { activeCentreId } = useCentreStore();
  const { rooms, roomStaffs, isLoading, fetchRooms } = useRoomStore();

  const [tab, setTab] = useState("children");
  const [children, setChildren] = useState([]);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [targetRoomId, setTargetRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [educatorModalOpen, setEducatorModalOpen] = useState(false);
  const [addChildOpen, setAddChildOpen] = useState(false);
  const [educatorIds, setEducatorIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const room = useMemo(
    () =>
      rooms.find((item) => toId(item.id) === toId(roomId) || toId(item.roomid) === toId(roomId)),
    [rooms, roomId],
  );

  useEffect(() => {
    if (activeCentreId) fetchRooms(activeCentreId);
  }, [activeCentreId, fetchRooms]);

  useEffect(() => {
    if (!room || !activeCentreId) return;

    const loadChildren = async () => {
      setChildrenLoading(true);
      try {
        const response = await childrenService.filterChildren({
          center_id: activeCentreId,
          room_id: room.id,
          room: room.id,
        });
        const items = response.data || response.children || [];
        setChildren(items.length ? items : room.children || []);
      } catch (error) {
        setChildren(room.children || []);
        toast.error(error?.response?.data?.message || "Loaded room children from cached room data");
      } finally {
        setChildrenLoading(false);
      }
    };

    loadChildren();
  }, [activeCentreId, room]);

  useEffect(() => {
    if (!room) return;
    setEducatorIds(
      (room.educators || []).map((educator) =>
        toId(educator.userid || educator.id || educator.staffid),
      ),
    );
  }, [room]);

  const filteredChildren = useMemo(() => {
    const term = search.trim().toLowerCase();
    return children
      .filter(
        (child) =>
          !room ||
          childRoomMatches(child, room) ||
          children.length === (room.children || []).length,
      )
      .filter((child) => {
        if (!term) return true;
        return displayName(child).toLowerCase().includes(term) || toId(child.id).includes(term);
      });
  }, [children, room, search]);

  const educators = room?.educators || [];
  const maleCount = filteredChildren.filter(
    (child) => String(child.gender || "").toLowerCase() === "male",
  ).length;
  const femaleCount = filteredChildren.filter(
    (child) => String(child.gender || "").toLowerCase() === "female",
  ).length;
  const otherRooms = rooms.filter((item) => toId(item.id) !== toId(room?.id));

  const refreshRoomData = async () => {
    await fetchRooms(activeCentreId);
    const response = await childrenService.filterChildren({
      center_id: activeCentreId,
      room_id: room.id,
      room: room.id,
    });
    setChildren(response.data || response.children || []);
  };

  const toggleChild = (id) => {
    setSelectedChildren((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleMoveChildren = async () => {
    if (!selectedChildren.length || !targetRoomId) return;
    setIsSaving(true);
    try {
      await roomService.moveChildren({
        roomId: targetRoomId,
        childIds: selectedChildren,
      });
      toast.success(
        `${selectedChildren.length} child${selectedChildren.length === 1 ? "" : "ren"} moved`,
      );
      setSelectedChildren([]);
      setTargetRoomId("");
      await refreshRoomData();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to move children");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteChildren = async () => {
    if (!selectedChildren.length) return;
    setIsSaving(true);
    try {
      await childrenService.deleteChildren(selectedChildren);
      toast.success(
        `${selectedChildren.length} child${selectedChildren.length === 1 ? "" : "ren"} deleted`,
      );
      setSelectedChildren([]);
      await refreshRoomData();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete children");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEducators = async () => {
    setIsSaving(true);
    try {
      await roomService.manageEducators({
        centerId: activeCentreId,
        roomId: room.id,
        educatorIds,
      });
      toast.success("Educators updated");
      setEducatorModalOpen(false);
      await fetchRooms(activeCentreId);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update educators");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateChild = async (data) => {
    setIsSaving(true);
    try {
      await childrenService.createChild({
        ...data,
        centerid: activeCentreId,
        id: room.id,
      });
      toast.success("Child added successfully");
      setAddChildOpen(false);
      await refreshRoomData();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to add child");
    } finally {
      setIsSaving(false);
    }
  };

  if ((isLoading && rooms.length === 0) || !activeCentreId) {
    return <div className="py-20 text-center text-muted-foreground">Loading room details...</div>;
  }

  if (!room) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <DoorOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-semibold text-foreground">Room not found</p>
        <Button asChild className="mt-4">
          <Link to="/rooms">Back to rooms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={room.name}
        description="Room profile, child movement, and educator assignments"
        breadcrumbs={[{ label: "Rooms", to: "/rooms" }, { label: room.name }]}
        actions={
          <>
            <Button onClick={() => setAddChildOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add New Child
            </Button>
            <Button variant="outline" onClick={() => navigate("/rooms")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile icon={DoorOpen} label="Room Name" value={room.name} tone="sky" />
        <SummaryTile
          icon={Building2}
          label="Room Capacity"
          value={room.capacity || "—"}
          tone="amber"
        />
        <SummaryTile
          icon={Users}
          label="Active Children"
          value={filteredChildren.length}
          tone="emerald"
        />
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="grid grid-cols-2 divide-x divide-border text-center">
            <GenderStat icon={Mars} label="Male" value={maleCount} className="text-blue-600" />
            <GenderStat icon={Venus} label="Female" value={femaleCount} className="text-rose-600" />
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:grid-cols-3">
        <Fact label="Age Group" value={`${room.ageFrom ?? "—"} to ${room.ageTo ?? "—"} years`} />
        <Fact label="Status" value={room.status || "—"} />
        <Fact label="Educators" value={`${educators.length} assigned`} />
      </div>

      <div className="border-b border-border">
        <div className="flex gap-1">
          <TabButton active={tab === "children"} onClick={() => setTab("children")}>
            Children
          </TabButton>
          <TabButton active={tab === "educators"} onClick={() => setTab("educators")}>
            Educators
          </TabButton>
        </div>
      </div>

      {tab === "children" ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search children..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={targetRoomId || "none"}
                onValueChange={(value) => setTargetRoomId(value === "none" ? "" : value)}
              >
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select a room</SelectItem>
                  {otherRooms.map((item) => (
                    <SelectItem key={item.id} value={toId(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleMoveChildren}
                disabled={!selectedChildren.length || !targetRoomId || isSaving}
                className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <MoveRight className="h-4 w-4" /> Move
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteChildren}
                disabled={!selectedChildren.length || isSaving}
                className="gap-2 border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>

          {childrenLoading ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
              Loading children...
            </div>
          ) : filteredChildren.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Baby className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold text-foreground">No children in this room</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {filteredChildren.map((child) => (
                <ChildCard
                  key={child.id}
                  child={child}
                  checked={selectedChildren.includes(child.id)}
                  onToggle={() => toggleChild(child.id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-5">
          <div className="flex justify-end">
            <Button onClick={() => setEducatorModalOpen(true)} className="gap-2">
              <GraduationCap className="h-4 w-4" /> Manage Educators
            </Button>
          </div>

          {educators.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold text-foreground">No educators assigned</p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
              {educators.map((educator) => (
                <EducatorCard
                  key={educator.userid || educator.id || educator.name}
                  educator={educator}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {educatorModalOpen && (
        <ManageEducatorsModal
          educators={roomStaffs}
          selected={educatorIds}
          onToggle={(id) =>
            setEducatorIds((current) =>
              current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
            )
          }
          onClose={() => setEducatorModalOpen(false)}
          onSubmit={handleSaveEducators}
          isSaving={isSaving}
        />
      )}

      <AddChildModal
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        room={room}
        onSubmit={handleCreateChild}
        isSaving={isSaving}
      />
    </div>
  );
}

function SummaryTile({ icon: Icon, label, value, tone }) {
  const tones = {
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="rounded-lg bg-muted/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function GenderStat({ icon: Icon, label, value, className }) {
  return (
    <div className="flex flex-col items-center gap-1 px-3">
      <Icon className={`h-6 w-6 ${className}`} />
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className={`text-2xl font-bold ${className}`}>{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-32 rounded-t-lg border border-b-0 px-5 py-3 text-sm font-bold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ChildCard({ child, checked, onToggle }) {
  const name = displayName(child);
  const dob = child.dob || child.dateOfBirth || child.birthDate;
  const joined = child.doj || child.dateOfJoin || child.joiningDate || child.startDate;
  const gender = child.gender || "—";

  return (
    <article className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/70" />
      <div className="flex gap-4">
        <img
          src={resolveImage(child.imageUrl || child.image || child.photo, name)}
          alt={name}
          className="h-16 w-16 rounded-full border border-border bg-muted object-cover"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-bold text-primary">{name}</h3>
          <p className="mt-1 text-sm font-medium text-foreground">
            Date of Birth: {formatDate(dob)}
          </p>
          <p className="text-sm font-medium text-foreground">Joining Date: {formatDate(joined)}</p>
          <p className="text-sm font-medium text-foreground">Gender: {gender}</p>
          <p className="text-sm font-semibold text-muted-foreground">{getAge(dob, child.age)}</p>
        </div>
        <label className="mt-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-input bg-background">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-4 w-4 accent-primary"
          />
        </label>
      </div>
    </article>
  );
}

function EducatorCard({ educator }) {
  const name = displayName(educator);
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-4">
        <img
          src={resolveImage(educator.imageUrl || educator.image || educator.photo, name)}
          alt={name}
          className="h-16 w-16 rounded-full border border-border bg-muted object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-primary">{name}</h3>
          <p className="text-sm font-bold uppercase text-muted-foreground">
            {educator.gender || "Educator"}
          </p>
        </div>
      </div>
    </article>
  );
}

function ManageEducatorsModal({ educators, selected, onToggle, onClose, onSubmit, isSaving }) {
  const [query, setQuery] = useState("");
  const filtered = educators.filter((educator) =>
    String(educator.name || "")
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Manage Educators</h2>
            <p className="text-sm text-muted-foreground">
              Select the educators assigned to this room.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search educators..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No educators found.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((educator) => {
                const id = toId(educator.staffid || educator.id || educator.userid);
                const checked = selected.includes(id);
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => onToggle(id)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                      checked
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}
                    >
                      {checked && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <img
                      src={resolveImage(
                        educator.imageUrl || educator.image || educator.photo,
                        educator.name,
                      )}
                      alt={educator.name}
                      className="h-10 w-10 rounded-full bg-muted object-cover"
                    />
                    <span className="min-w-0 truncate font-semibold text-foreground">
                      {educator.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Educators"}
          </Button>
        </div>
      </div>
    </div>
  );
}
