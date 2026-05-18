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
import { PageLoader } from "@/components/common/PageLoader";
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
  return imageUrl.startsWith("http") ? imageUrl : `https://mydiaree.com.au/${imageUrl}`;
};

const textOrDash = (value) => value || "—";

export default function ChildrenPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading, fetchChildren, deleteChildren, addChild, updateChild } =
    useChildrenStore();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.children;

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedChildDetails, setSelectedChildDetails] = useState(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

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

  const handleView = async (child) => {
    setDetailsOpen(true);
    setSelectedChildDetails(null);
    setIsDetailsLoading(true);

    try {
      const response = await childrenService.getChildDetails(child.id);
      setSelectedChildDetails(response.data || response);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to load child details",
      );
      setDetailsOpen(false);
    } finally {
      setIsDetailsLoading(false);
    }
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
          can(perms.add) ? (
            <Button onClick={handleNewChild} className="gap-2">
              <Plus className="h-4 w-4" /> Add New Child
            </Button>
          ) : null
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              rooms={rooms}
              onView={() => handleView(child)}
              onEdit={() => handleEdit(child)}
              onDelete={() => setDeleteId(child.id)}
              canEdit={can(perms.edit)}
              canDelete={false}
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

      <ChildDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        child={selectedChildDetails}
        isLoading={isDetailsLoading}
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

function ChildCard({ child, rooms, onView, onEdit, onDelete, canEdit = true, canDelete = true }) {
  const isActive = child.status?.toLowerCase() === "active";
  const genderLabel = child.gender ? child.gender.toUpperCase() : "—";
  const roomName = rooms.find((r) => r.id == child.room)?.name || child.room || "—";
  const imageUrl = resolveImageUrl(child.imageUrl);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onView}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView();
        }
      }}
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
    >
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

function ChildDetailsModal({ open, onOpenChange, child, isLoading }) {
  const fullName = child ? `${child.name || ""} ${child.lastname || ""}`.trim() : "";
  const imageUrl = resolveImageUrl(child?.imageUrl);
  const isActive = child?.status?.toLowerCase() === "active";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-3xl rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Baby className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground pr-8">
                Child Profile Details
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                Complete profile information and family contacts
              </p>
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
            <p className="text-sm font-medium">Loading child details...</p>
          </div>
        ) : child ? (
          <div className="max-h-[calc(90vh-96px)] overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="flex flex-col items-center relative shrink-0">
                <div className="relative mb-2">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/40 to-indigo-500/40 opacity-70 blur-md"></div>
                  <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-md">
                    {imageUrl ? (
                      <img src={imageUrl} alt={fullName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50">
                        <Users className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`mt-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${
                    isActive
                      ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                      : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
                  }`}
                >
                  {child.status || "Inactive"}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-4">
                  <h3 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                    {textOrDash(fullName)}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <IdCard className="h-4 w-4" /> ID: {child.id}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem icon={Calendar} label="Date of Birth" value={fmtDate(child.dob)} />
                  <DetailItem icon={Calendar} label="Start Date" value={fmtDate(child.startDate)} />
                  <DetailItem icon={DoorOpen} label="Room" value={child.room} />
                  <DetailItem icon={UserRound} label="Gender" value={child.gender} />
                </div>
              </div>
            </div>

            {(child.address || child.other_details) && (
               <div className="mt-6 grid gap-5 lg:grid-cols-2">
                 {child.address && (
                   <DetailSection title="Contact Details">
                     <DetailItem icon={Home} label="Address" value={child.address} />
                   </DetailSection>
                 )}
 
                 {child.other_details && (
                   <DetailSection title="Other Details">
                     <p className="text-sm font-medium leading-6 text-muted-foreground">{child.other_details}</p>
                   </DetailSection>
                 )}
               </div>
            )}

            {child.parents?.length ? (
              <DetailSection title="Parents / Guardians" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {child.parents.map((parent) => (
                    <div key={parent.id} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Users className="h-10 w-10" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between">
                          <p className="text-base font-bold text-foreground">{textOrDash(parent.name)}</p>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {textOrDash(parent.relation)}
                          </span>
                        </div>
                        
                        <div className="mt-3 flex flex-col gap-2.5 text-sm font-medium text-muted-foreground">
                          {parent.email && (
                            <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors group-hover:bg-muted/60">
                              <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                              <span className="break-all">{textOrDash(parent.email)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors group-hover:bg-muted/60">
                            <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                            <span>{textOrDash(parent.phone || parent.contactNo)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {child.siblings?.length ? (
              <DetailSection title="Siblings" className="mt-6">
                <div className="flex flex-wrap gap-2.5">
                  {child.siblings.map((sibling) => (
                    <div
                      key={sibling.id || sibling.childname || sibling.name}
                      className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 shadow-sm transition-colors hover:bg-muted/50"
                    >
                      <UserRound className="h-4 w-4 text-muted-foreground/70" />
                      <span className="text-sm font-semibold text-foreground">
                        {sibling.childname ||
                          sibling.name ||
                          `${sibling.firstname || ""} ${sibling.lastname || ""}`.trim()}
                        {sibling.lastname ? ` ${sibling.lastname}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}
          </div>
        ) : (
          <div className="p-10 text-center text-sm font-medium text-muted-foreground">No child details available.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailSection({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-muted/10 p-5 shadow-sm ${className}`}>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground opacity-90">
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border/40 p-3 shadow-sm transition-colors hover:bg-background/80">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold text-foreground">{textOrDash(value)}</p>
      </div>
    </div>
  );
}

function EmptyDetail({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
