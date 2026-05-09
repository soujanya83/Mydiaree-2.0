import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  IdCard,
  DoorOpen,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
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
import { useChildrenStore } from "@/stores/childrenStore";
import { SelectRoomModal } from "@/components/children/SelectRoomModal";
import { AddChildModal } from "@/components/children/AddChildModal";
import { toast } from "sonner";

function ageFrom(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  return `${years} yr${years === 1 ? "" : "s"}`;
}

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export default function ChildrenPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading, fetchChildren, deleteChildren, addChild, updateChild } = useChildrenStore();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectRoomOpen, setSelectRoomOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [chosenRoom, setChosenRoom] = useState(null);
  const [editing, setEditing] = useState(null);

  const currentFilters = useMemo(() => ({
    center_id: activeCentreId,
    room_id: activeRoomId,
    gender: genderFilter === "all" ? undefined : (genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1)),
    status: statusFilter === "all" ? undefined : (statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)),
    search: search || undefined
  }), [activeCentreId, activeRoomId, genderFilter, statusFilter, search]);

  useEffect(() => {
    if (activeCentreId) {
      fetchChildren(currentFilters);
    }
  }, [currentFilters, fetchChildren, activeCentreId]);


  const handleNewChild = () => setSelectRoomOpen(true);

  const handleRoomChosen = (room) => {
    setChosenRoom(room);
    setSelectRoomOpen(false);
    setEditing(null);
    setAddOpen(true);
  };

  const handleEdit = (child) => {
    const room = rooms.find((r) => r.id === child.roomId) || null;
    setChosenRoom(room);
    setEditing(child);
    setAddOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this child?")) return;
    try {
      await deleteChildren([id], currentFilters);
      toast.success("Child deleted successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to delete child");
    }
  };


  const handleSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        centerid: activeCentreId,
        roomid: chosenRoom?.id || editing?.room,
      };

      if (editing) {
        await updateChild({ ...payload, id: editing.id }, currentFilters);
        toast.success("Child updated successfully");
      } else {
        await addChild(payload, currentFilters);
        toast.success("Child added successfully");
      }
      setAddOpen(false);
      setEditing(null);
      setChosenRoom(null);
    } catch (error) {
      toast.error(error?.message || "Failed to save child");
    }
  };


  return (
    <div>
      <PageHeader
        title="Children List"
        description="Manage enrolled children profiles"
        breadcrumbs={[{ label: "Children" }]}
        actions={
          <Button onClick={handleNewChild} className="gap-2">
            <Plus className="h-4 w-4" /> Add New Child
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="pl-9"
          />
        </div>
        <Select value={activeCentreId} onValueChange={setActiveCentre}>
          <SelectTrigger>
            <SelectValue />
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
          <SelectTrigger>
            <SelectValue placeholder="Select Room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading children...</div>
      ) : children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No children found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting filters or add a new child.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              rooms={rooms}
              onEdit={() => handleEdit(child)}
              onDelete={() => handleDelete(child.id)}
            />
          ))}
        </div>
      )}


      <SelectRoomModal
        open={selectRoomOpen}
        onClose={() => setSelectRoomOpen(false)}
        rooms={rooms}
        onContinue={handleRoomChosen}
      />

      <AddChildModal
        open={addOpen}
        onClose={() => {
          setAddOpen(false);
          setEditing(null);
          setChosenRoom(null);
        }}
        room={chosenRoom}
        initial={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function ChildCard({ child, rooms, onEdit, onDelete }) {
  const isActive = child.status?.toLowerCase() === "active";
  const genderLabel = child.gender ? child.gender.toUpperCase() : "—";
  const roomName = rooms.find(r => r.id == child.room)?.name || child.room || "—";
  const imageUrl = child.imageUrl?.startsWith("http") ? child.imageUrl : `https://mydiaree.com.au/${child.imageUrl}`;

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-muted">
        {child.imageUrl ? (
          <img
            src={imageUrl}
            alt={child.name}
            className="h-full w-full object-cover"
          />

        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm ${
            isActive
              ? "bg-emerald-500 text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {isActive ? "Active" : child.status || "Inactive"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-primary truncate">
          {child.name} {child.lastname}
        </h3>


        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-md border border-border px-2 py-1 font-medium text-foreground">
            DOB: {fmtDate(child.dob)}
          </span>
          <span className="rounded-md border border-border px-2 py-1 font-medium text-foreground">
            {genderLabel}
          </span>
        </div>

        <div className="space-y-1.5 text-sm text-foreground">
          <div className="flex items-center gap-2">
            <IdCard className="h-4 w-4 text-muted-foreground" />
            <span>ID: {child.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <span>Room: {roomName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined: {fmtDate(child.startDate)}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Age: {ageFrom(child.dob)}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            className="rounded-md bg-sky-100 p-2 text-sky-700 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-300"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="rounded-md bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-rose-100 p-2 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
