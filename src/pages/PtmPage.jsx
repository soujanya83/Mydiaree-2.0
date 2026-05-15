import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, PlayCircle, Trash2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { initialPtms, ptmCenters } from "@/components/ptm/ptmData";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import PtmDetailsModal from "@/components/ptm/PtmDetailsModal";

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function PtmCard({ ptm, onClick, onDelete, canDelete = true }) {
  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl border-l-4 border-primary bg-gradient-to-br from-card to-muted/40 p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-foreground">{ptm.title}</h3>
        <Badge className="bg-primary/15 text-primary hover:bg-primary/20">{ptm.status}</Badge>
      </div>
      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-foreground/80">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">Date:</span>
          <span>{fmtDate(ptm.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/80">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-semibold">Created By:</span>
          <span>{ptm.createdBy}</span>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`absolute bottom-3 right-3 rounded-md p-1.5 text-muted-foreground opacity-70 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 ${!canDelete ? 'hidden' : ''}`}
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PtmPage() {
  const navigate = useNavigate();
  const [ptms, setPtms] = useState(initialPtms);
  const [center, setCenter] = useState(ptmCenters[0]);
  const [selected, setSelected] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.ptm;

  const filtered = useMemo(() => ptms.filter((p) => p.center === center), [ptms, center]);
  const upcoming = filtered.filter((p) => !p.attended);
  const attended = filtered.filter((p) => p.attended);

  const handleDelete = () => {
    setPtms((arr) => arr.filter((p) => p.id !== deleteId));
    setDeleteId(null);
    toast.success("PTM deleted successfully");
  };

  return (
    <div>
      <PageHeader
        title="PTM"
        description="Parent–Teacher Meetings: schedule, manage and review"
        breadcrumbs={[{ label: "PTM" }, { label: "View PTM" }]}
        actions={
          <>
            <Select value={center} onValueChange={setCenter}>
              <SelectTrigger className="w-[200px]">
                <PlayCircle className="h-4 w-4 text-primary" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ptmCenters.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {can(perms.add) && (
              <Button onClick={() => navigate("/ptm/create")}>
                <Plus className="h-4 w-4" /> Add New PTM
              </Button>
            )}
          </>
        }
      />

      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-xl font-bold">Upcoming PTMs</h2>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming PTMs.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcoming.map((p) => (
              <PtmCard
                key={p.id}
                ptm={p}
                onClick={() => { setSelected(p); setDetailsOpen(true); }}
                onDelete={() => setDeleteId(p.id)}
                canDelete={can(perms.delete)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-6 w-1 rounded-full bg-primary" />
          <h2 className="text-xl font-bold">Attended PTMs</h2>
        </div>
        {attended.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attended PTMs.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {attended.map((p) => (
              <PtmCard
                key={p.id}
                ptm={p}
                onClick={() => { setSelected(p); setDetailsOpen(true); }}
                onDelete={() => setDeleteId(p.id)}
                canDelete={can(perms.delete)}
              />
            ))}
          </div>
        )}
      </section>

      <PtmDetailsModal open={detailsOpen} onOpenChange={setDetailsOpen} ptm={selected} />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete PTM?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}