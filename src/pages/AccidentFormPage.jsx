import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  CalendarDays,
  UserCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { AccidentFormView } from "@/components/accident/AccidentFormView";
import { AccidentReadOnlyView } from "@/components/accident/AccidentReadOnlyView";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { useEffect } from "react";
import { accidentService } from "@/services/daily-operations/accidentService";

const seedRecords = [
  {
    id: "a1",
    childId: "1",
    recorderName: "Deepti",
    incidentDate: "2026-04-25",
    createdAt: "2026-04-29",
  },
  {
    id: "a2",
    childId: "3",
    recorderName: "Mia Chen",
    incidentDate: "2026-04-12",
    createdAt: "2026-04-29",
  },
  {
    id: "a3",
    childId: "5",
    recorderName: "Daniel Park",
    incidentDate: "2026-04-03",
    createdAt: "2026-04-29",
  },
];

function fmtDDMMYYYY(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y) return iso;
  return `${d}.${m}.${y}`;
}

export default function AccidentFormPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);
  
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading } = useChildrenStore();

  const user = useAuthStore((s) => s.user);

  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState({ view: "list" }); // list | create | edit | view
  const [confirmId, setConfirmId] = useState(null);

  const toFormData = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    return fd;
  };

  const fetchAccidents = async () => {
    if (!activeCentreId || !activeRoomId) return;
    setIsLoadingList(true);
    try {
      const res = await accidentService.getAccidentList(toFormData({
        centerid: activeCentreId,
        roomid: activeRoomId,
        date: date,
      }));
      
      if (res.data.success && res.data.data.accidents) {
        setRecords(res.data.data.accidents.map(a => ({
          id: a.id,
          childName: a.child_name,
          recorderName: a.username,
          incidentDate: a.incident_date,
          roomId: a.roomid,
          // created_at is not in list, we'll get it from details
        })));
      }
    } catch (error) {
      console.error("Failed to fetch accidents", error);
      toast.error("Failed to load accident list");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, [activeCentreId, activeRoomId, date]);

  const fetchDetails = async (id, targetView) => {
    setIsLoadingDetails(true);
    try {
      const res = await accidentService.getAccidentDetails(toFormData({ id }));
      if (res.data.status && res.data.data) {
        const d = res.data.data;
        
        // Map nature fields (abrasion: 1, rash: 1, etc.) to an array of labels
        const natureKeys = [
          "abrasion", "allergic_reaction", "amputation", "anaphylaxis", "asthma",
          "bite_wound", "broken_bone", "burn", "choking", "concussion", "crush",
          "cut", "drowning", "eye_injury", "electric_shock", "infectious_disease",
          "high_temperature", "ingestion", "internal_injury", "poisoning", "rash",
          "respiratory", "seizure", "sprain", "stabbing", "tooth", "venomous_bite", "other"
        ];
        const natures = natureKeys
          .filter(k => d[k] === 1)
          .map(k => k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()));

        const mapped = {
          id: d.id,
          recorderName: d.person_name,
          recorderPosition: d.person_role,
          serviceName: d.service_name,
          recordDate: d.made_record_date,
          recordTime: d.made_record_time,
          recorderSignature: d.made_person_sign,
          childId: d.childid,
          childName: d.child_name,
          childDob: d.child_dob,
          childAge: d.child_age,
          childGender: d.child_gender,
          incidentDate: d.incident_date,
          incidentTime: d.incident_time,
          serviceLocation: d.incident_location,
          incidentLocation: d.location_of_incident,
          witnessName: d.witness_name,
          witnessDate: d.witness_date,
          witnessSignature: d.witness_sign,
          details: d.details_injury,
          circumstances: d.circumstances_leading,
          natures,
          actionDetails: d.action_taken,
          emergencyAttended: d.emrg_serv_attend,
          emergencyContactedTime: d.emrg_serv_time,
          emergencyArrivedTime: d.emrg_serv_arrived,
          medicalSought: d.med_attention,
          yesDetails: d.med_attention_details,
          preventionSteps: d.provideDetails_minimise,
          parentName: d.parent1_name,
          parentDate: d.carers_date,
          parentTime: d.carers_time,
          directorName: d.director_educator_coordinator,
          directorDate: d.educator_date,
          directorTime: d.educator_time,
          otherAgency: d.other_agency,
          otherAgencyDate: d.other_agency_date,
          otherAgencyTime: d.other_agency_time,
          regulatoryAuthority: d.regulatory_authority,
          regDate: d.regulatory_authority_date,
          regTime: d.regulatory_authority_time,
          ackName: d.ack_parent_name,
          ackDate: d.ack_date,
          ackTime: d.ack_time,
          finalSignature: d.final_sign,
          additionalNotes: d.add_notes,
          createdAt: d.added_at,
        };

        setSelectedRecord(mapped);
        setMode({ view: targetView, id });
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
      toast.error("Failed to load accident details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => r.childName.toLowerCase().includes(q));
  }, [records, search]);

  const handleCreate = (data) => {
    const id = crypto.randomUUID();
    setRecords((p) => [
      { id, ...data, createdAt: new Date().toISOString().slice(0, 10) },
      ...p,
    ]);
    toast.success("Accident record created.");
    setMode({ view: "list" });
  };

  const handleUpdate = (data) => {
    setRecords((p) => p.map((r) => (r.id === mode.id ? { ...r, ...data } : r)));
    toast.success("Accident record updated.");
    setMode({ view: "list" });
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== confirmId));
    toast.success("Record deleted.");
    setConfirmId(null);
  };

  // Form views
  if (mode.view === "create") {
    return (
      <AccidentFormView
        mode="create"
        onCancel={() => setMode({ view: "list" })}
        onSubmit={handleCreate}
      />
    );
  }
  if (mode.view === "edit") {
    return (
      <AccidentFormView
        mode="edit"
        initial={selectedRecord}
        onCancel={() => setMode({ view: "list" })}
        onSubmit={handleUpdate}
      />
    );
  }
  if (mode.view === "view") {
    return (
      <AccidentReadOnlyView
        record={selectedRecord}
        onBack={() => setMode({ view: "list" })}
        onEdit={() => setMode({ view: "edit", id: selectedRecord.id })}
      />
    );
  }

  // List view
  return (
    <div>
      <PageHeader
        title="Accident Forms"
        description="Incident, injury, trauma and illness records"
        breadcrumbs={[{ label: "Accident Forms" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Centre" />
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
              <SelectTrigger className="h-9 w-[180px]">
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
            <Button onClick={() => setMode({ view: "create" })}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Accident
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by child name…"
            className="h-10 pl-9"
          />
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 w-[180px]"
        />
      </div>

      {isLoadingList || isLoadingDetails ? (
        <div className="py-20 text-center text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Accident Records</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click “Add New Accident” to create your first record.
          </p>
          <Button className="mt-5" onClick={() => setMode({ view: "create" })}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Accident
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <h3 className="text-lg font-bold text-foreground">{r.childName}</h3>
              {r.roomName && (
                <p className="mt-0.5 text-xs text-muted-foreground">{r.roomName}</p>
              )}

              <dl className="mt-4 space-y-2 text-sm">
                <Row icon={UserCircle2} label="Created By" value={r.recorderName || user?.name || "Unknown"} />
                <Row icon={CalendarDays} label="Incident Date" value={fmtDDMMYYYY(r.incidentDate)} />
                <Row icon={CalendarDays} label="Created At" value={fmtDDMMYYYY(r.createdAt)} />
              </dl>

              <div className="mt-5 flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 text-primary hover:bg-primary/10"
                    onClick={() => fetchDetails(r.id, "view")}
                    aria-label="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => fetchDetails(r.id, "edit")}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-9 w-9"
                  onClick={() => setConfirmId(r.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this accident record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold text-foreground">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}
