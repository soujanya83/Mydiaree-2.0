import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, CalendarDays, Filter as FilterIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { initialEvents, eventTypes } from "@/components/events/eventsData";
import { EventCard } from "@/components/events/EventCard";

export default function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState(initialEvents);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);

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
    setType("all"); setStatus("all"); setTitle(""); setDate("");
  };

  const handleDelete = () => {
    setEvents((arr) => arr.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    toast.success("Event deleted");
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Manage announcements, events and notices"
        breadcrumbs={[{ label: "Events" }]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/events/holidays")}>
              <CalendarDays className="h-4 w-4" />
              Public Holiday
            </Button>
            <Button onClick={() => navigate("/events/create")}>
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <FilterIcon className="h-4 w-4" />
          Filters
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {eventTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input placeholder="Search title" value={title} onChange={(e) => setTitle(e.target.value)} />
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

      {/* Header banner */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold">
          <CalendarDays className="h-5 w-5" /> Events
        </h2>
        <span className="rounded-md bg-background/95 px-2.5 py-0.5 text-xs font-semibold text-foreground">
          {filtered.length} TOTAL
        </span>
      </div>

      {filtered.length === 0 ? (
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
    </div>
  );
}