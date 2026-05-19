import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Baby,
  Building2,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRoundCheck,
  Users2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RoomsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, isLoading, isSubmitting, fetchRooms, createRoom, bulkDeleteRooms } =
    useRoomStore();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.rooms;

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
      if (
        statusFilter !== "all" &&
        String(r.status || "").toLowerCase() !== statusFilter.toLowerCase()
      )
        return false;
      if (
        search &&
        !String(r.name || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [rooms, activeCentreId, statusFilter, search]);

  const roomStats = useMemo(() => {
    const visibleRooms = rooms.filter((r) => String(r.centerid) === String(activeCentreId));
    const activeRooms = visibleRooms.filter(
      (r) => String(r.status || "").toLowerCase() === "active",
    ).length;
    const childrenCount = visibleRooms.reduce((sum, room) => sum + (room.children?.length || 0), 0);
    const capacityCount = visibleRooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0);

    return {
      total: visibleRooms.length,
      active: activeRooms,
      children: childrenCount,
      capacity: capacityCount,
    };
  }, [rooms, activeCentreId]);

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
      setSelected((prev) => prev.filter((id) => !deleteModal.ids.includes(id)));
      toast.success(
        deleteModal.ids.length > 1 ? "Rooms deleted successfully" : "Room deleted successfully",
      );
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
          centerId: activeCentreId,
        });
        toast.success("Room created successfully");
      }
      setModalOpen(false);
      setEditing(null);
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms List"
        description="Manage rooms, age groups, capacity and educators"
        breadcrumbs={[{ label: "Rooms" }]}
        actions={
          can(perms.add) ? (
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" /> Create Room
            </Button>
          ) : null
        }
      />

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-0 border-b border-border md:grid-cols-4">
          <RoomStat icon={DoorOpen} label="Rooms" value={roomStats.total} tone="sky" />
          <RoomStat icon={CheckCircle2} label="Active" value={roomStats.active} tone="emerald" />
          <RoomStat icon={Baby} label="Children" value={roomStats.children} tone="amber" />
          <RoomStat
            icon={GraduationCap}
            label="Capacity"
            value={roomStats.capacity}
            tone="violet"
          />
        </div>

        <div className="flex flex-col gap-3 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1 lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room name..."
                className="h-10 bg-background pl-9"
              />
            </div>
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-10 w-full bg-background lg:w-60">
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
              <SelectTrigger className="h-10 w-full bg-background lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selected.length > 0 && can(perms.delete) && (
            <Button variant="destructive" onClick={handleDeleteSelected} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Selected ({selected.length})
            </Button>
          )}
        </div>
      </section>

      {isLoading && rooms.length === 0 ? (
        <PageLoader label="Loading rooms…" />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <DoorOpen className="h-7 w-7" />
          </div>
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
              onOpen={() => navigate(`/rooms/${room.id}`)}
              onEdit={() => handleEdit(room)}
              onDelete={() => handleDeleteOne(room.id)}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
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
        title={
          deleteModal.ids.length > 1
            ? `Delete ${deleteModal.ids.length} rooms?`
            : "Delete this room?"
        }
        description="This action will remove the selected room(s) and cannot be undone."
      />
    </div>
  );
}

function RoomStat({ icon: Icon, label, value, tone }) {
  const tones = {
    sky: "bg-sky-50 text-sky-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="border-b border-border p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  checked,
  onToggle,
  onOpen,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  const isActive = String(room.status || "").toLowerCase() === "active";
  const educators = room.educators || [];
  const childCount = room.children?.length || 0;
  const capacity = Number(room.capacity) || 0;
  const occupancy = capacity > 0 ? Math.min(Math.round((childCount / capacity) * 100), 100) : 0;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <input
              type="checkbox"
              checked={checked}
              onClick={(e) => e.stopPropagation()}
              onChange={onToggle}
              className="mt-3 h-4 w-4 shrink-0 accent-primary"
              aria-label={`Select ${room.name}`}
            />
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <DoorOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold text-foreground">{room.name}</h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-2 py-0 text-[11px]",
                    isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                Age {room.ageFrom ?? 0} to {room.ageTo ?? 0} years
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Occupancy</p>
              <p className="mt-0.5 font-semibold text-foreground">
                {childCount} of {capacity || "—"} children
              </p>
            </div>
            <span className="text-sm font-bold text-foreground">{occupancy}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <MiniMetric icon={Baby} label="Children" value={childCount} />
          <MiniMetric icon={GraduationCap} label="Capacity" value={capacity || "—"} />
          <MiniMetric icon={UserRoundCheck} label="Educators" value={educators.length} />
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-1 flex-col gap-4">
              {/* Educators Avatars */}
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Users2 className="h-3.5 w-3.5" />
                  Educators
                </p>
                <div className="flex items-center gap-2">
                  {educators.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None</span>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {educators.slice(0, 4).map((ed, index) => (
                          <img
                            key={ed.userid || ed.id || `${ed.name}-${index}`}
                            src={
                              ed.imageUrl && !ed.imageUrl.startsWith("http")
                                ? `https://mydiaree.com.au/${ed.imageUrl}`
                                : ed.imageUrl ||
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(ed.name || "Educator")}&background=EEF2FF&color=4338CA`
                            }
                            alt={ed.name || "Educator"}
                            title={ed.name || "Educator"}
                            className="h-8 w-8 rounded-full border-2 border-card bg-muted object-cover"
                          />
                        ))}
                      </div>
                      {educators.length > 4 && (
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          +{educators.length - 4}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Children Avatars */}
              <div className="min-w-0">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
                  <Baby className="h-3.5 w-3.5" />
                  Children
                </p>
                <div className="flex items-center gap-2">
                  {room.children?.length === 0 || !room.children ? (
                    <span className="text-xs text-muted-foreground">None</span>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {room.children.slice(0, 4).map((child, index) => {
                          const fullName =
                            `${child.name || ""} ${child.lastname || ""}`.trim() || "Child";
                          return (
                            <img
                              key={child.id || `${fullName}-${index}`}
                              src={
                                child.imageUrl && !child.imageUrl.startsWith("http")
                                  ? `https://mydiaree.com.au/${child.imageUrl}`
                                  : child.imageUrl ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FDF4FF&color=C026D3`
                              }
                              alt={fullName}
                              title={fullName}
                              className="h-8 w-8 rounded-full border-2 border-card bg-muted object-cover"
                            />
                          );
                        })}
                      </div>
                      {room.children.length > 4 && (
                        <span className="ml-1 text-xs font-medium text-muted-foreground">
                          +{room.children.length - 4}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/25 p-3">
      <Icon className="mb-2 h-4 w-4 text-primary" />
      <p className="text-base font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1 truncate text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
