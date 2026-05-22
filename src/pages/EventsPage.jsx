import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarDays, Filter as FilterIcon, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { eventTypes } from "@/components/events/eventsData";
import { EventCard } from "@/components/events/EventCard";
import { announcementService } from "@/services/centre/announcementService";
import { holidayService } from "@/services/centre/holidayService";
import { useCentreStore } from "@/stores/centreStore";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { mapAnnouncementRecord } from "@/components/events/eventMappers";

export default function EventsPage() {
  const navigate = useNavigate();
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { can, isParent } = usePermissions();
  const perms = ACTION_PERMISSIONS.events;
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isSavingHoliday, setIsSavingHoliday] = useState(false);
  const [holidayErrors, setHolidayErrors] = useState({});
  const [holidayForm, setHolidayForm] = useState({
    date: "",
    state: "",
    occasion: "",
    status: "1",
  });

  const fetchEvents = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const res = await announcementService.getAnnouncements(activeCentreId);
      if (res.status) {
        setEvents((res.data?.records || []).map(mapAnnouncementRecord));
      } else {
        toast.error(res.message || "Failed to fetch events");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (status !== "all" && e.status !== status) return false;
      if (title && !e.title.toLowerCase().includes(title.toLowerCase())) return false;
      if (date && e.date !== date) return false;
      return true;
    });
  }, [events, type, status, title, date]);

  const reset = () => {
    setType("all");
    setStatus("all");
    setTitle("");
    setDate("");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await announcementService.deleteAnnouncement(deleteId);
      if (res.status === false) {
        toast.error(res.message || "Failed to delete event");
        return;
      }
      setEvents((arr) => arr.filter((e) => e.id !== String(deleteId)));
      toast.success(res.message || "Event deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete event");
    }
    setDeleteId(null);
  };

  const handleHolidaySave = async () => {
    if (!activeCentreId) {
      toast.error("Please select a centre first");
      return;
    }
    setIsSavingHoliday(true);
    setHolidayErrors({});
    try {
      const res = await holidayService.saveHoliday({
        centerid: String(activeCentreId),
        date: holidayForm.date,
        state: holidayForm.state.trim(),
        occasion: holidayForm.occasion.trim(),
        status: holidayForm.status,
      });
      if (res.status === "error" && res.errors) {
        setHolidayErrors({
          date: res.errors.date?.[0],
          state: res.errors.state?.[0],
          occasion: res.errors.occasion?.[0],
          centerid: res.errors.centerid?.[0],
        });
        toast.error("Validation failed. Please correct highlighted fields.");
        return;
      }
      if (res.status === false) {
        toast.error(res.message || "Failed to create holiday");
        return;
      }
      toast.success("Holiday created successfully");
      setIsHolidayModalOpen(false);
      setHolidayForm({ date: "", state: "", occasion: "", status: "1" });
      setHolidayErrors({});
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        setHolidayErrors({
          date: apiErrors.date?.[0],
          state: apiErrors.state?.[0],
          occasion: apiErrors.occasion?.[0],
          centerid: apiErrors.centerid?.[0],
        });
        toast.error("Validation failed. Please correct highlighted fields.");
      } else {
        toast.error(error?.response?.data?.message || "Failed to create holiday");
      }
    } finally {
      setIsSavingHoliday(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage announcements, events and notices"
        breadcrumbs={[{ label: "Events" }]}
        actions={
          <>
            {!isParent && (
              <Button variant="outline" onClick={() => navigate("/events/holidays")}>
                <CalendarDays className="h-4 w-4" />
                Public Holiday
              </Button>
            )}
            {can(perms.add) && (
              <Button
                variant="outline"
                onClick={() => {
                  setHolidayForm({ date: "", state: "", occasion: "", status: "1" });
                  setHolidayErrors({});
                  setIsHolidayModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Add Holiday
              </Button>
            )}
            {can(perms.add) && (
              <Button onClick={() => navigate("/events/create")}>
                <Plus className="h-4 w-4" />
                Add New
              </Button>
            )}
          </>
        }
      />

      {/* Filters */}
      {!isParent && (
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
            <FilterIcon className="h-4 w-4" />
            Filters
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {centres.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">Centre</Label>
                <Select value={String(activeCentreId || "")} onValueChange={setActiveCentre}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select centre" />
                  </SelectTrigger>
                  <SelectContent>
                    {centres.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {eventTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                placeholder="Search title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={reset} className="w-full">
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header banner replacement — more formal */}
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <CalendarDays className="h-5 w-5 text-primary" /> Recent Events
        </h2>
        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
          {filtered.length} TOTAL
        </span>
      </div>

      {isLoading ? (
        <PageLoader label="Loading events…" />
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          No events match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onView={(e) => navigate(`/events/${e.id}`)}
              onEdit={(e) => navigate(`/events/${e.id}/edit`)}
              onDelete={(e) => setDeleteId(e.id)}
              canEdit={can(perms.edit)}
              canDelete={can(perms.delete)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isHolidayModalOpen} onOpenChange={setIsHolidayModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Holiday</DialogTitle>
            <DialogDescription>
              Fill all required fields marked with <span className="text-red-600">*</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="events-holiday-date">
                Date <span className="text-red-600">*</span>
              </Label>
              <Input
                id="events-holiday-date"
                type="date"
                value={holidayForm.date}
                onChange={(e) => {
                  setHolidayForm((prev) => ({ ...prev, date: e.target.value }));
                  if (holidayErrors.date) {
                    setHolidayErrors((prev) => ({ ...prev, date: null }));
                  }
                }}
              />
              {holidayErrors.date ? (
                <p className="text-sm text-destructive">{holidayErrors.date}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="events-holiday-state">
                State <span className="text-red-600">*</span>
              </Label>
              <Input
                id="events-holiday-state"
                value={holidayForm.state}
                onChange={(e) => {
                  setHolidayForm((prev) => ({ ...prev, state: e.target.value }));
                  if (holidayErrors.state) {
                    setHolidayErrors((prev) => ({ ...prev, state: null }));
                  }
                }}
              />
              {holidayErrors.state ? (
                <p className="text-sm text-destructive">{holidayErrors.state}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="events-holiday-occasion">
                Occasion <span className="text-red-600">*</span>
              </Label>
              <Input
                id="events-holiday-occasion"
                value={holidayForm.occasion}
                onChange={(e) => {
                  setHolidayForm((prev) => ({ ...prev, occasion: e.target.value }));
                  if (holidayErrors.occasion) {
                    setHolidayErrors((prev) => ({ ...prev, occasion: null }));
                  }
                }}
              />
              {holidayErrors.occasion ? (
                <p className="text-sm text-destructive">{holidayErrors.occasion}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={holidayForm.status}
                onValueChange={(value) => setHolidayForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {holidayErrors.centerid ? (
              <p className="text-sm text-destructive">{holidayErrors.centerid}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsHolidayModalOpen(false)}
              disabled={isSavingHoliday}
            >
              Cancel
            </Button>
            <Button onClick={handleHolidaySave} disabled={isSavingHoliday}>
              {isSavingHoliday ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
