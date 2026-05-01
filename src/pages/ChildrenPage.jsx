import { useMemo, useState } from "react";
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
import { mockChildrenList } from "@/components/children/childrenData";
import { mockRoomsList } from "@/components/rooms/roomsData";
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
  const [items, setItems] = useState(mockChildrenList);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");

  const [selectRoomOpen, setSelectRoomOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [chosenRoom, setChosenRoom] = useState(null);
  const [editing, setEditing] = useState(null);

  const centreRooms = useMemo(
    () => mockRoomsList.filter((r) => r.centreId === activeCentreId),
    [activeCentreId]
  );

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (c.centreId !== activeCentreId) return false;
      if (genderFilter !== "all" && c.gender !== genderFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (roomFilter !== "all" && c.roomId !== roomFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${c.firstName} ${c.lastName}`.toLowerCase();
        if (!name.includes(q) && !String(c.code).includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCentreId, genderFilter, statusFilter, roomFilter, search]);

  const handleNewChild = () => setSelectRoomOpen(true);

  const handleRoomChosen = (room) => {
    setChosenRoom(room);
    setSelectRoomOpen(false);
    setEditing(null);
    setAddOpen(true);
  };

  const handleEdit = (child) => {
    const room = mockRoomsList.find((r) => r.id === child.roomId) || null;
    setChosenRoom(room);
    setEditing(child);
    setAddOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this child?")) return;
    setItems((prev) => prev.filter((c) => c.id !== id));
    toast.success("Child deleted");
  };

  const handleSubmit = (data) => {
    if (editing) {
      setItems((prev) =>
        prev.map((c) => (c.id === editing.id ? { ...c, ...data } : c))
      );
      toast.success("Child updated");
    } else {
      const newChild = {
        id: `ch${Date.now()}`,
        code: String(Math.floor(100 + Math.random() * 900)),
        centreId: activeCentreId,
        roomId: chosenRoom?.id || "",
        roomName: chosenRoom?.name || "",
        ...data,
      };
      setItems((prev) => [newChild, ...prev]);
      toast.success("Child added");
    }
    setAddOpen(false);
    setEditing(null);
    setChosenRoom(null);
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
        <Select value={roomFilter} onValueChange={setRoomFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {centreRooms.map((r) => (
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No children found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting filters or add a new child.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onEdit={() => handleEdit(child)}
              onDelete={() => handleDelete(child.id)}
            />
          ))}
        </div>
      )}

      <SelectRoomModal
        open={selectRoomOpen}
        onClose={() => setSelectRoomOpen(false)}
        rooms={centreRooms}
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

function ChildCard({ child, onEdit, onDelete }) {
  const isActive = child.status === "active";
  const genderLabel = child.gender ? child.gender.toUpperCase() : "—";
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-muted">
        {child.image ? (
          <img
            src={child.image}
            alt={`${child.firstName} ${child.lastName}`}
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
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-primary">
          {child.firstName} {child.lastName}
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
            <span>ID: {child.code}</span>
          </div>
          <div className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
            <span>Room: {child.roomName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined: {fmtDate(child.joinedAt)}</span>
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
