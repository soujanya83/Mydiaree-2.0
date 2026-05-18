import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Mail, Table as TableIcon, LayoutGrid,
  Users, CheckCircle2, Clock, Calendar, Search, Eye, MoreHorizontal,
  Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/PageLoader";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { getFormOptions } from "@/services/admin/formOptionsService";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  sessionOptions as mockSessionOptions, kinderOptions as mockKinderOptions, dayShort,
  formatSubmittedAt, formatDob,
} from "@/components/forms/reEnrollmentData";
import ReEnrollmentDetailsModal from "@/components/forms/ReEnrollmentDetailsModal";
import SendReEnrollmentEmailModal from "@/components/forms/SendReEnrollmentEmailModal";
import { reEnrollmentService } from "@/services/admin/reEnrollmentService";
import { toast } from "sonner";

const VIEW = { FORM: "form", TABLE: "table", CARDS: "cards" };

function StatTile({ label, value, icon: Icon, gradient }) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl p-[1px] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      gradient
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-full flex-col items-center justify-center rounded-[23px] bg-background/95 p-6 text-center backdrop-blur-xl transition-colors duration-300 group-hover:bg-background/80">
        <div className={cn(
          "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-inner",
          gradient
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <p className="text-4xl font-extrabold tracking-tight text-foreground">{value}</p>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon: Icon, children, color = "primary" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 overflow-hidden rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300",
        active 
          ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md"
          : "bg-transparent text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      <Icon className={cn("h-4 w-4 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
      <span>{children}</span>
      {active && (
        <span className="absolute inset-0 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}

function DayChips({ days }) {
  if (!days?.length) return <span className="text-xs text-muted-foreground">--</span>;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {days.map((d) => (
        <span
          key={d}
          className="inline-flex items-center rounded bg-info px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-info-foreground"
        >
          {dayShort[d] || d.slice(0, 3).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

function CurrentDayChips({ days }) {
  if (!days?.length) return <span className="text-xs text-muted-foreground">--</span>;
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {days.map((d) => (
        <span
          key={d}
          className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground"
        >
          {dayShort[d] || d.slice(0, 3).toUpperCase()}
        </span>
      ))}
    </div>
  );
}

function KinderBadge({ value, meta }) {
  const label = meta?.kinder_programs[value] || mockKinderOptions.find((k) => k.value === value)?.label?.replace(" at Nextgen", "") || value;
  if (value === "not_attending" || value === "Not Attending" || !value) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }
  if (value === "unfunded" || value === "Unfunded") {
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning">UNFUNDED</Badge>
    );
  }
  return (
    <Badge className="bg-success text-success-foreground hover:bg-success uppercase">
      {label}
    </Badge>
  );
}

function Avatar({ name }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info text-sm font-bold text-info-foreground">
      {letter}
    </div>
  );
}

export default function FormsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [view, setView] = useState(VIEW.TABLE);
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [kinderFilter, setKinderFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, processed: 0, pending: 0, thisWeek: 0 });
  const [meta, setMeta] = useState(null);

  const [openId, setOpenId] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formOptions, setFormOptions] = useState([]);
  const [isLoadingFormOptions, setIsLoadingFormOptions] = useState(false);

  const fetchMeta = useCallback(async () => {
    try {
      const res = await reEnrollmentService.getMetadata();
      if (res.status) {
        setMeta(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch metadata", error);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reEnrollmentService.getFilteredSubmissions({
        search,
        session_option: sessionFilter,
        kinder_program: kinderFilter,
        date_from: dateFrom,
        date_to: dateTo,
        page,
      });
      if (res.status) {
        // Map API data to UI structure
        const mapped = res.data.map(item => ({
          id: item.id,
          childName: item.child_name,
          dob: item.child_dob,
          parentEmail: item.parent_email,
          currentDays: item.current_days ? item.current_days.split(",").map(d => d.trim()) : [],
          requestedDays: item.requested_days ? item.requested_days.split(",").map(d => d.trim()) : [],
          session: item.session_option,
          kinder: item.kinder_program,
          submittedAt: item.submitted_at,
          holidayPlans: item.holiday_dates,
          status: item.status,
          finishingChildName: item.finishing_child_name,
          lastDay: item.last_day,
        }));
        setSubmissions(mapped);
        setStats({
          total: res.stats.total,
          processed: res.stats.completed,
          pending: res.stats.pending,
          thisWeek: res.stats.this_week
        });
        setPagination(res.pagination);
      }
    } catch (error) {
      toast.error("Failed to fetch submissions");
    } finally {
      setIsLoading(false);
    }
  }, [search, sessionFilter, kinderFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    if (formModalOpen) {
      const fetchFormOptions = async () => {
        setIsLoadingFormOptions(true);
        try {
          const options = await getFormOptions();
          setFormOptions(options);
        } catch (error) {
          console.error("Failed to fetch form options", error);
        } finally {
          setIsLoadingFormOptions(false);
        }
      };
      fetchFormOptions();
    }
  }, [formModalOpen]);

  const handlePrint = async (id) => {
    try {
      const blob = await reEnrollmentService.printSubmission(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const openSubmission = submissions.find((s) => s.id === openId) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-foreground">Re-Enrollment</span>
        </nav>
      </div>

      {/* Header + view toggles */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Re-Enrollment Dashboard 2026</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and view all re-enrollment submissions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-full border bg-card p-1.5 shadow-sm">
          <ViewToggleButton
            active={view === VIEW.FORM}
            onClick={() => setFormModalOpen(true)}
            icon={FileText}
          >
            Form
          </ViewToggleButton>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-4"
            onClick={() => setEmailOpen(true)}
          >
            <Mail className="h-4 w-4" /> Send Email
          </Button>
          <ViewToggleButton
            active={view === VIEW.TABLE}
            onClick={() => setView(VIEW.TABLE)}
            icon={TableIcon}
          >
            Table
          </ViewToggleButton>
          <ViewToggleButton
            active={view === VIEW.CARDS}
            onClick={() => setView(VIEW.CARDS)}
            icon={LayoutGrid}
          >
            Cards
          </ViewToggleButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total Submissions"
          value={stats.total}
          icon={Users}
          gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
        />
        <StatTile
          label="Processed"
          value={stats.processed}
          icon={CheckCircle2}
          gradient="bg-gradient-to-br from-emerald-500 to-green-500"
        />
        <StatTile
          label="Pending Review"
          value={stats.pending}
          icon={Clock}
          gradient="bg-gradient-to-br from-emerald-400 via-amber-400 to-orange-500"
        />
        <StatTile
          label="This Week"
          value={stats.thisWeek}
          icon={Calendar}
          gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
        />
      </div>

      {/* Filters */}
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 p-5 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-50" />
        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-1 sm:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-full border-border/50 bg-background/50 pl-9 transition-colors focus:bg-background"
            />
          </div>
          <Select value={sessionFilter} onValueChange={(v) => { setSessionFilter(v); setPage(1); }}>
            <SelectTrigger className="rounded-full border-border/50 bg-background/50 transition-colors focus:bg-background text-xs">
              <SelectValue placeholder="All Sessions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {meta ? Object.entries(meta.session_options).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              )) : mockSessionOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kinderFilter} onValueChange={(v) => { setKinderFilter(v); setPage(1); }}>
            <SelectTrigger className="rounded-full border-border/50 bg-background/50 transition-colors focus:bg-background text-xs">
              <SelectValue placeholder="All Kinder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kinder</SelectItem>
              {meta ? Object.entries(meta.kinder_programs).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              )) : mockKinderOptions.map((k) => (
                <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="rounded-full border-border/50 bg-background/50 transition-colors focus:bg-background text-xs"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="rounded-full border-border/50 bg-background/50 transition-colors focus:bg-background text-xs"
          />
        </div>
      </div>
      {/* Content */}
      {isLoading ? (
        <PageLoader label="Loading submissions…" />
      ) : (
        <>
          {view === VIEW.TABLE ? (
            <TableView rows={submissions} onView={setOpenId} meta={meta} />
          ) : (
            <CardsView rows={submissions} onView={setOpenId} meta={meta} />
          )}

          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-2 pt-4">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{pagination.count}</span> of <span className="font-medium">{pagination.total}</span> results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                      className="h-8 w-8 rounded-full p-0"
                    >
                      {p}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-full"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ReEnrollmentDetailsModal
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
        submission={openSubmission}
        onPrint={handlePrint}
        meta={meta}
      />

      <SendReEnrollmentEmailModal open={emailOpen} onOpenChange={setEmailOpen} />

      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="mb-2 text-2xl font-bold text-primary">Select a Form</DialogTitle>
            <p className="mt-0 text-sm text-muted-foreground">Choose a form below to proceed.</p>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2 py-2">
            {isLoadingFormOptions ? (
              <div className="p-8">
                <PageLoader label="Loading forms…" size="sm" />
              </div>
            ) : formOptions?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {formOptions.map((form) => (
                  <button
                    key={form.slug}
                    onClick={() => {
                      window.open(form.url, "_blank");
                    }}
                    className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/20 p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">{form.name}</h4>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-[250px]">{form.url}</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-primary/20 group-hover:text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No forms available at the moment.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TableView({ rows, onView, meta }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg">
      <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-primary/90 to-primary/70 px-6 py-4 text-primary-foreground backdrop-blur-md">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <TableIcon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold tracking-tight">Re-Enrollment Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-16 font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Child Name</TableHead>
              <TableHead className="font-semibold">Parent Email</TableHead>
              <TableHead className="text-center font-semibold">Current Days</TableHead>
              <TableHead className="text-center font-semibold">Requested Days</TableHead>
              <TableHead className="text-center font-semibold">Session</TableHead>
              <TableHead className="text-center font-semibold">Kinder</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const submitted = formatSubmittedAt(r.submittedAt);
              return (
                <TableRow key={r.id} className="group hover:bg-muted/40 transition-colors">
                  <TableCell className="font-semibold text-muted-foreground">#{r.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.childName} />
                      <div>
                        <div className="font-semibold text-foreground">{r.childName}</div>
                        <div className="text-xs text-muted-foreground">{formatDob(r.dob)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={`mailto:${r.parentEmail}`} className="text-sm text-primary transition-colors hover:text-primary/80 hover:underline">
                      {r.parentEmail}
                    </a>
                  </TableCell>
                  <TableCell><CurrentDayChips days={r.currentDays} /></TableCell>
                  <TableCell><DayChips days={r.requestedDays} /></TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded-md bg-info/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-info">
                      {meta?.session_options[r.session] || r.session}
                    </span>
                  </TableCell>
                  <TableCell className="text-center"><KinderBadge value={r.kinder} meta={meta} /></TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-foreground">{submitted.date}</div>
                    <div className="text-xs text-muted-foreground">{submitted.time}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 transition-colors hover:bg-primary/10 hover:text-primary" onClick={() => onView(r.id)}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50 transition-colors hover:bg-primary/10 hover:text-primary" onClick={() => onView(r.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <TableIcon className="h-8 w-8 opacity-20" />
                    <span>No submissions match your filters.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CardsView({ rows, onView, meta }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const submitted = formatSubmittedAt(r.submittedAt);
        return (
          <div key={r.id} className="group overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-slate-700 to-slate-500 px-6 py-4 text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold tracking-tight">{r.childName}</h3>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-muted/30 p-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold text-foreground">{formatDob(r.dob)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Submitted</p>
                  <p className="font-semibold text-foreground">{submitted.date}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Parent Email</p>
                <a href={`mailto:${r.parentEmail}`} className="font-medium text-primary transition-colors hover:text-primary/80 hover:underline">
                  {r.parentEmail}
                </a>
              </div>
              <div className="space-y-3 border-y border-border/50 py-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Days (2025)</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {r.currentDays.map((d) => (
                      <span key={d} className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requested Days (2026)</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {r.requestedDays.map((d) => (
                      <span key={d} className="rounded-md bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground shadow-sm">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md bg-info/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-info">
                  {meta?.session_options[r.session] || r.session}
                </span>
                {r.kinder && r.kinder !== "not_attending" && r.kinder !== "Not Attending" && (
                  <span className="inline-flex items-center"><KinderBadge value={r.kinder} meta={meta} /></span>
                )}
              </div>
              {r.holidayPlans && (
                <div className="rounded-xl bg-muted/20 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Holiday Plans</p>
                  <p className="mt-1 text-sm text-foreground/90">{r.holidayPlans}</p>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-full border-primary/20 bg-primary/5 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50" 
                onClick={() => onView(r.id)}
              >
                <Eye className="mr-2 h-4 w-4" /> View Details
              </Button>
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="col-span-full flex flex-col items-center justify-center rounded-3xl border border-dashed p-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Users className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No submissions match your filters.</p>
        </div>
      )}
    </div>
  );
}