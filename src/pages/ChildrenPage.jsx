import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Phone,
  Home,
  UserRound,
  Mail,
  Baby,
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
import { CentreSelect } from "@/components/common/CentreSelect";
import { PageLoader } from "@/components/common/PageLoader";
import { Pagination } from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { SelectRoomModal } from "@/components/children/SelectRoomModal";
import { AddChildModal } from "@/components/children/AddChildModal";
import { childrenService } from "@/services/centre/childrenService";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { toast } from "sonner";
import { IMG_BASE_API } from "../api/imageapi";

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

const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `${IMG_BASE_API}${imageUrl}`;
};

const textOrDash = (value) => value || "—";

export default function ChildrenPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, pagination, isLoading, fetchChildren, deleteChildren, addChild, updateChild } =
    useChildrenStore();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.children;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [localRoomId, setLocalRoomId] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [sort, setSort] = useState("asc");
  const [page, setPage] = useState(1);
  const searchTimerRef = useRef(null);

  const [selectRoomOpen, setSelectRoomOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [chosenRoom, setChosenRoom] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const navigate = useNavigate();

  const currentFilters = useMemo(
    () => ({
      center_id: activeCentreId,
      room_id: localRoomId,
      gender:
        genderFilter === "all"
          ? "All"
          : genderFilter.charAt(0).toUpperCase() + genderFilter.slice(1),
      status:
        statusFilter === "all"
          ? "All"
          : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1),
      search: search || undefined,
      sort: sort,
      page: page,
      per_page: 12,
    }),
    [activeCentreId, localRoomId, genderFilter, statusFilter, search, sort, page],
  );

  useEffect(() => {
    if (activeCentreId) {
      fetchChildren(currentFilters);
    }
  }, [currentFilters, fetchChildren, activeCentreId]);

  useEffect(() => {
    setPage(1);
    setSelectedChildren([]);
  }, [activeRoomId, genderFilter, statusFilter, sort]);

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);
    }, 500);
  };

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

  const handleView = (child) => {
    navigate(`/children/${child.id}`);
  };

  const handleDelete = async () => {
    if (!deleteId && selectedChildren.length === 0) return;
    setIsDeleting(true);
    try {
      const idsToDelete = deleteId ? [deleteId] : selectedChildren;
      await deleteChildren(idsToDelete, currentFilters);
      toast.success(
        idsToDelete.length > 1
          ? "Selected children deleted successfully"
          : "Child deleted successfully",
      );
      setSelectedChildren([]);
    } catch (error) {
      toast.error(error?.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSelectChild = (id) => {
    setSelectedChildren((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id],
    );
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
      const backendErrors = error?.response?.data?.errors || error?.errors;
      if (backendErrors && typeof backendErrors === "object") {
        Object.values(backendErrors).forEach((errArray) => {
          if (Array.isArray(errArray)) {
            errArray.forEach((msg) => toast.error(msg));
          } else if (typeof errArray === "string") {
            toast.error(errArray);
          }
        });
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to save child");
      }
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
          <div className="flex items-center gap-2">
            {can(perms.delete) && selectedChildren.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setDeleteId(null)} // Trigger alert dialog for bulk delete
                className="gap-2"
                onClickCapture={() => {
                  // Small hack to open the dialog for bulk delete
                  setDeleteId(null);
                  document.getElementById("bulk-delete-trigger")?.click();
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete Selected ({selectedChildren.length})
              </Button>
            )}
            {can(perms.add) && (
              <Button onClick={handleNewChild} className="gap-2">
                <Plus className="h-4 w-4" /> Add New Child
              </Button>
            )}
            {can(perms.delete) && selectedChildren.length > 0 && (
              <button
                id="bulk-delete-trigger"
                className="hidden"
                onClick={() => setDeleteId("bulk")}
              />
            )}
          </div>
        }
      />

      <div className="mb-6 space-y-4">
        {/* Top Row: Center and Room */}
        <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <CentreSelect
            icon={null}
            triggerClassName="h-11 rounded-xl bg-card/60 backdrop-blur shadow-sm"
            contentClassName="rounded-xl"
          />
          <Select value={localRoomId} onValueChange={setLocalRoomId}>
            <SelectTrigger className="h-11 rounded-xl bg-card/60 backdrop-blur shadow-sm">
              <SelectValue placeholder="All Rooms" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Rooms</SelectItem>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bottom Row: Search and Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by name or ID..."
              className="h-11 pl-9 rounded-xl bg-card/60 backdrop-blur shadow-sm border-border/60 transition-all focus-visible:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="h-11 rounded-xl bg-card/60 backdrop-blur shadow-sm min-w-[120px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 rounded-xl bg-card/60 backdrop-blur shadow-sm min-w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Show All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="In Active">Inactive</SelectItem>
                <SelectItem value="Enrolled">Enrolled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 rounded-xl bg-card/60 backdrop-blur shadow-sm min-w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="asc">Oldest</SelectItem>
                <SelectItem value="desc">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageLoader label="Loading children…" />
      ) : children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-semibold text-foreground">No children found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting filters or add a new child.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                rooms={rooms}
                onView={() => handleView(child)}
                onEdit={() => handleEdit(child)}
                onDelete={() => setDeleteId(child.id)}
                isSelected={selectedChildren.includes(child.id)}
                onSelectToggle={() => handleSelectChild(child.id)}
                canEdit={can(perms.edit)}
                canDelete={can(perms.delete)}
              />
            ))}
          </div>
          {pagination && pagination.last_page > 1 && (
            <Pagination
              currentPage={pagination.current_page || 1}
              totalPages={pagination.last_page || 1}
              onPageChange={setPage}
              className="mt-6"
            />
          )}
        </>
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

      <AlertDialog
        open={!!deleteId || deleteId === "bulk"}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteId === "bulk" ? "Delete Selected Children?" : "Delete Child Profile?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the{" "}
              {deleteId === "bulk" ? "selected children's profiles" : "child's profile"} and
              documentation records. This action cannot be undone.
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

function ChildCard({
  child,
  rooms,
  onView,
  onEdit,
  onDelete,
  isSelected,
  onSelectToggle,
  canEdit = true,
  canDelete = true,
}) {
  const isActive = child.status?.toLowerCase() === "active";
  const genderLabel = child.gender ? child.gender.toUpperCase() : "—";
  const roomName = rooms.find((r) => r.id == child.room)?.name || child.room || "—";
  const imageUrl = resolveImageUrl(child.imageUrl);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelectToggle}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelectToggle();
        }
      }}
      className={`group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 ${
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:shadow-md hover:border-primary/40"
      }`}
    >
      {/* 1. Image Container (Top) */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted/40">
        <div
          className="absolute top-3 right-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelectToggle();
          }}
        >
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors ${isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-background/80 border-border/80 text-transparent hover:border-primary/50 backdrop-blur"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {child.imageUrl ? (
          <img
            src={imageUrl}
            alt={child.name}
            className="h-full w-full object-contain transition-opacity duration-1000 animate-in fade-in"
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
            onClick={(event) => {
              event.stopPropagation();
              onView();
            }}
            className={CARD_PRIMARY_ACTION_CLASSES}
            style={CARD_PRIMARY_ACTION_STYLE}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canEdit && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
