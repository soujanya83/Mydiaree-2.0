import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Trash2,
  Save,
  Search,
  Moon,
  Clock,
  Activity as ActivityIcon,
  Thermometer,
  StickyNote,
  PenLine,
  ChevronDown,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { CentreSelect } from "@/components/common/CentreSelect";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuthStore } from "@/stores/authStore";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { useParentDashboardStore } from "@/stores/parentDashboardStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sleepChecksService } from "@/services/daily-operations/sleepChecksService";
import { Pagination } from "@/components/common/Pagination";
import { DeleteConfirmationModal } from "@/components/common/DeleteConfirmationModal";
import { IMG_BASE_API } from "../api/imageapi";

const BREATHING_OPTIONS = ["Regular", "Fast", "Difficult"];
const TEMPERATURE_OPTIONS = ["Normal", "Warm", "Hot"];

export default function SleepCheckPage() {
  const { isParent } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const userName = user?.name || "";
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const rooms = useRoomStore((s) => s.rooms);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);

  const children = useChildrenStore((s) => s.children);
  const isLoading = useChildrenStore((s) => s.isLoading);

  const parentChildren = useParentDashboardStore((s) => s.children);
  const selectedChildId = useParentDashboardStore((s) => s.selectedChildId);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [fetchedChildren, setFetchedChildren] = useState([]);
  const [cards, setCards] = useState({}); // { [childId]: { selected, openEntryId, entries: [] } }
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    childId: null,
    entryId: null,
    isNew: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const [bulkModal, setBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    time: "",
    breathing: "Regular",
    temperature: "Normal",
    notes: "",
    signature: userName,
  });
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const selectedSleepCheckCount = useMemo(
    () => fetchedChildren.filter((c) => cards[c.id]?.selected).length,
    [cards, fetchedChildren],
  );

  const getCard = (id) => cards[id] ?? { selected: false, openEntryId: null, entries: [] };

  const fetchSleepChecks = useCallback(async () => {
    if (isParent) {
      if (!selectedChildId) return;
    } else {
      if (!activeCentreId || !activeRoomId) return;
    }
    setIsFetching(true);
    try {
      let params;
      if (isParent) {
        const selectedChild = parentChildren.find((c) => String(c.id) === String(selectedChildId));
        params = {
          centerid: selectedChild?.centerid,
          date,
          per_page: perPage,
          page: currentPage,
          child_id: selectedChildId,
        };
      } else {
        params = {
          centerid: activeCentreId,
          roomid: activeRoomId,
          date,
          per_page: perPage,
          page: currentPage,
          search: debouncedSearch || undefined,
        };
      }
      const res = await sleepChecksService.getSleepChecks(params);
      if (res.data.status && res.data.children) {
        setFetchedChildren(res.data.children);
        setTotalPages(res.data.pagination?.last_page || 1);
        const newCards = {};
        res.data.children.forEach((child) => {
          newCards[child.id] = {
            selected: false,
            openEntryId: null,
            entries: (child.sleepchecks || []).map((sc) => ({
              id: sc.id,
              time: sc.time,
              breathing: sc.breathing,
              temperature: sc.body_temperature,
              notes: sc.notes,
              signature: sc.signature,
              isNew: false,
            })),
          };
        });
        setCards(newCards);
      }
    } catch (error) {
      console.error("Failed to fetch sleep checks", error);
      toast.error("Failed to load sleep checks");
    } finally {
      setIsFetching(false);
    }
  }, [
    isParent,
    selectedChildId,
    activeCentreId,
    activeRoomId,
    date,
    perPage,
    currentPage,
    debouncedSearch,
    parentChildren,
  ]);

  useEffect(() => {
    fetchSleepChecks();
  }, [fetchSleepChecks]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCentreId, activeRoomId, date, selectedChildId, debouncedSearch]);

  const formatDateForSave = (dateStr) => {
    // Convert YYYY-MM-DD to DD-MM-YYYY
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const toFormData = (payload) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, v);
    });
    return fd;
  };

  const handleSaveSingle = async (childId, entry) => {
    setIsSaving(true);
    try {
      const payload = {
        childid: childId,
        diarydate: formatDateForSave(date),
        roomid: activeRoomId,
        time: entry.time,
        breathing: entry.breathing,
        body_temperature: entry.temperature,
        notes: entry.notes,
        signature: entry.signature,
      };

      const isUpdate = entry.isNew === false;
      let res;
      if (isUpdate) {
        payload.id = entry.id;
        res = await sleepChecksService.updateSleepCheck(toFormData(payload));
      } else {
        res = await sleepChecksService.saveSleepCheck(toFormData(payload));
      }

      if (res.data.status || res.data.success) {
        toast.success(
          res.data.message ||
            (isUpdate ? "Sleep check updated successfully" : "Saved successfully"),
        );
        fetchSleepChecks();
      }
    } catch (error) {
      console.error("Save failed", error);
      toast.error("Failed to save sleep check");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = (childId, entryId, isNew) => {
    if (isNew) {
      // New (unsaved) entry — remove locally, no confirmation needed
      setCards((p) => {
        const card = { ...p[childId] };
        card.entries = card.entries.filter((e) => e.id !== entryId);
        return { ...p, [childId]: card };
      });
      return;
    }
    // Persisted entry — open confirmation modal
    setDeleteModal({ open: true, childId, entryId, isNew });
  };

  const handleDeleteConfirm = async () => {
    const { childId, entryId } = deleteModal;
    setIsDeleting(true);
    try {
      const res = await sleepChecksService.deleteSleepCheck(toFormData({ id: entryId }));
      if (res.data.status) {
        toast.success("Entry deleted");
        setDeleteModal({ open: false, childId: null, entryId: null, isNew: false });
        fetchSleepChecks();
      } else {
        toast.error(res.data.message || "Failed to delete");
      }
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete sleep check");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkSave = async () => {
    const selectedIds = fetchedChildren.filter((c) => cards[c.id]?.selected).map((c) => c.id);

    const targetIds = selectedIds.length > 0 ? selectedIds : fetchedChildren.map((c) => c.id);

    if (targetIds.length === 0) {
      toast.info("No children to save.");
      return;
    }
    if (!bulkForm.time) {
      toast.error("Please enter a time.");
      return;
    }

    setIsBulkSaving(true);
    try {
      const fd = new FormData();
      targetIds.forEach((id) => fd.append("child_ids[]", id));
      fd.append("diarydate", formatDateForSave(date));
      fd.append("roomid", activeRoomId);
      fd.append("time", bulkForm.time);
      fd.append("breathing", bulkForm.breathing);
      fd.append("temperature", bulkForm.temperature);
      if (bulkForm.notes) fd.append("notes", bulkForm.notes);
      if (bulkForm.signature) fd.append("signature", bulkForm.signature);

      const res = await sleepChecksService.bulkSaveSleepChecks(fd);
      if (res.data.success || res.data.status) {
        toast.success(res.data.message || "Bulk entries saved successfully!");
        setBulkModal(false);
        setBulkForm({
          time: "",
          breathing: "Regular",
          temperature: "Normal",
          notes: "",
          signature: userName,
        });
        fetchSleepChecks();
      } else {
        toast.error(res.data.message || "Failed to save bulk entries");
      }
    } catch (error) {
      console.error("Bulk save failed", error);
      toast.error("Failed to save bulk entries");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleSaveAll = async () => {
    const newEntries = [];
    Object.entries(cards).forEach(([childId, card]) => {
      card.entries.forEach((e) => {
        if (e.isNew !== false) {
          newEntries.push({ childId, entry: e });
        }
      });
    });

    if (newEntries.length === 0) {
      toast.info("No new entries to save.");
      return;
    }

    toast.loading("Saving all new entries...", { id: "save-all" });
    setIsSaving(true);
    try {
      for (const item of newEntries) {
        const payload = {
          childid: item.childId,
          diarydate: formatDateForSave(date),
          roomid: activeRoomId,
          time: item.entry.time,
          breathing: item.entry.breathing,
          body_temperature: item.entry.temperature,
          notes: item.entry.notes,
          signature: item.entry.signature,
        };
        await sleepChecksService.saveSleepCheck(toFormData(payload));
      }
      toast.success("All new entries saved", { id: "save-all" });
      fetchSleepChecks();
    } catch (error) {
      toast.error("Some entries failed to save", { id: "save-all" });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelect = (childId, selected) => {
    setCards((p) => {
      const card = { ...getCard(childId), selected };
      return { ...p, [childId]: card };
    });
  };

  const toggleOpen = (childId, entryId) => {
    setCards((p) => {
      const card = { ...getCard(childId) };
      card.openEntryId = card.openEntryId === entryId ? null : entryId;
      return { ...p, [childId]: card };
    });
  };

  const addEntry = (childId) => {
    const entry = {
      id: crypto.randomUUID(),
      time: nowHHMM(),
      breathing: "Regular",
      temperature: "Normal",
      notes: "",
      signature: userName,
      isNew: true,
    };
    setCards((p) => {
      const card = { ...getCard(childId) };
      card.entries = [...card.entries, entry];
      card.openEntryId = entry.id; // Open it immediately
      return { ...p, [childId]: card };
    });
  };

  const updateEntry = (childId, entryId, patch) => {
    setCards((p) => {
      const card = { ...getCard(childId) };
      card.entries = card.entries.map((e) => (e.id === entryId ? { ...e, ...patch } : e));
      return { ...p, [childId]: card };
    });
  };

  function nowHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  return (
    <div>
      <PageHeader
        title="Sleep Check"
        description="10-minute sleep monitoring records per child"
        breadcrumbs={[{ label: "Sleep Check" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {!isParent && (
              <>
                <CentreSelect icon={null} triggerClassName="h-9 w-[200px]" placeholder="Centre" />
                <Select value={activeRoomId} onValueChange={setActiveRoom}>
                  <SelectTrigger className="h-9 w-[160px]">
                    <SelectValue placeholder="Room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 w-[160px]"
            />
          </div>
        }
      />

      {/* Search — hidden for parents */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        {!isParent && (
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by child name…"
              className="h-10 pl-9"
            />
          </div>
        )}
      </div>

      {/* Children list */}
      {isFetching ? (
        <PageLoader label="Loading sleep checks…" />
      ) : fetchedChildren.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No children found in this room.
        </div>
      ) : (
        <div className="space-y-5">
          {fetchedChildren.map((child) => {
            const card = getCard(child.id);
            const fullName = [child.name, child.lastname].filter(Boolean).join(" ") || "??";
            const initials = fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const avatarSrc = child.imageUrl
              ? child.imageUrl.startsWith("http")
                ? child.imageUrl
                : `${IMG_BASE_API}${child.imageUrl.replace(/^\/+/, "")}`
              : null;
            return (
              <article
                key={child.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                {/* Card header */}
                <header className="flex items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      {avatarSrc && (
                        <AvatarImage src={avatarSrc} alt={fullName} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-base font-bold text-foreground">{fullName}</h3>
                      <p className="text-xs text-muted-foreground">
                        {rooms.find((r) => r.id === activeRoomId)?.name || "—"}
                      </p>
                    </div>
                  </div>
                  {!isParent && (
                    <Checkbox
                      checked={card.selected}
                      onCheckedChange={(v) => toggleSelect(child.id, v)}
                      aria-label={`Select ${child.name}`}
                    />
                  )}
                </header>
                {/* ... rest of the card content stays same ... */}

                {/* Column headers */}
                <div className="hidden grid-cols-6 gap-2 bg-muted/40 px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
                  <div>Time</div>
                  <div>Breathing</div>
                  <div>Body Temp</div>
                  <div>Notes</div>
                  <div>Signature</div>
                  <div>Action</div>
                </div>

                {/* Entries */}
                <div className="divide-y divide-border">
                  {card.entries.length === 0 && (
                    <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                      {isParent
                        ? "No sleep check entries found for this child."
                        : "No entries yet. Tap “Add 10-min Entry” to begin."}
                    </div>
                  )}

                  {card.entries.map((entry) => {
                    const open = card.openEntryId === entry.id;
                    return (
                      <div key={entry.id}>
                        {/* Summary row */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isParent) toggleOpen(child.id, entry.id);
                          }}
                          className={cn(
                            "grid w-full grid-cols-2 items-center gap-2 px-5 py-3 text-left text-sm md:grid-cols-6 md:text-center",
                            !isParent && "hover:bg-muted/30",
                          )}
                        >
                          <div className="font-semibold text-primary md:font-medium md:text-foreground">
                            {entry.time || "—"}
                          </div>
                          <div className="truncate text-muted-foreground md:text-foreground">
                            {entry.breathing || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.temperature || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.notes || "—"}
                          </div>
                          <div className="hidden truncate text-muted-foreground md:block md:text-foreground">
                            {entry.signature || "—"}
                          </div>
                          <div className="hidden items-center justify-center md:flex">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                                entry.isNew === false
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700",
                              )}
                            >
                              {entry.isNew === false ? "Saved" : "New"}
                            </span>
                            {!isParent && (
                              <ChevronDown
                                className={cn(
                                  "ml-2 h-4 w-4 text-muted-foreground transition-transform",
                                  open && "rotate-180",
                                )}
                              />
                            )}
                          </div>
                        </button>

                        {/* Expanded editor */}
                        {open && (
                          <div className="border-t border-dashed border-border bg-muted/20 px-5 py-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                              <Field icon={Clock} label="Time" required>
                                <Input
                                  type="time"
                                  value={entry.time}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { time: e.target.value })
                                  }
                                />
                              </Field>
                              <Field icon={ActivityIcon} label="Breathing" required>
                                <Select
                                  value={entry.breathing}
                                  onValueChange={(v) =>
                                    updateEntry(child.id, entry.id, { breathing: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {BREATHING_OPTIONS.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                              <Field icon={Thermometer} label="Body Temperature" required>
                                <Select
                                  value={entry.temperature}
                                  onValueChange={(v) =>
                                    updateEntry(child.id, entry.id, { temperature: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TEMPERATURE_OPTIONS.map((o) => (
                                      <SelectItem key={o} value={o}>
                                        {o}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </Field>
                              <Field icon={StickyNote} label="Notes" className="md:col-span-2">
                                <Textarea
                                  rows={2}
                                  value={entry.notes}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { notes: e.target.value })
                                  }
                                  placeholder="Sleep check list notes…"
                                />
                              </Field>
                              <Field icon={PenLine} label="Signature" required>
                                <Input
                                  value={entry.signature}
                                  onChange={(e) =>
                                    updateEntry(child.id, entry.id, { signature: e.target.value })
                                  }
                                  placeholder="signature"
                                />
                              </Field>
                            </div>

                            {!isParent && (
                              <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteEntry(child.id, entry.id, entry.isNew !== false)
                                  }
                                >
                                  <Trash2 className="mr-1.5 h-4 w-4" />
                                  Remove
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveSingle(child.id, entry)}
                                  disabled={isSaving}
                                >
                                  <Save className="mr-1.5 h-4 w-4" />
                                  {entry.isNew === false ? "Update" : "Save"}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Card footer */}
                {!isParent && (
                  <div className="flex items-center justify-start border-t border-border bg-muted/20 px-5 py-3">
                    <Button size="sm" onClick={() => addEntry(child.id)} className="rounded-full">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add 10-min Entry
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Footer */}
      {!isParent && fetchedChildren.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-6">
          {selectedSleepCheckCount === 2 && (
            <Button
              variant="outline"
              onClick={() => {
                const now = new Date();
                const hh = String(now.getHours()).padStart(2, "0");
                const mm = String(now.getMinutes()).padStart(2, "0");
                setBulkForm((f) => ({
                  ...f,
                  time: `${hh}:${mm}`,
                  signature: f.signature || userName,
                }));
                setBulkModal(true);
              }}
            >
              <Users className="mr-1.5 h-4 w-4" />
              Bulk Entry
            </Button>
          )}
          <Button onClick={handleSaveAll} className="min-w-[200px]" disabled={isSaving}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? "Saving..." : "Save All Sleep Checks"}
          </Button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, childId: null, entryId: null, isNew: false })}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete sleep check entry?"
        description="This entry will be permanently removed and cannot be recovered."
      />

      {/* Bulk entry modal */}
      {bulkModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Bulk Sleep Check Entry</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {(() => {
                      const sel = fetchedChildren.filter((c) => cards[c.id]?.selected);
                      const count = sel.length > 0 ? sel.length : fetchedChildren.length;
                      return `Applies to ${count} child${count === 1 ? "" : "ren"}`;
                    })()}
                  </p>
                </div>
                <button
                  onClick={() => setBulkModal(false)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                  disabled={isBulkSaving}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4 px-6 py-5">
                {/* Time */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    Time <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="time"
                    value={bulkForm.time}
                    onChange={(e) => setBulkForm((f) => ({ ...f, time: e.target.value }))}
                    className="h-9"
                  />
                </div>

                {/* Breathing + Temperature */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                      <ActivityIcon className="h-3.5 w-3.5 text-primary" />
                      Breathing
                    </label>
                    <Select
                      value={bulkForm.breathing}
                      onValueChange={(v) => setBulkForm((f) => ({ ...f, breathing: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {BREATHING_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Thermometer className="h-3.5 w-3.5 text-primary" />
                      Temperature
                    </label>
                    <Select
                      value={bulkForm.temperature}
                      onValueChange={(v) => setBulkForm((f) => ({ ...f, temperature: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[200]">
                        {TEMPERATURE_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    <StickyNote className="h-3.5 w-3.5 text-primary" />
                    Notes
                  </label>
                  <Textarea
                    value={bulkForm.notes}
                    onChange={(e) => setBulkForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes…"
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>

                {/* Signature */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
                    <PenLine className="h-3.5 w-3.5 text-primary" />
                    Signature
                  </label>
                  <Input
                    value={bulkForm.signature}
                    onChange={(e) => setBulkForm((f) => ({ ...f, signature: e.target.value }))}
                    placeholder="Optional signature…"
                    className="h-9"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t border-border bg-muted/30 px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setBulkModal(false)}
                  disabled={isBulkSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleBulkSave} disabled={isBulkSaving}>
                  <Save className="mr-1.5 h-4 w-4" />
                  {isBulkSaving
                    ? "Saving..."
                    : (() => {
                        const sel = fetchedChildren.filter((c) => cards[c.id]?.selected);
                        const count = sel.length > 0 ? sel.length : fetchedChildren.length;
                        return count > 1 ? "Save Bulk Entry" : "Save Entry";
                      })()}
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function Field({ icon: Icon, label, required, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
        {required && <span className="text-destructive font-bold ml-0.5">*</span>}
      </p>
      {children}
    </div>
  );
}
