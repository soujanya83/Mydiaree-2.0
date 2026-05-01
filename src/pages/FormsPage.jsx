import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Mail, Table as TableIcon, LayoutGrid,
  Users, CheckCircle2, Clock, Calendar, Search, Eye, MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  initialSubmissions, sessionOptions, kinderOptions, dayShort,
  formatSubmittedAt, formatDob,
} from "@/components/forms/reEnrollmentData";
import ReEnrollmentDetailsModal from "@/components/forms/ReEnrollmentDetailsModal";
import SendReEnrollmentEmailModal from "@/components/forms/SendReEnrollmentEmailModal";

const VIEW = { FORM: "form", TABLE: "table", CARDS: "cards" };

function StatTile({ label, value, icon: Icon, gradient }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl px-6 py-5 text-white shadow-md",
      gradient
    )}>
      <div className="flex flex-col items-center justify-center text-center">
        <Icon className="mb-2 h-6 w-6 opacity-90" />
        <p className="text-3xl font-bold leading-tight">{value}</p>
        <p className="mt-1 text-xs font-medium uppercase tracking-wider opacity-90">{label}</p>
      </div>
    </div>
  );
}

function ViewToggleButton({ active, onClick, icon: Icon, children, color = "primary" }) {
  const colorMap = {
    primary: "bg-primary text-primary-foreground",
    info: "bg-info text-info-foreground",
    teal: "bg-primary text-primary-foreground",
  };
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className={cn(active && colorMap[color], "rounded-full px-4")}
    >
      <Icon className="h-4 w-4" />
      {children}
    </Button>
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

function KinderBadge({ value }) {
  const label = kinderOptions.find((k) => k.value === value)?.label?.replace(" at Nextgen", "") || value;
  if (value === "Not Attending" || !value) {
    return <span className="text-sm text-muted-foreground">None</span>;
  }
  if (value === "Unfunded") {
    return (
      <Badge className="bg-warning text-warning-foreground hover:bg-warning">UNFUNDED</Badge>
    );
  }
  return (
    <Badge className="bg-success text-success-foreground hover:bg-success uppercase">
      {value}
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
  const [submissions] = useState(initialSubmissions);
  const [view, setView] = useState(VIEW.TABLE);
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [kinderFilter, setKinderFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [openId, setOpenId] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const stats = useMemo(() => {
    const total = submissions.length;
    const processed = submissions.filter((s) => s.status === "processed").length;
    const pending = submissions.filter((s) => s.status !== "processed").length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = submissions.filter((s) => new Date(s.submittedAt).getTime() >= weekAgo).length;
    return { total, processed, pending, thisWeek };
  }, [submissions]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.childName.toLowerCase().includes(q) &&
            !s.parentEmail.toLowerCase().includes(q)) return false;
      }
      if (sessionFilter !== "all" && s.session !== sessionFilter) return false;
      if (kinderFilter !== "all" && s.kinder !== kinderFilter) return false;
      if (dateFilter) {
        const d = new Date(s.submittedAt).toISOString().slice(0, 10);
        if (d !== dateFilter) return false;
      }
      return true;
    });
  }, [submissions, search, sessionFilter, kinderFilter, dateFilter]);

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
            onClick={() => navigate("/forms/re-enrollment")}
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
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by child name or parent email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sessionFilter} onValueChange={setSessionFilter}>
            <SelectTrigger><SelectValue placeholder="All Sessions" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              {sessionOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kinderFilter} onValueChange={setKinderFilter}>
            <SelectTrigger><SelectValue placeholder="All Kinder" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kinder</SelectItem>
              {kinderOptions.map((k) => (
                <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {view === VIEW.TABLE ? (
        <TableView rows={filtered} onView={setOpenId} />
      ) : (
        <CardsView rows={filtered} onView={setOpenId} />
      )}

      <ReEnrollmentDetailsModal
        open={!!openId}
        onOpenChange={(o) => !o && setOpenId(null)}
        submission={openSubmission}
      />

      <SendReEnrollmentEmailModal open={emailOpen} onOpenChange={setEmailOpen} />
    </div>
  );
}

function TableView({ rows, onView }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 text-white">
        <TableIcon className="h-4 w-4" />
        <h3 className="text-sm font-semibold">Re-Enrollment Submissions</h3>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Child Name</TableHead>
              <TableHead>Parent Email</TableHead>
              <TableHead className="text-center">Current Days</TableHead>
              <TableHead className="text-center">Requested Days</TableHead>
              <TableHead className="text-center">Session</TableHead>
              <TableHead className="text-center">Kinder</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const submitted = formatSubmittedAt(r.submittedAt);
              return (
                <TableRow key={r.id} className="hover:bg-muted/30">
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
                    <a href={`mailto:${r.parentEmail}`} className="text-sm text-primary hover:underline">
                      {r.parentEmail}
                    </a>
                  </TableCell>
                  <TableCell><CurrentDayChips days={r.currentDays} /></TableCell>
                  <TableCell><DayChips days={r.requestedDays} /></TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center rounded bg-info px-2 py-1 text-[10px] font-bold uppercase text-info-foreground">
                      {r.session}
                    </span>
                  </TableCell>
                  <TableCell className="text-center"><KinderBadge value={r.kinder} /></TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-foreground">{submitted.date}</div>
                    <div className="text-xs text-muted-foreground">{submitted.time}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onView(r.id)}>
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onView(r.id)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  No submissions match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CardsView({ rows, onView }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => {
        const submitted = formatSubmittedAt(r.submittedAt);
        return (
          <div key={r.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
            <div className="flex items-center gap-2 bg-gradient-to-r from-slate-600 to-slate-500 px-5 py-3 text-white">
              <Users className="h-4 w-4" />
              <h3 className="text-sm font-semibold">{r.childName}</h3>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{formatDob(r.dob)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-semibold">{submitted.date}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Parent Email</p>
                <p className="font-medium text-primary">{r.parentEmail}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Current Days (2025)</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.currentDays.map((d) => (
                    <span key={d} className="rounded bg-warning/30 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-foreground">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Requested Days (2026)</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {r.requestedDays.map((d) => (
                    <span key={d} className="rounded bg-warning/30 px-2 py-0.5 text-[10px] font-bold uppercase text-warning-foreground">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="inline-flex items-center rounded bg-info px-2 py-1 text-[10px] font-bold uppercase text-info-foreground">
                  {r.session}
                </span>
                {r.kinder && r.kinder !== "Not Attending" && (
                  <span className="ml-2 inline-flex items-center"><KinderBadge value={r.kinder} /></span>
                )}
              </div>
              {r.holidayPlans && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Holiday Plans</p>
                  <p className="mt-1 text-sm">{r.holidayPlans}</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full rounded-full" onClick={() => onView(r.id)}>
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
            </div>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="col-span-full rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No submissions match your filters.
        </div>
      )}
    </div>
  );
}