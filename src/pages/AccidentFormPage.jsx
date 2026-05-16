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

const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

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
      const res = await accidentService.getAccidentList(
        toFormData({
          centerid: activeCentreId,
          roomid: activeRoomId,
          date: date,
        }),
      );

      if (res.data.success && res.data.data.accidents) {
        setRecords(
          res.data.data.accidents.map((a) => ({
            id: a.id,
            childName: a.child_name,
            childGender: a.child_gender,
            ackParentName: a.ack_parent_name,
            recorderName: a.username,
            incidentDate: a.incident_date,
            roomId: a.roomid,
          })),
        );
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
          "abrasion",
          "allergic_reaction",
          "amputation",
          "anaphylaxis",
          "asthma",
          "bite_wound",
          "broken_bone",
          "burn",
          "choking",
          "concussion",
          "crush",
          "cut",
          "drowning",
          "eye_injury",
          "electric_shock",
          "infectious_disease",
          "high_temperature",
          "ingestion",
          "internal_injury",
          "poisoning",
          "rash",
          "respiratory",
          "seizure",
          "sprain",
          "stabbing",
          "tooth",
          "venomous_bite",
          "other",
        ];
        const natures = natureKeys
          .filter((k) => d[k] === 1)
          .map((k) => k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));

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

  const mapToApiPayload = (data) => {
    const payload = {
      centerid: activeCentreId,
      roomid: activeRoomId,
      childid: data.childId,
      child_name:
        children.find((c) => String(c.id) === String(data.childId))?.name || data.childName || "",
      child_dob: data.childDob,
      child_age: data.childAge,
      gender: data.childGender?.toLowerCase(),
      person_name: data.recorderName,
      person_role: data.recorderPosition,
      date: data.recordDate,
      time: data.recordTime,
      incident_date: data.incidentDate,
      incident_time: data.incidentTime,
      incident_location: data.serviceLocation,
      location_of_incident: data.incidentLocation,
      witness_name: data.witnessName,
      witness_date: data.witnessDate,
      gen_actyvt: data.details,
      cause: data.circumstances,
      missing_unaccounted: data.missingCircumstances,
      taken_removed: data.removedCircumstances,
      action_taken: data.actionDetails,
      med_attention_details: data.yesDetails,
      prevention_step_1: data.preventionSteps,
      emrg_serv_attend: data.emergencyAttended === "yes" ? "yes" : "no",
      med_attention: data.medicalSought === "yes" ? "yes" : "no",

      parent1_name: data.parentName,
      contact1_date: data.parentDate,
      contact1_time: data.parentTime,

      responsible_person_name: data.directorName,
      nsv_date: data.directorDate,
      nsv_time: data.directorTime,

      otheragency: data.otherAgency,
      enor_date: data.otherAgencyDate,
      enor_time: data.otherAgencyTime,

      regulatoryauthority: data.regulatoryAuthority,
      enra_date: data.regDate,
      enra_time: data.regTime,

      ack_parent_name: data.ackName,
      ack_date: data.ackDate,
      ack_time: data.ackTime,

      add_notes: data.additionalNotes,
      person_sign: data.recorderSignature,
      witness_sign: data.witnessSignature,
      final_sign: data.finalSignature,
    };

    const natureMap = {
      "Abrasion / Scrape": "abrasion",
      "Allergic Reaction": "allergic_reaction",
      Amputation: "amputation",
      Anaphylaxis: "anaphylaxis",
      "Asthma / Respiratory": "asthma",
      "Bite Wound": "bite_wound",
      "Broken Bone / Fracture / Dislocation": "broken_bone",
      "Burn / Sunburn": "burn",
      Choking: "choking",
      Concussion: "concussion",
      "Crush / Jam": "crush",
      "Cut / Open Wound": "cut",
      "Drowning (Nonfatal)": "drowning",
      "Eye Injury": "eye_injury",
      "Electric Shock": "electric_shock",
      "High Temperature": "high_temperature",
      "Infectious Disease": "infectious_disease",
      "Ingestion / Inhalation / Insertion": "ingestion",
      "Internal Injury / Infection": "internal_injury",
      Poisoning: "poisoning",
      Rash: "rash",
      Respiratory: "respiratory",
      "Seizure / Unconscious / Convulsion": "seizure",
      "Sprain / Swelling": "sprain",
      "Stabbing / Piercing": "stabbing",
      Tooth: "tooth",
      "Venomous Bite / Sting": "venomous_bite",
      "Other (Please specify)": "other",
    };

    Object.keys(natureMap).forEach((label) => {
      if (data.natures?.includes(label)) {
        payload[natureMap[label]] = "1";
      } else {
        payload[natureMap[label]] = "0";
      }
    });

    if (mode.id) {
      payload.id = mode.id;
    }

    return payload;
  };

  const handleCreate = async (data) => {
    try {
      const payload = mapToApiPayload(data);
      const res = await accidentService.saveAccident(toFormData(payload));
      if (res.data.status) {
        toast.success("Accident record created.");
        fetchAccidents();
        setMode({ view: "list" });
      } else {
        toast.error(res.data.message || "Failed to create record");
      }
    } catch (error) {
      console.error("Failed to create accident", error);
      toast.error("Failed to create accident record");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const payload = mapToApiPayload(data);
      const res = await accidentService.saveAccident(toFormData(payload));
      if (res.data.status) {
        toast.success("Accident record updated.");
        fetchAccidents();
        setMode({ view: "list" });
      } else {
        toast.error(res.data.message || "Failed to update record");
      }
    } catch (error) {
      console.error("Failed to update accident", error);
      toast.error("Failed to update accident record");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await accidentService.deleteAccident(toFormData({ id: confirmId }));
      if (res.data.status) {
        toast.success("Record deleted.");
        fetchAccidents();
        setConfirmId(null);
      } else {
        toast.error(res.data.message || "Failed to delete record");
      }
    } catch (error) {
      console.error("Failed to delete accident", error);
      toast.error("Failed to delete record");
    }
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm backdrop-blur transition-all hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 ring-primary/30 transition-opacity group-hover:opacity-100" />
              <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-primary/5 blur-2xl transition-all duration-500 group-hover:bg-primary/10" />

              <div className="relative flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <UserCircle2 className="h-3 w-3" />
                    Accident Record
                  </div>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                    {r.childName}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    {r.childGender ? (
                      <span className="capitalize text-primary/80">{r.childGender}</span>
                    ) : (
                      <span className="italic text-muted-foreground/60">Gender Unspecified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative mt-5 space-y-2.5 flex-grow">
                <Row
                  icon={UserCircle2}
                  label="Created By"
                  value={r.recorderName || user?.name || "Unknown"}
                />
                <Row
                  icon={CalendarDays}
                  label="Incident Date"
                  value={fmtDDMMYYYY(r.incidentDate)}
                />
                <Row icon={ClipboardList} label="Parent Ack" value={r.ackParentName || "Pending"} />
              </div>

              <div className="relative mt-5 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
                <button
                  type="button"
                  onClick={() => fetchDetails(r.id, "view")}
                  title="View"
                  className={CARD_PRIMARY_ACTION_CLASSES}
                  style={CARD_PRIMARY_ACTION_STYLE}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => fetchDetails(r.id, "edit")}
                  title="Edit"
                  className={CARD_PRIMARY_ACTION_CLASSES}
                  style={CARD_PRIMARY_ACTION_STYLE}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmId(r.id)}
                  title="Delete"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-700 active:scale-90 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
    <div className="flex items-center gap-2.5 text-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="text-xs font-medium text-muted-foreground w-24">{label}</span>
      <span className="flex-1 truncate text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
