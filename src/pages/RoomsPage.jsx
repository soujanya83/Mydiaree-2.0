import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Users2,
  Baby,
  GraduationCap,
  DoorOpen,
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
import { mockRoomsList } from "@/components/rooms/roomsData";
import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { toast } from "sonner";

export default function RoomsPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const [items, setItems] = useState(mockRoomsList);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (r.centreId !== activeCentreId) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [items, activeCentreId, statusFilter, search]);

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleDeleteSelected = () => {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected room(s)?`)) return;
    setItems((prev) => prev.filter((r) => !selected.includes(r.id)));
    setSelected([]);
    toast.success("Rooms deleted");
  };

  const handleDeleteOne = (id) => {
    if (!window.confirm("Delete this room?")) return;
    setItems((prev) => prev.filter((r) => r.id !== id));
    toast.success("Room deleted");
  };

  const handleEdit = (room) => {
    setEditing(room);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = (data) => {
    if (editing) {
      setItems((prev) =>
        prev.map((r) =>
          r.id === editing.id ? { ...r, ...data } : r
        )
      );
      toast.success("Room updated");
    } else {
      const newRoom = {
        id: `r${Date.now()}`,
        centreId: activeCentreId,
        children: 0,
        ...data,
      };
      setItems((prev) => [newRoom, ...prev]);
      toast.success("Room created");
    }
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div>
      <PageHeader
        title="Rooms List"
        description="Manage rooms, age groups, capacity and educators"
        breadcrumbs={[{ label: "Rooms" }]}
        actions={
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" /> Create Room
          </Button>
        }
      />

      {/* Filter row */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search room name..."
              className="pl-9"
            />
          </div>
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger className="w-full sm:w-56">
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleDeleteSelected}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selected.length})
          </Button>
        )}
      </div>

      {/* Rooms grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <DoorOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No rooms found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting filters or create a new room.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              checked={selected.includes(room.id)}
              onToggle={() => toggleSelect(room.id)}
              onEdit={() => handleEdit(room)}
              onDelete={() => handleDeleteOne(room.id)}
            />
          ))}
        </div>
      )}

      <CreateRoomModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  );
}

function RoomCard({ room, checked, onToggle, onEdit, onDelete }) {
  const isActive = room.status === "active";
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="mt-1 h-4 w-4 accent-primary"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{room.name}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  isActive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                ({isActive ? "Active" : "Inactive"})
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-foreground">
        <div className="flex items-center gap-2">
          <Users2 className="h-4 w-4 text-primary" />
          <span>
            Age Group (years): {room.fromAge} to {room.toAge}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 text-primary" />
          <span>Children: {room.children}</span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          <span>Capacity: {room.capacity}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Educators:
          </span>
          <div className="flex -space-x-2">
            {room.educators.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              room.educators.slice(0, 5).map((ed) => (
                <img
                  key={ed.id}
                  src={ed.avatar}
                  alt={ed.name}
                  title={ed.name}
                  className="h-7 w-7 rounded-full border-2 border-card object-cover"
                />
              ))
            )}
            {room.educators.length > 5 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                +{room.educators.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
