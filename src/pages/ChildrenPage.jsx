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
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { children, isLoading, fetchChildren, deleteChildren, addChild, updateChild } =
    useChildrenStore();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectRoomOpen, setSelectRoomOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [chosenRoom, setChosenRoom] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentFilters = useMemo(
    () => ({
      center_id: activeCentreId,
      room_id: activeRoomId,
      gender:
        genderFilter === "all"
          ? undefined
          : genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1),
      status:
        statusFilter === "all"
          ? undefined
          : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1),
      search: search || undefined,
    }),
    [activeCentreId, activeRoomId, genderFilter, statusFilter, search],
  );

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

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteChildren([deleteId], currentFilters);
      toast.success("Child deleted successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to delete child");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSubmit = async (data) => {
    setIsSaving(true);
    try {
      if (editing) {
        // For updates: id is child ID, roomid is the room identifier
        await updateChild(
          {
            ...data,
            centerid: activeCentreId,
            roomid: chosenRoom?.id || editing?.roomId || editing?.room,
            id: editing.id,
          },
          currentFilters,
        );
        toast.success("Child updated successfully");
      } else {
        // For creation: id carries the room identifier as per /add-children spec
        const payload = {
          ...data,
          centerid: activeCentreId,
          id: chosenRoom?.id || editing?.roomId || editing?.room,
        };
        await addChild(payload, currentFilters);
        toast.success("Child added successfully");
      }
      setAddOpen(false);
      setEditing(null);
      setChosenRoom(null);
    } catch (error) {
      toast.error(error?.message || "Failed to save child");
    } finally {
      setIsSaving(false);
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
              onDelete={() => setDeleteId(child.id)}
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
        isSaving={isSaving}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the child's profile and documentation records. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ChildCard({ child, rooms, onEdit, onDelete }) {
  const isActive = child.status?.toLowerCase() === "active";
  const genderLabel = child.gender ? child.gender.toUpperCase() : "—";
  const roomName = rooms.find((r) => r.id == child.room)?.name || child.room || "—";
  const imageUrl = child.imageUrl?.startsWith("http")
    ? child.imageUrl
    : `https://mydiaree.com.au/${child.imageUrl}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md">
      {/* 1. Image Container (Top) */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted/40">
        {child.imageUrl ? (
          <img
            src={imageUrl}
            alt={child.name}
            className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* 2. Body */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-base font-semibold leading-tight text-foreground">
            {child.name} {child.lastname}
          </h3>
          <span
            className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
              isActive
                ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
            }`}
          >
            {isActive ? "Active" : child.status || "Inactive"}
          </span>
        </div>

        <div className="mb-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
          {/* <div className="flex items-center gap-1.5">
            <IdCard className="h-3.5 w-3.5" />
            <span>ID: {child.id}</span>
          </div> */}
          <div className="flex items-center gap-1.5">
            <DoorOpen className="h-3.5 w-3.5" />
            <span>Room: {roomName}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1 text-[10px] font-medium">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
              DOB: {fmtDate(child.dob)}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
              {genderLabel}
            </span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
              AGE: {ageFrom(child.dob)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
