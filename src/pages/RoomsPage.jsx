import { useMemo, useState, useEffect } from "react";
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
import { useRoomStore } from "@/stores/roomStore";
import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { toast } from "sonner";

export default function RoomsPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, isLoading, isSubmitting, fetchRooms, createRoom, bulkDeleteRooms } = useRoomStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, ids: [] });

  // Fetch rooms whenever the active center changes
  useEffect(() => {
    if (activeCentreId) {
      fetchRooms(activeCentreId);
    }
  }, [activeCentreId, fetchRooms]);

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      if (String(r.centerid) !== String(activeCentreId)) return false;
      if (statusFilter !== "all" && r.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [rooms, activeCentreId, statusFilter, search]);

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const handleDeleteSelected = () => {
    if (!selected.length) return;
    setDeleteModal({ open: true, ids: selected });
  };

  const handleDeleteOne = (id) => {
    setDeleteModal({ open: true, ids: [id] });
  };

  const confirmDelete = async () => {
    try {
      await bulkDeleteRooms(deleteModal.ids, activeCentreId);
      setSelected((prev) => prev.filter(id => !deleteModal.ids.includes(id)));
      toast.success(deleteModal.ids.length > 1 ? "Rooms deleted successfully" : "Room deleted successfully");
      setDeleteModal({ open: false, ids: [] });
    } catch (error) {
      toast.error(error.message || "Failed to delete room(s)");
    }
  };

  const handleEdit = (room) => {
    setEditing(room);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        toast.info("Update room functionality to be implemented if required by API");
      } else {
        await createRoom({
          ...data,
          centerId: activeCentreId
        });
        toast.success("Room created successfully");
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  if (isLoading && rooms.length === 0) {
    return <div className="py-20 text-center text-muted-foreground">Loading rooms...</div>;
  }

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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
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

      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, ids: [] })}
        onConfirm={confirmDelete}
        isLoading={isSubmitting}
        title={deleteModal.ids.length > 1 ? `Delete ${deleteModal.ids.length} rooms?` : "Delete this room?"}
        description="This action will remove the selected room(s) and cannot be undone."
      />
    </div>
  );
}

function RoomCard({ room, checked, onToggle, onEdit, onDelete }) {
  const isActive = room.status === "active" || room.status === "Active";
  const educators = room.educators || [];
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {room.color && (
        <div 
          className="absolute left-0 top-0 h-1 w-full" 
          style={{ backgroundColor: room.color }}
        />
      )}
      
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
            Age Group (years): {room.ageFrom} to {room.ageTo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 text-primary" />
          <span>Children: {room.children?.length || 0}</span>
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
            {educators.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              educators.slice(0, 5).map((ed) => (
                <img
                  key={ed.userid || Math.random()}
                  src={ed.imageUrl ? `https://mydiaree.com.au/${ed.imageUrl}` : `https://ui-avatars.com/api/?name=${ed.name}`}
                  alt={ed.name}
                  title={ed.name}
                  className="h-7 w-7 rounded-full border-2 border-card object-cover bg-muted"
                />
              ))
            )}
            {educators.length > 5 && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-medium">
                +{educators.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
