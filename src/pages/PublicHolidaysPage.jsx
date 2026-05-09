import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Filter as FilterIcon, RotateCcw, Pencil, Trash2,
  CalendarDays, MapPin, Sparkles, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { months, formatDate } from "@/components/events/eventsData";
import { holidayService } from "@/services/centre/holidayService";

export default function PublicHolidaysPage() {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState("All Months");
  const [appliedMonth, setAppliedMonth] = useState("All Months");
  const [deleteId, setDeleteId] = useState(null);
  const [selected, setSelected] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHolidays = useCallback(async () => {
    setIsLoading(true);
    try {
      const monthNum = appliedMonth === "All Months" ? "" : months.indexOf(appliedMonth);
      const res = await holidayService.getHolidays(monthNum);
      if (res.status) {
        setHolidays(res.holidays || []);
      } else {
        toast.error(res.message || "Failed to fetch holidays");
      }
    } catch (error) {
      toast.error("Failed to load holidays");
    } finally {
      setIsLoading(false);
    }
  }, [appliedMonth]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const toggleAll = (checked) => {
    setSelected(checked ? holidays.map((r) => r.id) : []);
  };
  const toggleOne = (id, checked) => {
    setSelected((arr) => (checked ? [...arr, id] : arr.filter((x) => x !== id)));
  };

  const openAdd = () => navigate("/events/create?type=Public Holiday");
  const openEdit = (row) => navigate(`/events/${row.id}/edit?type=Public Holiday`);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await holidayService.deleteHoliday(deleteId);
      if (res.status) {
        toast.success("Holiday deleted");
        setHolidays((arr) => arr.filter((x) => x.id !== deleteId));
        setSelected((arr) => arr.filter((x) => x !== deleteId));
      } else {
        toast.error(res.message || "Failed to delete holiday");
      }
    } catch (error) {
      toast.error("Error deleting holiday");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selected.length} holidays?`)) return;

    setIsDeleting(true);
    try {
      const res = await holidayService.bulkDeleteHolidays(selected);
      if (res.status) {
        toast.success(`${selected.length} holidays deleted`);
        setHolidays((arr) => arr.filter((x) => !selected.includes(x.id)));
        setSelected([]);
      } else {
        toast.error(res.message || "Failed to delete holidays");
      }
    } catch (error) {
      toast.error("Error performing bulk delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const allChecked = holidays.length > 0 && selected.length === holidays.length;

  const upcoming = useMemo(() => {
    const now = new Date();
    return holidays.filter((h) => {
      const d = h.Holiday_date ? new Date(h.Holiday_date) : new Date(now.getFullYear(), h.month - 1, h.date);
      return d.getTime() >= now.getTime();
    }).length;
  }, [holidays]);

  return (
    <div>
      <PageHeader
        title="Public Holiday List"
        description="Plan around statutory holidays and centre closures"
        breadcrumbs={[
          { label: "Events", to: "/events" },
          { label: "Public Holidays" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/events")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add New Holiday
            </Button>
          </>
        }
      />

      {/* Stats */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          icon={<CalendarDays className="h-5 w-5" />}
          label="Total holidays"
          value={holidays.length}
          tone="primary"
        />
        <StatTile
          icon={<Sparkles className="h-5 w-5" />}
          label="Upcoming"
          value={upcoming}
          tone="success"
        />
        <StatTile
          icon={<FilterIcon className="h-5 w-5" />}
          label="Showing"
          value={holidays.length}
          tone="info"
        />
      </div>

      {/* Filter bar */}
      <div className="mb-5 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
            <FilterIcon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold">Filters</h3>
        </div>
        <div className="flex flex-wrap items-end gap-3 p-4">
          <div className="w-full space-y-1 sm:w-56">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Month
            </label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setAppliedMonth(month)} className="h-10">
            <FilterIcon className="h-4 w-4" /> Apply filter
          </Button>
          <Button
            variant="outline"
            className="h-10"
            onClick={() => { setMonth("All Months"); setAppliedMonth("All Months"); }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          {appliedMonth !== "All Months" && (
            <Badge variant="secondary" className="ml-auto">
              Filtered by: {appliedMonth}
            </Badge>
          )}
        </div>
      </div>

      {/* Selection bar */}
      {selected.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm animate-in fade-in slide-in-from-top-2">
          <span className="font-medium text-foreground">
            {selected.length} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Trash2 className="h-3 w-3 mr-1" />}
              Delete Selected
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])} disabled={isDeleting}>
              Clear
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-primary/20 bg-gradient-to-r from-primary/10 to-transparent hover:bg-primary/10">
              <TableHead className="w-12">
                <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead className="w-16 font-semibold text-foreground">#</TableHead>
              <TableHead className="font-semibold text-foreground">Date</TableHead>
              <TableHead className="font-semibold text-foreground">Occasion</TableHead>
              <TableHead className="font-semibold text-foreground">State</TableHead>
              <TableHead className="font-semibold text-foreground text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
                    <p className="text-sm text-muted-foreground">Fetching holidays...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : holidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 opacity-40" />
                    <p className="text-sm">No holidays found for this month.</p>
                    <Button size="sm" variant="outline" onClick={openAdd}>
                      <Plus className="h-4 w-4" /> Add Holiday
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              holidays.map((row, idx) => {
                const holidayDate = row.Holiday_date ? new Date(row.Holiday_date) : new Date(new Date().getFullYear(), row.month - 1, row.date);
                const isUpcoming = holidayDate.getTime() >= Date.now();
                return (
                  <TableRow
                    key={row.id}
                    className={`transition-colors ${
                      idx % 2 === 1 ? "bg-muted/20" : ""
                    } ${selected.includes(row.id) ? "bg-primary/5" : ""}`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(row.id)}
                        onCheckedChange={(c) => toggleOne(row.id, !!c)}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 flex-col items-center justify-center rounded-lg border border-primary/20 bg-primary/5 leading-tight">
                          <span className="text-[10px] font-semibold uppercase text-primary">
                            {holidayDate.toLocaleDateString("en-GB", { month: "short" })}
                          </span>
                          <span className="text-sm font-bold text-foreground">
                            {row.date}
                          </span>
                        </div>
                        <div className="leading-tight">
                          <p className="text-sm font-medium">{formatDate(holidayDate)}</p>
                          <p className="text-xs text-muted-foreground">
                            {holidayDate.toLocaleDateString("en-GB", { weekday: "long" })}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{row.occasion}</span>
                        {isUpcoming && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white text-[10px]">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.state ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {row.state}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this holiday?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatTile({ icon, label, value, tone = "primary" }) {
  const tones = {
    primary: "from-primary/15 to-primary/5 text-primary",
    success: "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
    info: "from-sky-500/15 to-sky-500/5 text-sky-600",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br ${tones[tone]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-2xl font-bold leading-tight text-foreground">{value}</p>
      </div>
    </div>
  );
}