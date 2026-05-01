import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users, Target, Calendar, Clock, Eye, ArrowLeft, ListChecks,
  CalendarCheck, Search, CheckCircle2, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { initialPtms } from "@/components/ptm/ptmData";
import ReschedulePtmModal from "@/components/ptm/ReschedulePtmModal";

function fmtLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}
function fmtSlot(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB").replace(/\//g, "-");
}

export default function PtmDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ptms, setPtms] = useState(initialPtms);
  const [showDetails, setShowDetails] = useState(true);
  const [search, setSearch] = useState("");
  const [rescheduleChild, setRescheduleChild] = useState(null);

  const ptm = ptms.find((p) => p.id === id);
  const filteredKids = useMemo(() => {
    if (!ptm) return [];
    const q = search.trim().toLowerCase();
    return q ? ptm.children.filter((c) => c.name.toLowerCase().includes(q)) : ptm.children;
  }, [ptm, search]);

  if (!ptm) {
    return (
      <div>
        <PageHeader title="PTM Not Found" breadcrumbs={[{ label: "PTM", to: "/ptm" }, { label: "Not Found" }]} />
        <Button onClick={() => navigate("/ptm")}><ArrowLeft className="h-4 w-4" /> Back</Button>
      </div>
    );
  }

  const updateChildSchedule = (childId, { date, slot }) => {
    setPtms((arr) =>
      arr.map((p) =>
        p.id !== ptm.id
          ? p
          : { ...p, children: p.children.map((c) => (c.id === childId ? { ...c, date, slot, status: "Rescheduled" } : c)) }
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="PTM Details"
        breadcrumbs={[{ label: "PTM", to: "/ptm" }, { label: ptm.title }]}
        actions={
          <Button variant="outline" onClick={() => navigate("/ptm")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      {/* Hero card */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex items-center gap-3 bg-primary px-6 py-4 text-primary-foreground">
          <Users className="h-6 w-6" />
          <h2 className="text-xl font-bold">{ptm.title}</h2>
        </div>

        <div className="space-y-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Target className="h-4 w-4" /> Objective
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowDetails((s) => !s)}>
              <Eye className="h-4 w-4" /> {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>
          <div className="rounded-lg border bg-background px-4 py-3 text-sm">{ptm.objective}</div>

          {showDetails && (
            <>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/80">
                <Calendar className="h-4 w-4" /> Date &amp; Time
              </div>
              <div className="rounded-xl bg-primary/20 p-8 text-center">
                <Calendar className="mx-auto h-10 w-10 text-foreground" />
                <h3 className="mt-3 text-2xl font-bold">{fmtLong(ptm.date)}</h3>
                <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" /> 09:00 AM - 10:00 AM
                </div>
                <p className="mt-3 text-xs text-foreground/70">ⓘ Default PTM Schedule</p>
              </div>
            </>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate("/ptm")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => document.getElementById("ptm-children")?.scrollIntoView({ behavior: "smooth" })}>
              <ListChecks className="h-4 w-4" /> My PTMs
            </Button>
          </div>
        </div>
      </div>

      {/* Children table */}
      <div id="ptm-children" className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-bold">
              PTM : <span className="text-primary">{ptm.title}</span>
            </h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[260px] rounded-full pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center">Child Name</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center">Slot</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Checkbox /> Action
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKids.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="text-center font-semibold">{c.name}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-primary/30 text-foreground">{fmtSlot(c.date)}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="border-primary/30 text-foreground">{c.slot}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="gap-1 bg-primary/80 hover:bg-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {c.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Checkbox />
                    <Button variant="outline" size="sm" onClick={() => setRescheduleChild(c)}>
                      <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredKids.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">No children found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ReschedulePtmModal
        open={!!rescheduleChild}
        onOpenChange={(o) => !o && setRescheduleChild(null)}
        child={rescheduleChild}
        onConfirm={(payload) => updateChildSchedule(rescheduleChild.id, payload)}
      />
    </div>
  );
}